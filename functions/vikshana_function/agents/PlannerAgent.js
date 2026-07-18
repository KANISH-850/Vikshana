const glmClient = require('../services/glmClient');
const { plannerSystemPrompt } = require('../prompts/plannerPrompt');

class PlannerAgent {
    static async planInvestigation(userQuery) {
        const messages = [
            { role: "system", content: plannerSystemPrompt },
            { role: "user", content: `Officer Query: ${userQuery}` }
        ];

        try {
            console.log(`[PlannerAgent] Sending query to GLM...`);
            const responseMessage = await glmClient.generate(messages, { maxTokens: 1024 });
            let content = responseMessage.content.trim();
            
            // Strip markdown JSON block if the LLM adds it despite instructions
            if (content.startsWith("```json")) {
                content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
            }
            
            // Handle GLM Reasoning Models that output <think> or raw text before JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }

            const plan = JSON.parse(content);
            return plan;
        } catch (error) {
            console.error("[PlannerAgent] Error parsing plan:", error);
            // Fallback plan if GLM fails
            return {
                intent: "Fallback investigation plan due to AI error.",
                entities: { people: [], vehicles: [], locations: [], keywords: userQuery.split(" ") },
                tools: ["search_cases"],
                confidence: 50,
                error: error.message
            };
        }
    }
}

module.exports = PlannerAgent;
