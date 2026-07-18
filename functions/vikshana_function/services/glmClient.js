const axios = require('axios');

class GLMClient {
    constructor() {
        this.endpoint = process.env.GLM_ENDPOINT;
        this.model = process.env.GLM_MODEL;
        this.org = process.env.CATALYST_ORG;
    }

    async generate(messages, options = {}) {
        const {
            temperature = 0.7,
            maxTokens = 2048,
            tools = undefined,
            retries = 3,
            timeoutMs = 15000
        } = options;

        let attempt = 0;
        
        while (attempt < retries) {
            try {
                const response = await axios.post(this.endpoint, {
                    model: this.model,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: maxTokens,
                    tools: tools
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.CATALYST_TOKEN}`,
                        'CATALYST-ORG': this.org,
                        'Content-Type': 'application/json'
                    },
                    timeout: timeoutMs
                });

                const data = response.data;
                
                // QuickML GLM endpoint returns { response: "...", usage: {...} }
                // We wrap it in a standard message object for our agents
                if (!data || !data.response) {
                    throw new Error("Invalid response structure from GLM: " + JSON.stringify(data));
                }

                return { content: data.response };

            } catch (error) {
                attempt++;
                console.error(`[GLMClient] Attempt ${attempt} failed:`, error.message);
                if (attempt >= retries) {
                    throw new Error(`GLM Client exhausted retries. Last error: ${error.message}`);
                }
                // Backoff
                await new Promise(res => setTimeout(res, 1000 * attempt));
            }
        }
    }
}

module.exports = new GLMClient();
