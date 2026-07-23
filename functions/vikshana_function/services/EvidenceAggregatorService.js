const datastoreClient = require('../queries/datastoreClient');
const AuditService = require('./AuditService');

class EvidenceAggregatorService {
    
    async getAggregatedEvidence(req, caseId) {
        // Fetch evidence records from Catalyst
        const [
            evidence,
            cctv,
            phone,
            financial,
            weapons,
            vehicles,
            reports
        ] = await Promise.all([
            datastoreClient.getRowsWhere(req, 'Evidence', { case_id: caseId }, { maxRows: 100 }).catch(() => []),
            datastoreClient.getRowsWhere(req, 'CCTVFootage', { case_id: caseId }, { maxRows: 100 }).catch(() => []),
            datastoreClient.getRowsWhere(req, 'PhoneRecord', { case_id: caseId }, { maxRows: 100 }).catch(() => []),
            datastoreClient.getRowsWhere(req, 'FinancialTransaction', { case_id: caseId }, { maxRows: 100 }).catch(() => []),
            datastoreClient.getRowsWhere(req, 'Weapon', { case_id: caseId }, { maxRows: 100 }).catch(() => []),
            datastoreClient.getRowsWhere(req, 'Vehicle', { case_id: caseId }, { maxRows: 100 }).catch(() => []),
            datastoreClient.getRowsWhere(req, 'ForensicReport', { evidence_id: { $ne: null } }, { maxRows: 100 }).catch(() => []) // Naive join approximation
        ]);

        // Unify them into a common schema
        const unified = [
            ...evidence.map(e => ({ id: e.ROWID, source: 'Evidence', type: e.type, title: e.title, description: e.description, date: e.collection_date })),
            ...cctv.map(e => ({ id: e.ROWID, source: 'CCTVFootage', type: 'CCTV', title: 'CCTV ' + e.location, description: e.description, date: e.captured_at })),
            ...phone.map(e => ({ id: e.ROWID, source: 'PhoneRecord', type: 'Mobile', title: 'Call ' + e.caller + ' to ' + e.receiver, description: e.call_type, date: e.call_time })),
            ...financial.map(e => ({ id: e.ROWID, source: 'FinancialTransaction', type: 'Financial', title: 'Txn ' + e.amount, description: e.txn_type, date: e.txn_time })),
            ...weapons.map(e => ({ id: e.ROWID, source: 'Weapon', type: 'Weapon', title: e.type + ' ' + e.make, description: 'SN: ' + e.serial_number, date: null })),
            ...vehicles.map(e => ({ id: e.ROWID, source: 'Vehicle', type: 'Vehicle', title: e.make + ' ' + e.model, description: 'Plate: ' + e.license_plate, date: null }))
        ];

        // Masking logic based on Role (RBAC)
        const role = req.user?.role?.toUpperCase();
        if (role === 'ANALYST') {
            unified.forEach(u => {
                if (u.type === 'Mobile' || u.type === 'Financial') {
                    u.title = '*** MASKED ***';
                    u.description = 'Masked for Analysis';
                }
            });
        } else if (role === 'POLICYMAKER') {
            // Return only aggregated counts
            const counts = {};
            unified.forEach(u => {
                counts[u.type] = (counts[u.type] || 0) + 1;
            });
            return { isAggregated: true, counts };
        }

        // Calculate summary metrics
        const totalCount = unified.length;
        const typesCount = new Set(unified.map(u => u.type)).size;
        const completeness = Math.min(100, Math.round((typesCount / 8) * 100)); // Assuming 8 main types is a "complete" case

        await AuditService.logEvent(req, req.user, 'Accessed Evidence Workspace', 'EvidenceIntelligence', caseId, 'SUCCESS');

        return {
            caseId,
            summary: {
                totalCount,
                typesCount,
                completeness,
                quality: completeness > 75 ? 'High' : (completeness > 40 ? 'Medium' : 'Low')
            },
            evidence: unified
        };
    }
}

module.exports = new EvidenceAggregatorService();
