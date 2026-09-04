/**
 * HypothesisEngineService.js
 * Evaluates hypotheses based on structured evidence.
 */
const datastoreClient = require('../queries/datastoreClient');
const EvidenceCorroborationService = require('./EvidenceCorroborationService');

class HypothesisEngineService {
    static async evaluateHypothesis(req, caseId, hypothesis) {
        if (!caseId) throw new Error("CaseMasterID is required for isolation.");
        
        // Ensure evidence is retrieved only for this CaseMasterID
        const evidenceRows = await datastoreClient.getRows(req, 'Evidence', { where: { CaseMasterID: caseId } });
        
        let supportingEvidence = [];
        let contradictingEvidence = [];
        let missingEvidence = [];
        
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
                contradictionPenalty += 15;
            }
        }
        
        // Corroboration Engine integration
        const corroborationStatus = await EvidenceCorroborationService.analyzeCorroboration(supportingEvidence);
        if (corroborationStatus === 'MULTI_SOURCE_CORROBORATED') {
            corroborationBonus = 20;
        }

        // Potential Evidence Gap Analysis (derive missing categories based on standard forensic requirement types)
        const expectedTypes = ['physical', 'digital', 'witness', 'documentary'];
        expectedTypes.forEach(type => {
            if (!availableTypes.has(type)) {
                missingEvidence.push({
                    gap: `Potential ${type.toUpperCase()} evidence coverage gap`,
                    reason: `No verified ${type} evidence records present in current case file.`
                });
                gapPenalty += 5;
            }
        });

        // Explainable Rule-Based Evidence Support Score Calculation (Base 50)
        let score = 50 + (supportingEvidence.length * 10) + (verifiedCount * 5) + corroborationBonus - contradictionPenalty - gapPenalty;
        score = Math.max(0, Math.min(100, score));

        let status = 'INCONCLUSIVE';
        if (score >= 75) status = 'SUPPORTED';
        else if (score >= 60) status = 'PARTIALLY_SUPPORTED';
        else if (score < 40) status = 'CONTRADICTED';

        const updatedHypothesis = {
            ...hypothesis,
            EvidenceSupportScore: score,
            Status: status,
            UpdatedAt: new Date().toISOString(),
            scoreBreakdown: {
                baseScore: 50,
                supportingFactor: supportingEvidence.length * 10,
                verifiedFactor: verifiedCount * 5,
                corroborationBonus,
                contradictionPenalty: -contradictionPenalty,
                gapPenalty: -gapPenalty,
                finalScore: score
            }
        };

        return {
            hypothesis: updatedHypothesis,
            supportingEvidence,
            contradictingEvidence,
            potentialEvidenceGaps: missingEvidence,
            missingEvidence, // Preserved for API backwards compatibility
            corroborationStatus,
            methodology: "Explainable Rule-Based Evidence Support Score. Measures data and evidence coverage, not legal guilt."
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
