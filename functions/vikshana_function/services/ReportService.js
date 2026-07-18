const catalyst = require('zcatalyst-sdk-node');
const ReportAgent = require('../agents/ReportAgent');

class ReportService {
    static async getReports(req) {
        const app = catalyst.initialize(req);
        const datastore = app.datastore();

        try {
            // Fetch Cases to list as reports
            const casesResponse = await datastore.table('CaseMaster').getPagedRows({ maxRows: 10 }).catch(() => ({ data: [] }));
            const cases = casesResponse.data || [];

            let reports = [];

            if (cases.length > 0) {
                cases.forEach((c) => {
                    const caseRow = Object.values(c)[0] || {};
                    reports.push({
                        id: caseRow.ROWID,
                        title: `Case Report: FIR #${caseRow.ROWID}`,
                        summary: `AI generated intelligence report for case in ${caseRow.Jurisdiction || 'Unknown Jurisdiction'}`,
                        date: caseRow.CREATEDTIME,
                        status: caseRow.Status || 'Closed',
                    });
                });
            } else {
                reports.push({
                    id: 'sample-1',
                    title: 'Sample Case Report: FIR #000',
                    summary: 'System generated placeholder report (No Datastore data found)',
                    date: new Date().toISOString(),
                    status: 'N/A'
                });
            }

            return reports;
        } catch (error) {
            console.error("Report Fetch Error:", error);
            throw error;
        }
    }

    static async generateReport(req) {
        const app = catalyst.initialize(req);
        const datastore = app.datastore();
        const { caseId } = req.body;

        try {
            // Deterministically gather context
            const caseRow = await datastore.table('CaseMaster').getRow(caseId).catch(() => null);
            if (!caseRow) throw new Error("Case not found");

            const context = {
                case_details: Object.values(caseRow)[0] || {}
            };

            // Call GLM ReportAgent to synthesize a professional PDF-ready markdown document
            const markdownReport = await ReportAgent.generateReport(context);
            
            return { markdown: markdownReport };
        } catch (error) {
            console.error("AI Generation Error:", error);
            throw error;
        }
    }
}

module.exports = ReportService;
