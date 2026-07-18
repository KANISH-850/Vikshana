const ReportService = require('../services/ReportService');

class ReportController {
    static async getReports(req, res) {
        try {
            const data = await ReportService.getReports(req);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error("Error in ReportController:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async generate(req, res) {
        try {
            const data = await ReportService.generateReport(req);
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error("Error generating report:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = ReportController;
