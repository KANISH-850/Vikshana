const datastoreClient = require('../queries/datastoreClient');
const EvidenceCorroborationService = require('./EvidenceCorroborationService');
const scoringConfig = require('../config/scoringConfig');
const caseEvidenceProfileConfig = require('../config/caseEvidenceProfileConfig');

class HypothesisEngineService {
    static async evaluateHypothesis(req, caseId, hypothesis) {
        if (!caseId) throw new Error("CaseMasterID is required for isolation.");
        
        // Retrieve case master details to determine case type
        const caseRow = await datastoreClient.getRows(req, 'CaseMaster', { where: { ROWID: caseId } }).then(rows => rows[0]).catch(() => null);
        const caseType = caseRow ? (caseRow.CrimeGroup_Name || caseRow.FIRType || 'Generic') : 'Generic';

        // Retrieve evidence only for this CaseMasterID
        const evidenceRows = await datastoreClient.getRows(req, 'Evidence', { where: { CaseMasterID: caseId } });
        
        let supportingEvidence = [];
        let contradictingEvidence = [];
        let missingEvidence = [];
        
        const weights = scoringConfig.hypothesisScoring.weights;
        let verifiedCount = 0;
        let corroborationBonus = 0;
        let contradictionPenalty = 0;
        let gapPenalty = 0;

        const availableTypes = new Set();

        for (const ev of evidenceRows) {
            const sourceType = (ev.SourceType || 'General').toLowerCase();
            availableTypes.add(sourceType);

            if (ev.Description && hypothesis.Statement && hypothesis.Statement.toLowerCase().includes(sourceType)) {
                supportingEvidence.push(ev);
                if (ev.Verified) verifiedCount++;
            } else if (ev.Description && ev.Description.toLowerCase().includes('conflict')) {
                contradictingEvidence.push(ev);
                contradictionPenalty += weights.contradictionPenalty;
            }
        }
        
        // Corroboration Engine integration
        const corroborationStatus = await EvidenceCorroborationService.analyzeCorroboration(supportingEvidence);
        if (corroborationStatus === 'MULTI_SOURCE_CORROBORATED') {
            corroborationBonus = weights.corroborationBonus;
        }

        // Case-Type Aware Potential Evidence Profile Gap Analysis
        const expectedTypes = caseEvidenceProfileConfig.getExpectedCategories(caseType);
        expectedTypes.forEach(type => {
            if (!availableTypes.has(type)) {
                missingEvidence.push({
                    gap: `Potential ${type.toUpperCase()} Evidence Category Not Represented in Available Data`,
                    caseType,
                    reason: `No verified ${type} evidence records present in current ${caseType} case file.`
                });
                gapPenalty += weights.evidenceGapPenalty;
            }
        });

        // Explainable Rule-Based Evidence Support Score Calculation starting from Base 0
        const supportingFactor = supportingEvidence.length * weights.supportingItem;
        const verifiedFactor = verifiedCount * weights.verifiedItem;
        
        let score = scoringConfig.hypothesisScoring.baseScore + supportingFactor + verifiedFactor + corroborationBonus - contradictionPenalty - gapPenalty;
        score = Math.max(scoringConfig.hypothesisScoring.minScore, Math.min(scoringConfig.hypothesisScoring.maxScore, score));

        let status = 'INCONCLUSIVE';
        if (score >= 70) status = 'SUPPORTED';
        else if (score >= 45) status = 'PARTIALLY_SUPPORTED';
        else if (score < 30) status = 'CONTRADICTED';

        const updatedHypothesis = {
            ...hypothesis,
            EvidenceSupportScore: score,
            Status: status,
            UpdatedAt: new Date().toISOString(),
            scoreBreakdown: {
                baseScore: scoringConfig.hypothesisScoring.baseScore,
                supportingFactor,
                verifiedFactor,
                corroborationBonus,
                contradictionPenalty: -contradictionPenalty,
                gapPenalty: -gapPenalty,
                finalScore: score
            }
        };

        return {
            hypothesis: updatedHypothesis,
            caseType,
            supportingEvidence,
            contradictingEvidence,
            potentialEvidenceGaps: missingEvidence,
            missingEvidence, // Preserved for API backwards compatibility
            corroborationStatus,
            methodology: "Explainable Rule-Based Evidence Support Score starting from Base 0. Measures data coverage, not legal guilt."
        };
    }

    static async createHypothesis(req, caseId, statement, createdBy) {
        const hypId = 'HYP-' + Math.random().toString(36).substr(2, 9);
        const newHypothesis = {
            ROWID: hypId,
            HypothesisID: hypId,
            CaseMasterID: caseId,
            Statement: statement,
            CreatedBy: createdBy,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString(),
            Status: 'INCONCLUSIVE',
            EvidenceSupportScore: 0,
            Version: 1,
            Active: true
        };

        const result = await this.evaluateHypothesis(req, caseId, newHypothesis);
        
        await datastoreClient.insertRow(req, 'InvestigationHypothesis', result.hypothesis);
        
        return result;
    }

    static async getHypothesesForCase(req, caseId) {
        const rows = await datastoreClient.getRows(req, 'InvestigationHypothesis', { where: { CaseMasterID: caseId } });
        const results = [];
        for (const row of rows) {
            const evalResult = await this.evaluateHypothesis(req, caseId, row);
            results.push(evalResult);
        }
        return results;
    }
}

module.exports = HypothesisEngineService;
