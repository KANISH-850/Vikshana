const datastoreClient = require('../queries/datastoreClient');

/**
 * The legacy `Victim` table predates this feature and its real column
 * schema was never documented anywhere in the codebase (it's passed to
 * RelationshipAgent as opaque raw rows). We don't know for certain it has a
 * `case_id` column, so ZCQL scoping is attempted first and we fall back to
 * a best-effort client-side filter over a small unscoped page.
 */
async function getCaseVictims(req, caseId) {
    const scoped = await datastoreClient.getRowsByCase(req, 'Victim', caseId, { maxRows: 10 });
    if (scoped.length > 0) return scoped;
    const all = await datastoreClient.getRows(req, 'Victim', { maxRows: 20 });
    return all.filter((v) => String(v.case_id || v.CaseId || v.CASE_ID || '') === String(caseId));
}

class ContextBuilderService {
    /** Assembles the hidden, evidence-grounded context injected into every chat turn. Never shown to the user. */
    static async buildCaseContext(req, caseId) {
        const [caseRow, victims, suspects, witnessRows, timeline, cctv, phoneRecords, financialTransactions, memory] = await Promise.all([
            datastoreClient.getRowById(req, 'CaseMaster', caseId),
            getCaseVictims(req, caseId),
            datastoreClient.getRowsByCase(req, 'Suspect', caseId, { maxRows: 10 }),
            datastoreClient.getRowsByCase(req, 'Witness', caseId, { maxRows: 10 }),
            datastoreClient.getRowsByCase(req, 'TimelineEvent', caseId, { maxRows: 20, orderBy: 'event_time' }),
            datastoreClient.getRowsByCase(req, 'CCTVFootage', caseId, { maxRows: 10 }),
            datastoreClient.getRowsByCase(req, 'PhoneRecord', caseId, { maxRows: 10 }),
            datastoreClient.getRowsByCase(req, 'FinancialTransaction', caseId, { maxRows: 10 }),
            datastoreClient.getRowsByCase(req, 'InvestigationMemory', caseId, { maxRows: 30 })
        ]);

        // "Ignore witness X"-style corrections are recorded once in InvestigationMemory
        // (case-scoped, so they persist across every future conversation on this case)
        // and applied here so the AI never sees excluded entities again.
        const ignoredWitnessIds = new Set(
            memory
                .filter((m) => m.fact_type === 'ignored_entity' && m.ref_type === 'witness')
                .map((m) => String(m.ref_id))
        );
        const witnesses = witnessRows.filter((w) => !w.is_ignored && !ignoredWitnessIds.has(String(w.ROWID)));

        return {
            caseId,
            case: caseRow,
            victims,
            suspects,
            witnesses,
            timeline,
            cctv,
            phoneRecords,
            financialTransactions,
            evidenceCounts: {
                witnesses: witnesses.length,
                suspects: suspects.length,
                cctv: cctv.length,
                phoneRecords: phoneRecords.length,
                financialTransactions: financialTransactions.length,
                timelineEvents: timeline.length
            },
            pinnedFacts: memory.filter((m) => m.fact_type === 'pinned_finding'),
            corrections: memory.filter((m) => m.fact_type === 'correction' || m.fact_type === 'ignored_entity'),
            preferences: memory.filter((m) => m.fact_type === 'preference')
        };
    }

    /** Lightweight rolling summary — keeps the last N turns verbatim rather than a lossy AI-generated summary. */
    static buildConversationWindow(messages, maxTurns = 12) {
        const recentMessages = (messages || []).slice(-maxTurns);
        const omittedCount = Math.max(0, (messages || []).length - recentMessages.length);
        return { recentMessages, omittedCount };
    }
}

module.exports = ContextBuilderService;
