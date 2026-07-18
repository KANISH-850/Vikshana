const glmClient = require('../services/glmClient');
const { relationshipSystemPrompt } = require('../prompts/relationshipPrompt');

class RelationshipAgent {
    static async getNetwork(rawData) {
        const messages = [
            { role: "system", content: relationshipSystemPrompt },
            { role: "user", content: `Raw datastore export:\n${JSON.stringify(rawData)}` }
        ];

        try {
            console.log(`[RelationshipAgent] Traversing graph via GLM...`);
            const responseMessage = await glmClient.generate(messages, { maxTokens: 2048 });
            let content = responseMessage.content.trim();
            
            if (content.startsWith("```json")) {
                content = content.replace(/^```json\n/, "").replace(/\n```$/, "");
            }

            // Handle GLM Reasoning Models that output <think> or raw text before JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }

            const graph = JSON.parse(content);
            
            // Hydrate coordinates for UI
            graph.nodes = graph.nodes.map(n => ({
                ...n,
                x: Math.random() * 600 + 100,
                y: Math.random() * 400 + 50
            }));

            return graph;
        } catch (error) {
            console.error("[RelationshipAgent] Error parsing graph:", error);
            return {
                nodes: [{ id: '1', label: 'AI Error: Could not traverse graph', type: 'case', x: 400, y: 300 }],
                edges: []
            };
        }
    }
}

module.exports = RelationshipAgent;
