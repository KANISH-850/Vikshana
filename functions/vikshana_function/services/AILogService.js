const datastoreClient = require('../queries/datastoreClient');
const crypto = require('crypto');

class AILogService {
    /**
     * Log an AI Interaction asynchronously.
     */
    static async logInteraction(req, user, caseId, prompt, model, confidence, evidenceIds) {
        if (!user) user = { id: 'SYSTEM', name: 'SYSTEM', role: 'System' };
        
        try {
            const rowData = {
                log_id: `AILOG-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
                user_id: user.id || 'UNKNOWN',
                user_name: user.name || 'UNKNOWN',
                role: user.role || 'UNKNOWN',
                case_id: caseId || 'N/A',
                prompt: prompt || 'N/A',
                response_id: `RSP-${Date.now()}`,
                model: model || 'crm-di-glm47b',
                confidence: confidence || 'UNKNOWN',
                evidence_ids: JSON.stringify(evidenceIds || []),
                generated_time: new Date().toISOString()
            };

            await datastoreClient.insertRow(req, 'AIInteractionLog', rowData);
        } catch (error) {
            console.error('[AILogService] Failed to insert interaction log:', error);
        }
    }
}

module.exports = AILogService;
