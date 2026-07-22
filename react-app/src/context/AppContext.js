import React, { createContext, useContext, useState } from 'react';
import { useOfficerIdentity } from '../hooks/useOfficerIdentity';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const { officerId } = useOfficerIdentity();
    const [officer, setOfficer] = useState({ name: 'Officer K', role: 'Lead Investigator', id: officerId });
    const [selectedCase, setSelectedCase] = useState(null);

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <AppContext.Provider value={{ theme, toggleTheme, officer, setOfficer, selectedCase, setSelectedCase }}>
            <div className={`app-container ${theme}-theme`}>
                {children}
            </div>
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
