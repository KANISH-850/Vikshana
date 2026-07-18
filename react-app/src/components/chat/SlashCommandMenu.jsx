import React from 'react';
import styles from './SlashCommandMenu.module.css';

const SlashCommandMenu = ({ commands, onSelect }) => {
    if (!commands || commands.length === 0) return null;
    return (
        <div className={styles.menu}>
            {commands.map((c) => (
                <button key={c.command} type="button" className={styles.item} onClick={() => onSelect(c)}>
                    <span className={styles.cmd}>{c.command}</span>
                    <span className={styles.desc}>{c.description}</span>
                </button>
            ))}
        </div>
    );
};

export default SlashCommandMenu;
