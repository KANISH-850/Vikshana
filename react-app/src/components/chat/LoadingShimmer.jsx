import React from 'react';
import styles from './LoadingShimmer.module.css';

const LoadingShimmer = ({ type = 'chat' }) => {
    if (type === 'sidebar') {
        return (
            <div className={styles.sidebarSkeleton}>
                <div className={`${styles.skeleton} ${styles.btnSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.searchSkeleton}`} />
                <div className={styles.listSkeleton}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className={`${styles.skeleton} ${styles.itemSkeleton}`} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatSkeletonContainer}>
            <div className={styles.messageRowLeft}>
                <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
                <div className={styles.bubbleSkeletonLeft}>
                    <div className={`${styles.skeleton} ${styles.textLineLong}`} />
                    <div className={`${styles.skeleton} ${styles.textLineMedium}`} />
                    <div className={`${styles.skeleton} ${styles.textLineShort}`} />
                </div>
            </div>

            <div className={styles.messageRowRight}>
                <div className={styles.bubbleSkeletonRight}>
                    <div className={`${styles.skeleton} ${styles.textLineMedium}`} />
                </div>
            </div>
        </div>
    );
};

export default LoadingShimmer;
