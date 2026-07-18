const ContextBuilderService = require('../services/ContextBuilderService');
const datastoreClient = require('../queries/datastoreClient');

/** Simple evidence-density/flag-count heuristic for the UI's risk & confidence indicators — not an AI claim, never shown as a cited fact in chat. */
function computeRiskAndConfidence(context) {
    const flaggedTxns = (context.financialTransactions || []).filter((t) => t.is_flagged).length;
    const suspiciousCalls = (context.phoneRecords || []).filter((p) => p.is_suspicious).length;
    const highRiskSuspects = (context.suspects || []).filter((s) => s.risk_level === 'high').length;

    const riskScore = flaggedTxns + suspiciousCalls + highRiskSuspects;
    const riskLevel = riskScore >= 3 ? 'high' : riskScore >= 1 ? 'medium' : 'low';

    const totalEvidence = Object.values(context.evidenceCounts || {}).reduce((sum, n) => sum + (n || 0), 0);
    const confidence = Math.min(95, 30 + totalEvidence * 6);

    return { riskLevel, confidence };
}

class InvestigationDataController {
    static async getCaseSummary(req, res) {
        try {
            const { caseId } = req.params;
            const context = await ContextBuilderService.buildCaseContext(req, caseId);
            const attachments = await datastoreClient.getRowsByCase(req, 'Attachment', caseId, { maxRows: 10, orderBy: 'CREATEDTIME' });
            const { riskLevel, confidence } = computeRiskAndConfidence(context);

            res.status(200).json({
                success: true,
                data: {
                    case: context.case,
                    victims: context.victims,
                    suspects: context.suspects,
                    witnesses: context.witnesses,
                    timeline: context.timeline,
                    evidenceCounts: context.evidenceCounts,
                    pinnedFacts: context.pinnedFacts,
                    recentAttachments: attachments,
                    riskLevel,
                    confidence
                }
            });
        } catch (error) {
            console.error('Error in InvestigationDataController.getCaseSummary:', error);
            res.status(500).json({ success: false, error: 'Failed to load case summary' });
        }
    }

    static makeListHandler(table) {
        return async (req, res) => {
            try {
                const rows = await datastoreClient.getRowsByCase(req, table, req.params.caseId, { maxRows: 50 });
                res.status(200).json({ success: true, data: rows });
            } catch (error) {
                console.error(`Error in InvestigationDataController(${table}):`, error);
                res.status(500).json({ success: false, error: `Failed to load ${table}` });
            }
        };
    }
}

InvestigationDataController.getWitnesses = InvestigationDataController.makeListHandler('Witness');
InvestigationDataController.getSuspects = InvestigationDataController.makeListHandler('Suspect');
InvestigationDataController.getCctv = InvestigationDataController.makeListHandler('CCTVFootage');
InvestigationDataController.getPhoneRecords = InvestigationDataController.makeListHandler('PhoneRecord');
InvestigationDataController.getFinancialTransactions = InvestigationDataController.makeListHandler('FinancialTransaction');
InvestigationDataController.getTimeline = InvestigationDataController.makeListHandler('TimelineEvent');

module.exports = InvestigationDataController;
