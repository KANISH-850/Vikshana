const EvidenceService = require('../services/EvidenceService');

class EvidenceController {
    static async getEvidence(req, res) {
        try {
            const data = await EvidenceService.getEvidence(req);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error("Error in EvidenceController:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = EvidenceController;
