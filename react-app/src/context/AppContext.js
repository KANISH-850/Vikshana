import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const { user } = useAuth();
    
    const [officer, setOfficer] = useState({ name: '', role: '', id: null });

    useEffect(() => {
        if (user) {
            setOfficer({
                name: user.name || 'Officer',
                role: user.email || 'Investigator',
                id: user.id
            });
        } else {
            setOfficer({ name: '', role: '', id: null });
        }
    }, [user]);

    const [selectedCase, setSelectedCase] = useState(null);
    const [currentCase, setCurrentCase] = useState(null);

    const activeCaseId = currentCase?.caseId || selectedCase?.id || selectedCase?.caseId || 'CASE-2026-001';

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <AppContext.Provider value={{ 
            theme, toggleTheme, officer, setOfficer, 
            selectedCase, setSelectedCase, 
            currentCase, setCurrentCase,
            activeCaseId 
        }}>
            <div className={`app-container ${theme}-theme`}>
                {children}
            </div>
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
