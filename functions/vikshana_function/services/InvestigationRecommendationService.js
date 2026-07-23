const glmClient = require('./glmClient');
const evidenceAggregatorService = require('./EvidenceAggregatorService');

class InvestigationRecommendationService {
    async generateRecommendationsAndGaps(req, caseId) {
        const unified = await evidenceAggregatorService.getAggregatedEvidence(req, caseId);
        
        if (unified.isAggregated || !unified.evidence || unified.evidence.length === 0) {
            return { gaps: [], recommendations: [] };
        }

        const systemPrompt = `You are a Principal Criminal Investigator AI.
Based on the following evidence collected for this case, you must identify missing evidence (Gaps) and generate actionable Next Steps (Recommendations).
Return a STRICT JSON object in this exact format:
{
  "gaps": [
    {
      "missing_item": "Missing CCTV|Missing Financial Records|Missing Weapon Verification|Missing DNA|...",
      "priority": "Critical|High|Medium|Low",
      "reasoning": "Why this is a gap based on what we have."
    }
  ],
  "recommendations": [
    {
      "action": "Interview Witness|Collect CCTV|Issue Search Warrant|Freeze Bank Account|...",
      "priority": "Critical|High|Medium|Low",
      "reason": "Why this action is needed",
      "expected_impact": "How it improves the investigation",
      "confidence": 0.9,
      "evidence_used": ["Evidence ID 1", "Evidence ID 2"]
    }
  ]
}
DO NOT use markdown formatting blocks. Respond only with JSON.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(unified.evidence) }
        ];

        try {
            const response = await glmClient.generate(messages, { temperature: 0.2, maxTokens: 4000 });
            let rawJson = response.content.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
            return JSON.parse(rawJson);
        } catch (error) {
            console.error('[InvestigationRecommendationService] Failed:', error.message);
            return { gaps: [], recommendations: [] };
        }
    }
}

module.exports = new InvestigationRecommendationService();
