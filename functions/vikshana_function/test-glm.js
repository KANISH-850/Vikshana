require('dotenv').config();
const axios = require('axios');

async function testGLM() {
    try {
        const response = await axios.post(
            process.env.GLM_ENDPOINT,
            {
                model: process.env.GLM_MODEL,
                messages: [{ role: "user", content: "Hello, testing 123" }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CATALYST_TOKEN}`,
                    'CATALYST-ORG': process.env.CATALYST_ORG,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error calling GLM:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testGLM();
