const SeedService = require('../services/SeedService');

class DevController {
    static async seed(req, res) {
        try {
            const results = await SeedService.seedAllCases(req);
            res.status(200).json({ success: true, data: results });
        } catch (error) {
            console.error('Error in DevController.seed:', error);
            res.status(500).json({ success: false, error: 'Seeding failed' });
        }
    }
}

module.exports = DevController;
