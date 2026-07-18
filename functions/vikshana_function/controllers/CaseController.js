const datastoreClient = require('../queries/datastoreClient');

class CaseController {
    static async listCases(req, res) {
        try {
            const rows = await datastoreClient.getRows(req, 'CaseMaster', { maxRows: 100 });
            const cases = rows
                .filter((r) => r && r.ROWID)
                .map((r) => ({
                    id: r.ROWID,
                    title: `FIR #${r.ROWID}`,
                    status: r.Status || 'Unknown',
                    jurisdiction: r.Jurisdiction || 'Unknown',
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
