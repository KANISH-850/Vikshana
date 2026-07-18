const catalyst = require('zcatalyst-sdk-node');
const EvidenceAgent = require('../agents/EvidenceAgent');

class EvidenceService {
    static async getEvidence(req) {
        const app = catalyst.initialize(req);
        const datastore = app.datastore();

        try {
            // Fetch Cases and ArrestSurrender details to form evidence claims
            const [casesResponse, arrestsResponse] = await Promise.all([
                datastore.table('CaseMaster').getPagedRows({ maxRows: 10 }).catch(() => ({ data: [] })),
                datastore.table('ArrestSurrender').getPagedRows({ maxRows: 10 }).catch(() => ({ data: [] }))
            ]);

            const cases = casesResponse.data || [];
            const arrests = arrestsResponse.data || [];

            const rawData = { cases, arrests };

            // Pass the raw deterministic data to the GLM Evidence Agent for reasoning
            const evidences = await EvidenceAgent.correlateEvidence(rawData);

            return evidences;
        } catch (error) {
            console.error("Evidence Fetch Error:", error);
            throw error;
        }
    }
}

module.exports = EvidenceService;
