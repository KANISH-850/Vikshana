const SeedService = require('../services/SeedService');

class DevController {
    static async seed(req, res) {
        try {
            const caseId = (req.body && req.body.caseId) || req.query.caseId || '1';
            const results = await SeedService.seedAllCases(req, caseId);
            res.status(200).json({ success: true, data: results });
        } catch (error) {
            console.error('Error in DevController.seed:', error);
            res.status(500).json({ success: false, error: 'Seeding failed' });
        }
    }
    
    static async checkTables(req, res) {
        res.status(200).json({ success: true, data: "checkTables not implemented yet" });
    }
}

module.exports = DevController;
