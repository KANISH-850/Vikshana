import React from 'react';
import { FileText, Image, Video, Music, X, Eye } from 'lucide-react';
import styles from './AttachmentPreviewBar.module.css';

const getFileIcon = (file) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return <Image size={16} className={styles.iconImage} />;
    if (type.startsWith('video/')) return <Video size={16} className={styles.iconVideo} />;
    if (type.startsWith('audio/')) return <Music size={16} className={styles.iconAudio} />;
    return <FileText size={16} className={styles.iconDoc} />;
};

const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentPreviewBar = ({ files, onRemove }) => {
    if (!files || files.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.title}>Attached Evidence & Documents ({files.length}):</div>
            <div className={styles.grid}>
                {files.map((file, idx) => {
                    const isImage = file.type && file.type.startsWith('image/');
                    const previewUrl = isImage ? URL.createObjectURL(file) : null;

                    return (
                        <div key={idx} className={styles.card}>
                            {previewUrl ? (
                                <div className={styles.imageThumbWrap}>
                                    <img src={previewUrl} alt={file.name} className={styles.imageThumb} />
                                </div>
                            ) : (
                                <div className={styles.fileIconWrap}>{getFileIcon(file)}</div>
                            )}

                            <div className={styles.info}>
                                <div className={styles.filename} title={file.name}>
                                    {file.name}
                                </div>
                                <div className={styles.meta}>{formatSize(file.size)}</div>
                            </div>

                            <div className={styles.actions}>
                                {previewUrl && (
                                    <button
                                        type="button"
                                        className={styles.actionBtn}
                                        title="Preview"
                                        onClick={() => window.open(previewUrl, '_blank')}
                                    >
                                        <Eye size={13} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={`${styles.actionBtn} ${styles.removeBtn}`}
                                    title="Remove attachment"
                                    onClick={() => onRemove(idx)}
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttachmentPreviewBar;
