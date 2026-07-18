import React, { useCallback, useRef, useState } from 'react';
import { Send, Paperclip, Mic, Square, Loader2 } from 'lucide-react';
import SlashCommandMenu from './SlashCommandMenu';
import QuickActions from './QuickActions';
import { matchSlashCommands } from '../../utils/slashCommands';
import styles from './ChatInput.module.css';

const ChatInput = ({ onSend, onRunQuickAction, onFilesSelected, isStreaming, onStop, disabled }) => {
    const [value, setValue] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const slashMatches = value.startsWith('/') && !value.includes(' ') ? matchSlashCommands(value) : [];

    const submit = useCallback(() => {
        const text = value.trim();
        if (!text || disabled) return;
        onSend(text);
        setValue('');
    }, [value, disabled, onSend]);

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
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
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
            setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    return (
        <div className={styles.wrap}>
            <QuickActions onRun={onRunQuickAction} />
            <div
                className={`${styles.composer} ${isDragging ? styles.dragging : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                {slashMatches.length > 0 && (
                    <SlashCommandMenu
                        commands={slashMatches}
                        onSelect={(c) => setValue(c.needsArgs ? `${c.command} ` : c.command)}
                    />
                )}

                <div className={styles.inputRow}>
                    <button type="button" className={styles.iconBtn} onClick={() => fileInputRef.current && fileInputRef.current.click()} title="Attach file">
                        <Paperclip size={18} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        accept=".pdf,.docx,.txt,.csv,image/*,video/*,audio/*,.zip"
                        onChange={(e) => {
                            if (e.target.files.length > 0) onFilesSelected(Array.from(e.target.files));
                            e.target.value = '';
                        }}
                    />

                    <textarea
                        className={styles.textarea}
                        rows={1}
                        value={value}
                        placeholder="Ask anything about this investigation..."
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                    />

                    <button
                        type="button"
                        className={`${styles.iconBtn} ${isRecording ? styles.recording : ''}`}
                        onClick={toggleMic}
                        title="Voice input"
                    >
                        <Mic size={18} />
                    </button>

                    {isStreaming ? (
                        <button type="button" className={styles.stopBtn} onClick={onStop} title="Stop generation">
                            <Square size={14} /> Stop
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.sendBtn}
                            onClick={submit}
                            disabled={!value.trim() || disabled}
                            title="Send (Enter)"
                        >
                            {disabled ? <Loader2 size={18} className={styles.spin} /> : <Send size={18} />}
                        </button>
                    )}
                </div>
                <div className={styles.hint}>Enter to send · Shift+Enter for a new line · Type "/" for commands</div>
            </div>
        </div>
    );
};

export default ChatInput;
