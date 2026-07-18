const catalyst = require('zcatalyst-sdk-node');
const RelationshipAgent = require('../agents/RelationshipAgent');

class RelationshipService {
    static async getNetwork(req) {
        const app = catalyst.initialize(req);
        const datastore = app.datastore();

        try {
            // Fetch cases and victims
            const [casesResponse, victimsResponse] = await Promise.all([
                datastore.table('CaseMaster').getPagedRows({ maxRows: 10 }).catch(() => ({ data: [] })),
                datastore.table('Victim').getPagedRows({ maxRows: 10 }).catch(() => ({ data: [] }))
            ]);

            const cases = casesResponse.data || [];
            const victims = victimsResponse.data || [];

            const rawData = { cases, victims };

            // Pass deterministic raw data to GLM Agent for graph network logic
            const graph = await RelationshipAgent.getNetwork(rawData);

            return graph;
        } catch (error) {
            console.error("Relationship Fetch Error:", error);
            throw error;
        }
    }
}

module.exports = RelationshipService;
