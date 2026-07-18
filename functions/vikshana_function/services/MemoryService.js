const datastoreClient = require('../queries/datastoreClient');

const IGNORE_PATTERN = /\bignore\s+(witness|suspect)\s+["']?([a-z0-9 ,.'-]{2,60}?)["']?[.!]?$/i;
const PIN_PATTERN = /\b(?:pin|remember)\s+(?:this|that|the following)?:?\s*(.*)/i;

/**
 * Lightweight regex-based correction/pin detection — not an LLM call, so it
 * adds no latency. Covers the spec's core example ("Ignore witness A")
 * explicitly. Records are case-scoped (InvestigationMemory.case_id), so they
 * persist across every future conversation on the case, not just this one.
 */
class MemoryService {
    static async recordIfCorrection(req, { caseId, officerId, message, context }) {
        if (!message) return null;

        const ignoreMatch = message.match(IGNORE_PATTERN);
        if (ignoreMatch) {
            const [, entityType, namePart] = ignoreMatch;
            const name = namePart.trim();
            const type = entityType.toLowerCase();
            const pool = type === 'witness' ? context.witnesses : context.suspects;
            const target = (pool || []).find((row) => String(row.name || '').toLowerCase().includes(name.toLowerCase()));

            await datastoreClient.insertRow(req, 'InvestigationMemory', {
                case_id: caseId,
                officer_id: officerId,
                fact_type: 'ignored_entity',
                content: `Investigator instructed: ignore ${type} "${target ? target.name : name}".`,
                ref_type: type,
                ref_id: target ? String(target.ROWID) : ''
            });

            if (target && type === 'witness') {
                await datastoreClient.updateRow(req, 'Witness', target.ROWID, { is_ignored: true });
            }
            return { factType: 'ignored_entity', target: target || null };
        }

        const pinMatch = message.match(PIN_PATTERN);
        if (pinMatch) {
            const content = pinMatch[1] && pinMatch[1].trim() ? pinMatch[1].trim() : message;
            await datastoreClient.insertRow(req, 'InvestigationMemory', {
                case_id: caseId,
                officer_id: officerId,
                fact_type: 'pinned_finding',
                content,
                ref_type: '',
                ref_id: ''
            });
            return { factType: 'pinned_finding' };
        }

        return null;
    }
}

module.exports = MemoryService;
