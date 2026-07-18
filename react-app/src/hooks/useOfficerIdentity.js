import { useState } from 'react';

const STORAGE_KEY = 'vikshana_officer_id';

/**
 * No real auth exists yet in this app (see AppContext's hardcoded officer
 * object). This generates and persists a stable per-browser id so
 * conversations have a consistent owner to scope against server-side. It's
 * a deliberate placeholder — swapping in real Catalyst Auth later only
 * needs `officerId` to come from the session instead of localStorage; every
 * consumer of this hook is unaffected.
 */
function readOrCreateOfficerId() {
    if (typeof window === 'undefined') return null;
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `officer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
}

export function useOfficerIdentity() {
    const [officerId] = useState(readOrCreateOfficerId);
    return { officerId };
}
