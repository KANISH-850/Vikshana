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

/**
 * Strips internal reasoning / chain-of-thought from the model's raw output.
 *
 * The Zoho GLM model (crm-di-glm47b) sometimes prefixes its final answer with
 * visible scratchpad content in several formats:
 *
 *   1. XML think blocks:  <think>…</think>  (DeepSeek / QwQ style)
 *   2. Special tokens:    <|thinking|>…<|/thinking|>
 *   3. Numbered prose preamble lines such as:
 *        "1. Analyze the User's Input: …"
 *        "2. Analyze the Context/System Role: …"
 *        "   Role: …"  "   Context: …"  "   Current State: …"
 *      that appear before the actual answer.
 *
 * Only the content that follows all reasoning sections is returned.
 */
function stripReasoning(text) {
    if (!text) return text;

    // Handle cases where the opening <think> or <|thinking|> tags were malformed/omitted,
    // but the closing tags are present (strip everything before the closing tag)
    const thinkEndIdx = text.toLowerCase().indexOf('</think>');
    if (thinkEndIdx !== -1) {
        text = text.slice(thinkEndIdx + 8);
    }
    const thinkingEndIdx = text.indexOf('<|/thinking|>');
    if (thinkingEndIdx !== -1) {
        text = text.slice(thinkingEndIdx + 13);
    }

    // 1. Remove <think>…</think> blocks (possibly multi-line, possibly multiple)
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // 2. Remove <|thinking|>…<|/thinking|> tokens
    cleaned = cleaned.replace(/<\|thinking\|>[\s\S]*?<\|\/thinking\|>/gi, '');

    // 3. Strip numbered "Analyze …" prose preamble lines.
    //    These are lines that start with a digit+dot or look like indented sub-bullets
    //    containing internal meta-labels (Role:, Context:, Current State:, etc.)
    //    and appear before any real markdown content (heading / bullet / sentence).
    //    Strategy: find the first line that does NOT look like reasoning boilerplate
    //    and return everything from that line onward.
    const lines = cleaned.split('\n');
    const boilerplatePattern = /^(\s*\d+\.\s*(analyze|understand|check|determine|plan|consider|note|evaluate)|^\s+(role|context|current state of evidence|evidence on file|evidence count)[\s:])/i;
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
        if (boilerplatePattern.test(lines[i]) || (i > 0 && /^\s{2,}/.test(lines[i]) && startIdx === 0)) {
            // Still in preamble — mark this line as boilerplate and keep scanning
            startIdx = i + 1;
        } else if (lines[i].trim() !== '') {
            // First non-empty, non-boilerplate line — real answer starts here
            break;
        }
    }
    cleaned = lines.slice(startIdx).join('\n');

    return cleaned.trim();
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

                return { content: stripReasoning(data.response) };

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

const client = new GLMClient();
client.getFreshAccessToken = getFreshAccessToken;

module.exports = client;
