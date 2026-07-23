/**
 * AutoTranslator — Live Automatic DOM-Based NLP Translation
 *
 * HOW IT WORKS:
 *  1. When a non-English language is selected, a MutationObserver scans every
 *     text node added or changed in the document.
 *  2. English text nodes are collected into a debounced batch queue.
 *  3. Cached translations (localStorage) are applied INSTANTLY without an API call.
 *  4. Uncached strings are sent to the Catalyst Zia NLP API in batches of 25.
 *  5. A WeakSet (WRITING_NODES) marks nodes we are actively writing to, so the
 *     observer does NOT loop when we update nodeValue.
 *  6. A WeakMap (ORIGINAL_TEXT) stores the original English text of every node
 *     we translate, so switching back to English restores content correctly.
 *
 * WHY THIS WORKS WITH REACT:
 *  - React re-renders may reset text node values back to English.
 *  - The MutationObserver catches this reset (characterData / childList mutation).
 *  - If the reset text is in cache → applied instantly (no flicker).
 *  - If uncached → queued for API (brief English flash, then translates).
 *  - WRITING_NODES prevents the loop: observer fires, we skip nodes we're writing.
 *
 * EXPORTS:
 *  - AutoTranslator (default)  — mount once in App.js; renders null
 *  - useTranslateDynamic        — hook for components that need explicit control
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateTexts, getCached } from '../services/translationService';
import TranslationStatus from '../services/TranslationStatus';

// ── Tuning constants ──────────────────────────────────────────────────────────
const BATCH_SIZE     = 25;    // Max strings per Zia API call
const DEBOUNCE_MS    = 600;   // ms to wait before firing a batch
const INITIAL_SCAN_DELAY = 400; // ms after mount before first scan

// ── Tags whose text content must NEVER be translated ─────────────────────────
const SKIP_TAGS = new Set([
    'script', 'style', 'code', 'pre', 'noscript',
    'textarea', 'input', 'select', 'option',
    'svg', 'math', 'canvas', 'iframe'
]);

// ── Module-level state — survives re-renders ──────────────────────────────────

/** Nodes we are currently writing translated text to — prevents observer loop */
const WRITING_NODES = new WeakSet();

/** Original English text of every node we've translated — for restoration */
const ORIGINAL_TEXT = new WeakMap();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true if `text` is English content that should be translated.
 * 
 * Explicitly SKIPS:
 *  - FIR/case numbers (e.g. "FIR #5211900000553318")
 *  - Phone numbers
 *  - Pure numbers or percentages
 *  - Dates/times
 *  - Already-Indic text (Kannada, Hindi, Tamil characters)
 *  - URLs / email addresses
 *  - Very short tokens (< 3 chars) or very long (> 500 chars)
 *  - Single words that look like code identifiers (ALL_CAPS_UNDERSCORE)
 */
function isEnglishText(text) {
    if (!text) return false;
    const s = text.trim();

    // Length guards
    if (s.length < 3 || s.length > 500) return false;

    // Must contain at least one Latin letter
    if (!/[A-Za-z]/.test(s)) return false;

    // Already contains Kannada / Devanagari / Tamil / Arabic — skip
    if (/[\u0C80-\u0CFF\u0900-\u097F\u0B80-\u0BFF\u0600-\u06FF]/.test(s)) return false;

    // Skip URLs and emails
    if (/^https?:\/\//.test(s) || /@/.test(s)) return false;

    // Skip pure numbers, percentages, and number-heavy strings (e.g. "100", "89%", "3:15 AM")
    if (/^\d+[\d\s:.,/%+\-]+$/.test(s)) return false;

    // Skip FIR/case/CDR numbers: contain # followed by long number sequences
    if (/#\d{5,}/.test(s)) return false;

    // Skip phone numbers (various formats)
    if (/^\+?\d[\d\s\-().]{7,}$/.test(s)) return false;

    // Skip IP addresses, hex hashes
    if (/^[\da-f]{8,}$/i.test(s) || /^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return false;

    // Skip ALL_CAPS_UNDERSCORE identifiers (code/enum values)
    if (/^[A-Z][A-Z0-9_]{3,}$/.test(s)) return false;

    // Skip pure time strings like "3:15 AM", "21:45:00"
    if (/^\d{1,2}:\d{2}(:\d{2})?(\s?(AM|PM))?$/i.test(s)) return false;

    // Skip date strings like "Jul 21, 2026"
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/.test(s)) return false;

    // Skip version strings like "v2.4", "1.0.0"
    if (/^v?\d+\.\d+/.test(s)) return false;

    return true;
}


/**
 * Returns true if the element (or any ancestor) should be skipped.
 */
function shouldSkipElement(el) {
    if (!el) return true;
    const tag = el.tagName?.toLowerCase();
    if (SKIP_TAGS.has(tag)) return true;
    // Skip elements marked as no-translate
    if (el.closest?.('[data-no-translate]')) return true;
    // Skip input/contenteditable
    if (el.closest?.('input, textarea, [contenteditable="true"]')) return true;
    return false;
}

/**
 * Write translated text back to a node without triggering our own observer.
 */
function writeTranslated(node, translatedText) {
    if (!node.parentElement) return; // Node detached from DOM
    WRITING_NODES.add(node);
    node.nodeValue = translatedText;
    // Allow microtask queue to flush (mutation observer fires synchronously,
    // so by next microtask the observer has already seen and skipped this node)
    Promise.resolve().then(() => WRITING_NODES.delete(node));
}

// ── AutoTranslator Component ──────────────────────────────────────────────────

const AutoTranslator = () => {
    const { language } = useLanguage();
    const observerRef    = useRef(null);
    const queueRef       = useRef(new Map()); // Map<text, Set<TextNode>>
    const debounceRef    = useRef(null);
    const processingRef  = useRef(false);
    const langRef        = useRef(language);

    // Keep langRef in sync so async callbacks use the current language
    useEffect(() => { langRef.current = language; }, [language]);

    // ── Core: apply one batch of translations ────────────────────────────────
    const processBatch = useCallback(async () => {
        if (processingRef.current) return;
        if (queueRef.current.size === 0) return;

        const currentLang = langRef.current;
        if (currentLang === 'en') {
            queueRef.current.clear();
            return;
        }

        processingRef.current = true;

        // Snapshot the queue (new items can arrive while we process)
        const entries = Array.from(queueRef.current.entries());
        queueRef.current.clear();

        TranslationStatus.setTranslating(true, entries.length);


        // Split into cache-hit and cache-miss groups
        const toFetch = [];
        entries.forEach(([text, nodes]) => {
            const cached = getCached(text, currentLang);
            if (cached) {
                // Apply immediately from cache
                nodes.forEach(node => writeTranslated(node, cached));
            } else {
                toFetch.push([text, nodes]);
            }
        });

        if (toFetch.length === 0) {
            processingRef.current = false;
            TranslationStatus.setTranslating(false, 0);
            // Drain any items that arrived while we were processing
            if (queueRef.current.size > 0) {
                debounceRef.current = setTimeout(() => processBatch(), 50);
            }
            return;
        }

        // Split into batches of BATCH_SIZE
        for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
            if (langRef.current !== currentLang) break; // Language changed mid-flight

            const chunk = toFetch.slice(i, i + BATCH_SIZE);
            const texts = chunk.map(([t]) => t);

            try {
                const translated = await translateTexts(texts, currentLang);
                chunk.forEach(([originalText, nodes], idx) => {
                    const translatedText = translated[idx];
                    if (translatedText && typeof translatedText === 'string' && translatedText.trim()) {
                        nodes.forEach(node => {
                            if (langRef.current === currentLang) {
                                writeTranslated(node, translatedText);
                            }
                        });
                    }
                });
            } catch (err) {
                console.warn('[AutoTranslator] Batch API failed:', err.message);
            }
        }

        processingRef.current = false;
        TranslationStatus.setTranslating(false, 0);

        // Process any items that queued while we were in-flight
        if (queueRef.current.size > 0) {
            debounceRef.current = setTimeout(() => processBatch(), 100);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Core: queue a text node for translation ──────────────────────────────
    const enqueueNode = useCallback((textNode) => {
        const text = textNode.nodeValue;
        if (!isEnglishText(text)) return;
        if (shouldSkipElement(textNode.parentElement)) return;

        // Store original before we ever translate it
        if (!ORIGINAL_TEXT.has(textNode)) {
            ORIGINAL_TEXT.set(textNode, text.trim());
        }

        // Check cache first — apply synchronously so there's no English flash
        const cached = getCached(text.trim(), langRef.current);
        if (cached) {
            writeTranslated(textNode, cached);
            return;
        }

        // Queue for API call
        const key = text.trim();
        if (!queueRef.current.has(key)) {
            queueRef.current.set(key, new Set());
        }
        queueRef.current.get(key).add(textNode);

        // Debounce the batch fire
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => processBatch(), DEBOUNCE_MS);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Core: walk DOM tree and enqueue all text nodes ───────────────────────
    const walkDom = useCallback((root) => {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    // Skip if parent is an ignored tag
                    if (shouldSkipElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        let node;
        while ((node = walker.nextNode())) {
            enqueueNode(node);
        }
    }, [enqueueNode]);

    // ── Restore all nodes to original English ────────────────────────────────
    const restoreEnglish = useCallback(() => {
        // Disconnect observer first so we don't react to our own restores
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        queueRef.current.clear();
        processingRef.current = false;
        // The ORIGINAL_TEXT map can't be iterated (WeakMap), but
        // switching back to 'en' causes React to re-render and restore
        // text naturally. We just need to make sure React re-renders.
        // Force this by triggering a full re-scan of all components.
        // Since LanguageContext re-renders the tree, React will reset
        // all JSX-controlled text nodes. We just need to reload page
        // sections that used DOM manipulation.
        // Best approach: do a targeted force-update by navigating to
        // current route (no actual navigation, just triggers re-render).
        // Actually — the cleanest is: we walk DOM and reset any nodes
        // whose current value is Kannada/non-English back to their cache key.
        // Since ORIGINAL_TEXT is a WeakMap we can't iterate, we do a DOM walk.
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null
        );
        let node;
        while ((node = walker.nextNode())) {
            const orig = ORIGINAL_TEXT.get(node);
            if (orig && node.nodeValue !== orig) {
                writeTranslated(node, orig);
            }
        }
    }, []);

    // ── Main effect: start/stop based on language ────────────────────────────
    useEffect(() => {
        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        queueRef.current.clear();
        processingRef.current = false;

        if (language === 'en') {
            restoreEnglish();
            return;
        }

        // ── Set up MutationObserver ──────────────────────────────────────────
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    // New nodes added to DOM (React rendered new content)
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            if (WRITING_NODES.has(node)) return; // We wrote this
                            enqueueNode(node);
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            walkDom(node);
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    // Text node value changed (React re-rendered existing text)
                    const node = mutation.target;
                    if (WRITING_NODES.has(node)) return; // We wrote this — skip
                    enqueueNode(node);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        observerRef.current = observer;

        // Initial full-page scan (delayed slightly to let React finish its render)
        const scanTimer = setTimeout(() => walkDom(document.body), INITIAL_SCAN_DELAY);

        return () => {
            clearTimeout(scanTimer);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            observer.disconnect();
        };
    }, [language, enqueueNode, walkDom, restoreEnglish]);

    return null; // No UI — pure side-effect component
};

export default AutoTranslator;

// ── useTranslateDynamic hook ─────────────────────────────────────────────────
// (Re-exported for components that want explicit control over specific strings)

/**
 * Hook: translate an array of dynamic strings whenever the language changes.
 * This is a lighter-weight alternative to the AutoTranslator for components
 * that have dynamic API-sourced content (e.g. Timeline events).
 *
 * @param {string[]} texts - Source English strings
 * @param {string}  [langOverride] - Optional explicit language code
 * @returns {{ translated: string[], loading: boolean }}
 */
export function useTranslateDynamic(texts = [], langOverride) {
    const { language: ctxLang } = useLanguage();
    const language = langOverride || ctxLang;
    const normTexts = texts.map(t => (t != null ? String(t) : ''));

    const initialTranslations = () => {
        if (language === 'en') return normTexts;
        return normTexts.map(t => {
            if (!t) return t;
            const cached = getCached(t, language);
            return cached !== null ? cached : t;
        });
    };

    const [translated, setTranslated] = useState(initialTranslations);
    const [loading, setLoading] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (language === 'en') { setTranslated(normTexts); return; }
        if (!normTexts.some(t => t && t.trim())) { setTranslated(normTexts); return; }

        const allCached = normTexts.every(t => !t || getCached(t, language) !== null);
        if (allCached) {
            setTranslated(normTexts.map(t => (t ? (getCached(t, language) || t) : t)));
            return;
        }

        setLoading(true);
        const toTranslate = normTexts.filter(Boolean);
        translateTexts(toTranslate, language).then(results => {
            if (!mountedRef.current) return;
            let ri = 0;
            setTranslated(normTexts.map(t => (!t ? t : results[ri++] || t)));
        }).catch(() => {}).finally(() => { if (mountedRef.current) setLoading(false); });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, JSON.stringify(normTexts)]);

    return { translated, loading };
}
