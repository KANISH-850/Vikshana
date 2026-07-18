const CITATION_TYPES = 'Case|Victim|Suspect|Witness|CCTV|PhoneRecord|FinancialTransaction|TimelineEvent|Attachment';

/** Extracts `[Type #id]` citation markers (per investigationChatPrompt.js's citation instructions) out of AI response text. */
function extractCitations(text) {
    const re = new RegExp(`\\[(${CITATION_TYPES})\\s*#([\\w-]+)\\]`, 'g');
    const citations = [];
    const seen = new Set();
    let match;
    while ((match = re.exec(text)) !== null) {
        const [, type, refId] = match;
        const key = `${type}:${refId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        citations.push({ type, refId, label: `${type} #${refId}` });
    }
    return citations;
}

const TYPE_TO_COLLECTION = {
    Witness: 'witnesses',
    Suspect: 'suspects',
    CCTV: 'cctv',
    PhoneRecord: 'phoneRecords',
    FinancialTransaction: 'financialTransactions',
    TimelineEvent: 'timeline',
    Attachment: 'attachments'
};

function stripInternal(row) {
    const { CREATORID, MODIFIEDTIME, ...rest } = row;
    return rest;
}

/** Attaches the actual row (from RetrievalService's output) to each citation so the frontend can render a rich Evidence Card with no extra round-trip. */
function enrichCitations(citations, retrieved) {
    return citations.map((citation) => {
        const collection = TYPE_TO_COLLECTION[citation.type];
        const rows = (collection && retrieved[collection]) || [];
        const row = rows.find((r) => String(r.ROWID) === String(citation.refId));
        return { ...citation, details: row ? stripInternal(row) : null };
    });
}

module.exports = { extractCitations, enrichCitations };
