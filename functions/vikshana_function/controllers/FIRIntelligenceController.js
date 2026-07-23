const firIntelligenceService = require('../services/FIRIntelligenceService');

class FIRIntelligenceController {
    async analyze(req, res) {
        try {
            const { firText, caseId } = req.body;
            
            if (!firText) {
                return res.status(400).json({ error: 'FIR text is required' });
            }

            const analysis = await firIntelligenceService.analyzeFIR(req, firText, caseId);

            return res.status(200).json({
                success: true,
                data: analysis
            });

        } catch (error) {
            console.error('[FIRIntelligenceController] Analyze error:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to process FIR.'
            });
        }
    }
}

module.exports = new FIRIntelligenceController();
