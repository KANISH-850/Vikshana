const datastoreClient = require('../queries/datastoreClient');

class CaseController {
    static async listCases(req, res) {
        try {
            const rows = await datastoreClient.getRows(req, 'CaseMaster', { maxRows: 100 });
            const cases = rows
                .filter((r) => r && r.ROWID)
                .map((r) => ({
                    id: r.ROWID,
                    title: r.title || r.Name || r.Case_Name || r.FIR_No || `FIR #${r.ROWID}`,
                    status: (r.status || r.Status || r.case_status || r.Case_Status || 'Active').replace(/Unknown/i, 'Active'),
                    jurisdiction: (r.jurisdiction || r.Jurisdiction || r.District || r.State || r.Police_Station || 'Sector 18 Precinct').replace(/Unknown/i, 'Sector 18 Precinct'),
                    createdAt: r.CREATEDTIME
                }));
            res.status(200).json({ success: true, data: cases });
        } catch (error) {
            console.error('Error in CaseController.listCases:', error);
            res.status(500).json({ success: false, error: 'Failed to list cases' });
        }
    }
}

module.exports = CaseController;
