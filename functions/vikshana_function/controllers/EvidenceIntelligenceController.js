const evidenceAggregatorService = require('../services/EvidenceAggregatorService');
const evidenceCorrelationService = require('../services/EvidenceCorrelationService');
const investigationRecommendationService = require('../services/InvestigationRecommendationService');
const copilotService = require('../services/CopilotService');

class EvidenceIntelligenceController {
    
    async getWorkspaceData(req, res) {
        try {
            const caseId = req.query.caseId || 'UNASSIGNED';
            
            // Execute services in parallel for speed
            const [aggregated, correlations, analysis] = await Promise.all([
                evidenceAggregatorService.getAggregatedEvidence(req, caseId),
                evidenceCorrelationService.findCorrelations(req, caseId),
                investigationRecommendationService.generateRecommendationsAndGaps(req, caseId)
            ]);

            return res.status(200).json({
                success: true,
                data: {
                    unified_evidence: aggregated,
                    correlations: correlations,
                    gaps: analysis.gaps || [],
                    recommendations: analysis.recommendations || []
                }
            });
        } catch (error) {
            console.error('[EvidenceIntelligenceController] Error:', error);
            return res.status(500).json({ success: false, error: 'Failed to load workspace data.' });
        }
    }

    async chatWithCopilot(req, res) {
        try {
            const { caseId = 'UNASSIGNED', prompt } = req.body;
            if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });

            const response = await copilotService.chat(req, caseId, prompt);
            
            return res.status(200).json({
                success: true,
                data: response
            });
        } catch (error) {
            console.error('[CopilotChat] Error:', error);
            return res.status(500).json({ success: false, error: 'Copilot failed to respond.' });
        }
    }
}

module.exports = new EvidenceIntelligenceController();
