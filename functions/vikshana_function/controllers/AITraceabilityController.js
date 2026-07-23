const datastoreClient = require('../queries/datastoreClient');

class AITraceabilityController {
    static async getLogs(req, res) {
        try {
            const limit = parseInt(req.query.limit, 10) || 50;
            const query = `SELECT * FROM AIInteractionLog ORDER BY generated_time DESC LIMIT ${limit}`;
            const result = await datastoreClient.executeQuery(req, query);
            
            // Generate basic stats for dashboard
            const logs = result.data || [];
            
            const stats = {
                totalQueries: logs.length,
                highConfidence: logs.filter(l => l.confidence && l.confidence.includes('HIGH')).length,
                mediumConfidence: logs.filter(l => l.confidence && l.confidence.includes('MEDIUM')).length,
                lowConfidence: logs.filter(l => l.confidence && l.confidence.includes('LOW')).length,
            };

            res.status(200).json({
                success: true,
                data: logs,
                stats
            });
        } catch (error) {
            console.error('[AITraceabilityController] getLogs error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = AITraceabilityController;
