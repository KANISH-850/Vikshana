/**
 * Dev helper: triggers SeedService via the locally running `catalyst serve`
 * dev server, which is what actually holds a valid Catalyst auth context
 * (a standalone script has none). Run `catalyst serve` first, then:
 *   node scripts/seedInvestigationData.js
 * Override the target with SEED_TARGET_URL if your local port differs.
 */
const axios = require('axios');

const targetUrl = process.env.SEED_TARGET_URL || 'http://localhost:3000/server/vikshana_function/dev/seed';

(async () => {
    console.log(`[seed] POST ${targetUrl}`);
    try {
        const { data } = await axios.post(targetUrl, {}, { timeout: 60000 });
        console.log('[seed] Done:');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('[seed] Failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        process.exit(1);
    }
})();
