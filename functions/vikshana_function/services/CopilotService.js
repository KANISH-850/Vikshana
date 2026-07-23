const glmClient = require('./glmClient');
const evidenceAggregatorService = require('./EvidenceAggregatorService');

class CopilotService {
    async chat(req, caseId, prompt) {
        // Fetch unified evidence context
        const unified = await evidenceAggregatorService.getAggregatedEvidence(req, caseId);
        
        let evidenceContext = 'No evidence found.';
        if (unified.evidence && unified.evidence.length > 0) {
            evidenceContext = JSON.stringify(unified.evidence);
        } else if (unified.isAggregated) {
            evidenceContext = 'Data is aggregated. Counts: ' + JSON.stringify(unified.counts);
        }

        const systemPrompt = `You are the VIKSHANA AI Investigation Copilot.
You have access to the following unified evidence for case ${caseId}:
${evidenceContext}

Your task is to answer the user's investigation query based strictly on this evidence.
When you make a claim, explain your reasoning and cite the specific evidence IDs.

Format your response as a JSON object:
{
  "answer": "Your detailed explanation and answer to the user's prompt",
  "confidence": 0.95,
  "evidence_used": ["ID1", "ID2"],
  "reasoning": "Brief rationale of how you arrived at this answer"
}
DO NOT use markdown formatting blocks. Respond only with JSON.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ];

        try {
            const response = await glmClient.generate(messages, { temperature: 0.3, maxTokens: 4000 });
            let rawJson = response.content.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
            return JSON.parse(rawJson);
        } catch (error) {
            console.error('[CopilotService] Failed:', error.message);
            throw new Error('Failed to generate Copilot response.');
        }
    }
}

module.exports = new CopilotService();
