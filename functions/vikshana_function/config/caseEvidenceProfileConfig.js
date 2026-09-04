/**
 * caseEvidenceProfileConfig.js
 * Case-Type Aware Evidence Category Expectations Profile Configuration
 */
module.exports = {
    profiles: {
        'Cybercrime': ['digital', 'device', 'transaction', 'communication'],
        'Financial Crime': ['transaction', 'account', 'documentary', 'digital'],
        'Burglary': ['physical', 'scene', 'witness', 'property'],
        'Assault': ['medical', 'witness', 'physical', 'forensic'],
        'Generic': ['physical', 'digital', 'witness', 'documentary']
    },

    getExpectedCategories(caseType) {
        if (!caseType) return this.profiles['Generic'];
        const typeStr = String(caseType).toLowerCase();
        
        for (const [key, categories] of Object.entries(this.profiles)) {
            if (typeStr.includes(key.toLowerCase())) {
                return categories;
            }
        }
        return this.profiles['Generic'];
    }
};
