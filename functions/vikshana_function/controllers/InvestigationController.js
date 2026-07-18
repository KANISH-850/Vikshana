const InvestigationService = require('../services/InvestigationService');

class InvestigationController {
    static async investigate(req, res) {
        try {
            const data = await InvestigationService.performInvestigation(req);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error("Error in InvestigationController:", error);
            res.status(500).json({ success: false, error: "AI Processing Error" });
        }
    }
}

module.exports = InvestigationController;
