const glmClient = require('./glmClient');
const evidenceAggregatorService = require('./EvidenceAggregatorService');

class EvidenceCorrelationService {
    async findCorrelations(req, caseId) {
        // Fetch Unified Evidence
        const unified = await evidenceAggregatorService.getAggregatedEvidence(req, caseId);
        
        if (unified.isAggregated || !unified.evidence || unified.evidence.length === 0) {
            return [];
        }

        const systemPrompt = `You are an AI Forensic Correlation Engine.
Analyze the following unified evidence records and find relationships and correlations between them.
Return a STRICT JSON array of objects representing correlations:
[
  {
    "source_evidence_id": "...",
    "target_evidence_id": "...",
    "relationship_type": "Same Phone|Same Vehicle|Same Weapon|Financial Link",
    "correlation_score": 0.95,
    "reason": "Why these are correlated",
    "supporting_records": ["ID1", "ID2"]
  }
]
DO NOT use markdown formatting blocks. Respond only with JSON.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(unified.evidence) }
        ];

        try {
            const response = await glmClient.generate(messages, { temperature: 0.1, maxTokens: 4000 });
            let rawJson = response.content.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
            
            return JSON.parse(rawJson);
        } catch (error) {
            console.error('[EvidenceCorrelationService] Failed:', error.message);
            return []; // Fallback to empty if AI fails to parse or find correlations
        }
    }
}

module.exports = new EvidenceCorrelationService();
