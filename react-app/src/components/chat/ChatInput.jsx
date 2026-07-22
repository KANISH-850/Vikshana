import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Send, Paperclip, Mic, Square, Loader2, Image as ImageIcon } from 'lucide-react';
import SlashCommandMenu from './SlashCommandMenu';
import QuickActions from './QuickActions';
import AttachmentPreviewBar from './AttachmentPreviewBar';
import { matchSlashCommands } from '../../utils/slashCommands';
import styles from './ChatInput.module.css';

const ChatInput = ({ onSend, onRunQuickAction, onFilesSelected, isStreaming, onStop, disabled }) => {
    const [value, setValue] = useState('');
    const [stagedFiles, setStagedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const textareaRef = useRef(null);

    const slashMatches = value.startsWith('/') && !value.includes(' ') ? matchSlashCommands(value) : [];

    // Shortcuts listener (Ctrl+K focus, Ctrl+/ slash menu)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                textareaRef.current?.focus();
            } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setValue((prev) => (prev.startsWith('/') ? prev : `/${prev}`));
                textareaRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    const submit = useCallback(() => {
        const text = value.trim();
        if ((!text && stagedFiles.length === 0) || disabled) return;

        if (stagedFiles.length > 0) {
            onFilesSelected(stagedFiles);
            setStagedFiles([]);
        }

        if (text) {
            onSend(text);
            setValue('');
        }

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [value, stagedFiles, disabled, onSend, onFilesSelected]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setStagedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setStagedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
            e.target.value = '';
        }
    };

    const handleRemoveStagedFile = (idx) => {
        setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const toggleMic = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input is not supported in this browser.');
            return;
        }
        if (isRecording) {
            recognitionRef.current && recognitionRef.current.stop();
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map((r) => r[0].transcript).join(' ');
            setValue((prev) => {
                const next = prev ? `${prev} ${transcript}` : transcript;
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                    }
                }, 0);
                return next;
            });
        };
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    const isSendDisabled = (!value.trim() && stagedFiles.length === 0) || disabled;

    return (
        <div className={styles.wrap}>
            <QuickActions onRun={onRunQuickAction} />

            <div
                className={`${styles.composer} ${isDragging ? styles.dragging : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                {slashMatches.length > 0 && (
                    <SlashCommandMenu
                        commands={slashMatches}
                        onSelect={(c) => setValue(c.needsArgs ? `${c.command} ` : c.command)}
                    />
                )}

                {/* Staged Attachments Preview */}
                <AttachmentPreviewBar files={stagedFiles} onRemove={handleRemoveStagedFile} />

                <div className={styles.inputRow}>
                    {/* Attach/Upload Icon Buttons */}
                    <div className={styles.leftTools}>
                        <button
                            type="button"
                            className={styles.attachBtn}
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            title="Attach File / Evidence"
                        >
                            <Paperclip size={18} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            accept=".pdf,.docx,.txt,.csv,image/*,video/*,audio/*,.zip"
                            onChange={handleFileChange}
                        />

                        <button
                            type="button"
                            className={styles.attachBtn}
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.accept = 'image/*';
                                    fileInputRef.current.click();
                                }
                            }}
                            title="Attach Image"
                        >
                            <ImageIcon size={18} />
                        </button>
                    </div>

                    {/* Auto-expanding Textarea */}
                    <textarea
                        ref={textareaRef}
                        className={styles.textarea}
                        rows={1}
                        value={value}
                        placeholder="Ask Vikshana to investigate this case..."
                        onChange={(e) => {
                            setValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                    />

                    {/* Right Tools (Mic & Send/Stop Button) */}
                    <div className={styles.rightTools}>
                        <button
                            type="button"
                            className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`}
                            onClick={toggleMic}
                            title="Voice input"
                        >
                            <Mic size={18} />
                        </button>

                        {isStreaming ? (
                            <button type="button" className={styles.stopBtn} onClick={onStop} title="Stop generation">
                                <Square size={13} fill="currentColor" /> Stop
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={styles.sendBtn}
                                onClick={submit}
                                disabled={isSendDisabled}
                                title="Send message (Enter)"
                            >
                                {disabled ? <Loader2 size={16} className={styles.spin} /> : <Send size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className={styles.hintText}>
                Enter to send • Shift+Enter for new line • Ctrl+K focus
            </div>
        </div>
    );
};

export default ChatInput;
