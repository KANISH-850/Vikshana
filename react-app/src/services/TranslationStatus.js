/**
 * TranslationStatus.js
 * 
 * A lightweight global event bus for the AutoTranslator to broadcast
 * its current state (idle / translating) to the Navbar indicator.
 * 
 * Using a simple EventEmitter pattern (no Redux/extra context) to
 * avoid re-rendering the entire React tree on status changes.
 */

const listeners = new Set();
let _isTranslating = false;
let _pendingCount  = 0;

export const TranslationStatus = {
    get isTranslating() { return _isTranslating; },
    get pendingCount()  { return _pendingCount; },

    setTranslating(translating, count = 0) {
        _isTranslating = translating;
        _pendingCount  = count;
        listeners.forEach(fn => fn({ translating, count }));
    },

    subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }
};

export default TranslationStatus;
