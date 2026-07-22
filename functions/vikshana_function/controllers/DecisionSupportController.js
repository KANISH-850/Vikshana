/**
 * DecisionSupportController.js
 * Investigator Decision Support backend controller.
 */

const glmClient = require('../services/glmClient');

const DECISION_CASE_DB = {
    '1': {
        caseId: 'CASE-2026-8841',
        title: 'Sector 18 Armed Intrusion & Gold Heist',
        status: 'ACTIVE_INVESTIGATION',
        summary: {
            overview: 'Armed intrusion at Commercial Vault Alley, Sector 18. Three masked individuals breached the secondary fire-escape door at 22:15 hrs on Thursday, neutralizing night guards and seizing 2.4 kg gold bullion.',
            victimSummary: 'Ramesh Patel (Head Security Officer, 48) - Suffering from blunt force trauma; stabilized at City Hospital.',
            accusedSummary: 'Primary suspect: Vikram Sharma (alias Vicky) identified via height/gait analysis; two unidentified accomplices.',
            evidenceSummary: '14 physical items logged including 9mm casing, severed hydraulic cutter wire, grey sedan tire treads, and CCTV footage stream.',
            timelineSummary: 'Event duration: 3 minutes 42 seconds (22:15:10 - 22:18:52 hrs). Escape via unmonitored Peri-Urban service road.',
            investigationStatus: 'CRITICAL PRIORITY · 72-Hour Evidentiary Window Active'
        },
        automatedTimeline: [
            { id: 'T-1', timestamp: '2026-05-12T21:45:00Z', type: 'FIR', title: 'Perimeter Breach Recorded', source: 'CCTV Camera #4', description: 'Dark grey sedan arrives at rear alley; lights doused.', confidence: 'HIGH' },
            { id: 'T-2', timestamp: '2026-05-12T22:15:10Z', type: 'Forensics', title: 'Hydraulic Door Cut', source: 'Physical Tool Mark Evidence', description: 'Wire cutters used to breach rear steel grate.', confidence: 'HIGH' },
            { id: 'T-3', timestamp: '2026-05-12T22:16:40Z', type: 'Witness', title: 'Guard Confrontation', source: 'Ramesh Patel Statement', description: 'Two suspects entered vault bay; armed with 9mm pistol.', confidence: 'HIGH' },
            { id: 'T-4', timestamp: '2026-05-12T22:18:52Z', type: 'FIR', title: 'Vehicle Getaway', source: 'ANPR License Camera', description: 'Grey sedan speeds north toward Peri-Urban border.', confidence: 'MEDIUM' }
        ],
        similarCases: [
            {
                caseId: 'FIR-2025-412',
                title: 'Sector 3 Commercial Vault Robbery',
                crimeType: 'Armed Intrusion',
                district: 'Peri-Urban',
                similarityScore: '94%',
                matchReason: 'Identical rear fire-escape entry method using hydraulic cutters and grey getaway vehicle.',
                evidenceMatch: ['9mm shell casing', 'Hydraulic cutter tool marks', 'Cloned license plate decoy']
            },
            {
                caseId: 'FIR-2024-118',
                title: 'Central Bank Branch Stash Heist',
                crimeType: 'Grand Larceny',
                district: 'Central',
                similarityScore: '81%',
                matchReason: 'Matched gait and weapon brand (9mm semi-automatic). Shift-change timing window.',
                evidenceMatch: ['CCTV gait analysis', 'Decoy vehicle route']
            }
        ],
        leadRecommendations: [
            {
                category: 'Digital & Telecom Evidence',
                recommendation: 'Issue emergency ZCQL query for cell-tower dump at Sector 18 Alley between 21:30 and 22:30 hrs.',
                confidence: 'HIGH',
                reason: 'Identify burner SIM cards active exclusively during the 60-minute intrusion window.',
                supportingRecords: ['Cell Tower #18B Logs', 'Telecom Provider CDR']
            },
            {
                category: 'Possible Suspect Leads',
                recommendation: 'Interrogate associate Imran Khan regarding dark grey sedan (license plate KL-07-BX-4410).',
                confidence: 'HIGH',
                reason: 'ANPR camera flagged vehicle matching registered specs owned by associate.',
                supportingRecords: ['ANPR Log #8821', 'Relationship Explorer Node #OFF-101']
            },
            {
                category: 'Financial Trail',
                recommendation: 'Flag pawn shop accounts linked to Rajesh Kumar in West Electronics Market.',
                confidence: 'MEDIUM',
                reason: 'Stolen gold bullion historically fenced within 72 hours via secondary pawn shop network.',
                supportingRecords: ['Financial Transaction Ledger #TXN-904', 'Fencing Intelligence Report']
            }
        ]
    }
};

class DecisionSupportController {
    static async getSummary(req, res) {
        try {
            const caseId = req.params.caseId || '1';
            const data = DECISION_CASE_DB[caseId] || DECISION_CASE_DB['1'];
            res.status(200).json({ success: true, data: data.summary });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getTimeline(req, res) {
        try {
            const caseId = req.params.caseId || '1';
            const data = DECISION_CASE_DB[caseId] || DECISION_CASE_DB['1'];
            res.status(200).json({ success: true, data: data.automatedTimeline });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getSimilarCases(req, res) {
        try {
            const caseId = req.params.caseId || '1';
            const data = DECISION_CASE_DB[caseId] || DECISION_CASE_DB['1'];
            res.status(200).json({ success: true, data: data.similarCases });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getLeadRecommendations(req, res) {
        try {
            const caseId = req.body?.caseId || req.params?.caseId || '1';
            const data = DECISION_CASE_DB[caseId] || DECISION_CASE_DB['1'];
            res.status(200).json({ success: true, data: data.leadRecommendations });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = DecisionSupportController;
