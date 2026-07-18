const glmClient = require('../services/glmClient');
const { evidenceSystemPrompt } = require('../prompts/evidencePrompt');

class EvidenceAgent {
    static async correlateEvidence(rawData) {
        const messages = [
            { role: "system", content: evidenceSystemPrompt },
            { role: "user", content: `Raw datastore export:\n${JSON.stringify(rawData)}` }
        ];

        try {
            console.log(`[EvidenceAgent] Correlating evidence via GLM...`);
            const responseMessage = await glmClient.generate(messages, { maxTokens: 1024 });
            let content = responseMessage.content.trim();
            
            if (content.startsWith("```json")) {
                content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
            }

            // Handle GLM Reasoning Models that output <think> or raw text before JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }

            const claims = JSON.parse(content);
            return claims;
        } catch (error) {
            console.error("[EvidenceAgent] Error correlating evidence:", error);
            // Fallback deterministic claim if GLM fails
            return [{
                id: 1,
                claim: "AI Correlation Failed",
                supporting: ["Raw data exists but could not be processed by AI"],
                counter: [error.message],
                confidence: "0%",
                reasoning: "System encountered an error during LLM parsing."
            }];
        }
    }
}

module.exports = EvidenceAgent;
