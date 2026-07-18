import api from './api';

// Every call here uses the shared axios instance — non-streaming only.
// The one streaming call (sending a chat message) intentionally bypasses
// axios and uses raw `fetch` inside `hooks/useStreamingChat.js`, since axios
// has no browser streaming-reader support. Do not "fix" that back to axios.

export function listCases() {
    return api.get('/cases').then((r) => r.data.data);
}

export function getCaseSummary(caseId) {
    return api.get(`/cases/${caseId}/summary`).then((r) => r.data.data);
}

export function listWitnesses(caseId) {
    return api.get(`/cases/${caseId}/witnesses`).then((r) => r.data.data);
}

export function listSuspects(caseId) {
    return api.get(`/cases/${caseId}/suspects`).then((r) => r.data.data);
}

export function listCctv(caseId) {
    return api.get(`/cases/${caseId}/cctv`).then((r) => r.data.data);
}

export function listPhoneRecords(caseId) {
    return api.get(`/cases/${caseId}/phone-records`).then((r) => r.data.data);
}

export function listFinancialTransactions(caseId) {
    return api.get(`/cases/${caseId}/financial-transactions`).then((r) => r.data.data);
}

export function listTimeline(caseId) {
    return api.get(`/cases/${caseId}/timeline`).then((r) => r.data.data);
}

export function listConversations(caseId, officerId) {
    return api.get('/conversations', { params: { caseId, officerId } }).then((r) => r.data.data);
}

export function createConversation(caseId, officerId, title) {
    return api.post('/conversations', { caseId, officerId, title }).then((r) => r.data.data);
}

export function getConversation(conversationId) {
    return api.get(`/conversations/${conversationId}`).then((r) => r.data.data);
}

export function updateConversation(conversationId, patch) {
    return api.patch(`/conversations/${conversationId}`, patch).then((r) => r.data.data);
}

export function deleteConversation(conversationId) {
    return api.delete(`/conversations/${conversationId}`).then((r) => r.data);
}

/** Fallback / debug path — the real UI uses the streaming endpoint via useStreamingChat.js. */
export function sendMessageNonStreaming(conversationId, content, officerId) {
    return api
        .post(`/conversations/${conversationId}/messages?stream=false`, { content, officerId })
        .then((r) => r.data.data);
}

export function uploadAttachment(conversationId, caseId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    return api
        .post(`/conversations/${conversationId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000
        })
        .then((r) => r.data.data);
}

export function generateCaseReport(caseId) {
    return api.post('/reports/generate', { caseId }).then((r) => r.data.data);
}
