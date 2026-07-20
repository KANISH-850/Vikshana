const axios = require('axios');

const CLIPATH = 'C:/Users/AJAI/AppData/Roaming/npm/node_modules/zcatalyst-cli/lib';
const CLI_TOKEN = 'w_1000.95e87a48b29a5a0ee986da15e6e40675.87e9bd73d2bd93edf26f37229be0985c';

let _cachedToken = null;
let _tokenExpiry = 0;

async function getFreshAccessToken() {
    if (_cachedToken && Date.now() < _tokenExpiry - 60000) {
        return _cachedToken;
    }
    try {
        const Credential = require(CLIPATH + '/authentication/credential.js').default;
        Credential.init(CLI_TOKEN);
        const token = await Credential.getAccessToken(true);
        _cachedToken = token;
        _tokenExpiry = Date.now() + 55 * 60 * 1000; // cache for 55 minutes
        return token;
    } catch (e) {
        console.warn('[GLMClient] Could not refresh token from CLI, falling back to env:', e.message);
        return process.env.CATALYST_TOKEN;
    }
}

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
            timeoutMs = 30000
        } = options;

        let attempt = 0;
        
        while (attempt < retries) {
            try {
                const token = await getFreshAccessToken();
                const response = await axios.post(this.endpoint, {
                    model: this.model,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: maxTokens,
                    tools: tools
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'CATALYST-ORG': this.org,
                        'Content-Type': 'application/json'
                    },
                    timeout: timeoutMs
                });

                const data = response.data;
                
                // QuickML GLM endpoint returns { response: "...", usage: {...} }
                if (!data || !data.response) {
                    throw new Error("Invalid response structure from GLM: " + JSON.stringify(data));
                }

                return { content: data.response };

            } catch (error) {
                attempt++;
                // If auth failed, force token refresh on next try
                if (error.response && error.response.status === 401) {
                    _cachedToken = null;
                }
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

