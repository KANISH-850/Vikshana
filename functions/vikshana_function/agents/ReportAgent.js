const glmClient = require('../services/glmClient');
const { reportSystemPrompt } = require('../prompts/reportPrompt');

class ReportAgent {
    static async generateReport(caseContext) {
        const messages = [
            { role: "system", content: reportSystemPrompt },
            { role: "user", content: `Please generate a comprehensive report based on the following verified raw data:\n\n${JSON.stringify(caseContext)}` }
        ];

        try {
            console.log(`[ReportAgent] Generating report via GLM...`);
            const responseMessage = await glmClient.generate(messages, { maxTokens: 2048, temperature: 0.3 });
            return responseMessage.content;
        } catch (error) {
            console.error("[ReportAgent] Error generating report:", error);
            return "Error generating AI report. Please check system logs.";
        }
    }
}

module.exports = ReportAgent;
