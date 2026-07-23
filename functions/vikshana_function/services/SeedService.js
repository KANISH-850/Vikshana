const datastoreClient = require('../queries/datastoreClient');

const WITNESS_NAMES = ['Ramesh Iyer', 'Lakshmi Devi', 'Arjun Nair', 'Fatima Sheikh', 'Vikram Rao', 'Meena Pillai'];
const SUSPECT_NAMES = ['Suresh Kumar', 'Anil Sharma', 'Deepak Verma', 'Farhan Ali', 'Rajesh Gowda'];
const LOCATIONS = ['MG Road Junction', 'Silk Board Signal', 'Whitefield Metro Gate', 'Jayanagar 4th Block', 'Electronic City Phase 1'];
const CALL_TYPES = ['Incoming', 'Outgoing', 'Missed'];
const TXN_TYPES = ['UPI Transfer', 'NEFT', 'Cash Withdrawal', 'POS Purchase'];

function pick(arr, i) {
    return arr[i % arr.length];
}

function hoursAgo(n) {
    return new Date(Date.now() - n * 3600 * 1000).toISOString();
}

function buildWitnesses(caseId) {
    return [0, 1, 2].map((i) => ({
        case_id: caseId,
        name: pick(WITNESS_NAMES, i),
        contact: `+91-98${(400000000 + i * 137)}`,
        statement_summary: `Reported seeing activity near ${pick(LOCATIONS, i)} around the time of the incident.`,
        statement_full: `On the night of the incident, I was near ${pick(LOCATIONS, i)} and noticed unusual movement. I am willing to cooperate further with the investigation team.`,
        reliability_score: 60 + i * 10,
        is_ignored: false
    }));
}

function buildSuspects(caseId) {
    return [0, 1].map((i) => ({
        case_id: caseId,
        name: pick(SUSPECT_NAMES, i),
        alias: i === 0 ? 'Unknown' : `"${pick(SUSPECT_NAMES, i + 2).split(' ')[0]}"`,
        description: `Person of interest linked via ${i === 0 ? 'phone records' : 'financial transactions'} associated with the case.`,
        risk_level: i === 0 ? 'high' : 'medium',
        status: 'person_of_interest'
    }));
}

function buildCctv(caseId) {
    return [0, 1].map((i) => ({
        case_id: caseId,
        location: pick(LOCATIONS, i),
        captured_at: hoursAgo(20 + i * 4),
        description: `Footage shows an individual matching the reported description near ${pick(LOCATIONS, i)}.`,
        confidence_score: 80 + i * 8,
        file_store_key: ''
    }));
}

function buildPhoneRecords(caseId) {
    return [0, 1, 2].map((i) => ({
        case_id: caseId,
        caller: `+91-90${(100000000 + i * 211)}`,
        receiver: `+91-91${(200000000 + i * 311)}`,
        call_time: hoursAgo(18 + i * 3),
        duration_seconds: 30 + i * 45,
        call_type: pick(CALL_TYPES, i),
        is_suspicious: i === 0
    }));
}

function buildFinancialTransactions(caseId) {
    return [0, 1].map((i) => ({
        case_id: caseId,
        from_account: `XXXX-${1000 + i}`,
        to_account: `XXXX-${5000 + i}`,
        amount: 5000 + i * 12500,
        txn_time: hoursAgo(15 + i * 6),
        txn_type: pick(TXN_TYPES, i),
        is_flagged: i === 0
    }));
}

function buildTimelineEvents(caseId) {
    return [0, 1, 2].map((i) => ({
        case_id: caseId,
        event_time: hoursAgo(24 - i * 6),
        title: i === 0 ? 'FIR Registered' : i === 1 ? 'Witness Statement Recorded' : 'CCTV Footage Retrieved',
        description: i === 0
            ? 'Initial First Information Report filed and case opened for investigation.'
            : i === 1
                ? 'Statement recorded from a witness placing a person of interest near the scene.'
                : 'CCTV footage from the surrounding area collected for review.',
        source_type: i === 0 ? 'case' : i === 1 ? 'witness' : 'cctv',
        source_id: ''
    }));
}

const SEED_TABLES = [
    { table: 'Witness', build: buildWitnesses },
    { table: 'Suspect', build: buildSuspects },
    { table: 'CCTVFootage', build: buildCctv },
    { table: 'PhoneRecord', build: buildPhoneRecords },
    { table: 'FinancialTransaction', build: buildFinancialTransactions },
    { table: 'TimelineEvent', build: buildTimelineEvents }
];

class SeedService {
    /** Fast parallelized case seeding. */
    static async seedCase(req, caseId) {
        const targetCaseId = caseId || '1';
        const result = { caseId: targetCaseId, inserted: {} };

        await Promise.all(
            SEED_TABLES.map(async ({ table, build }) => {
                try {
                    const existing = await datastoreClient.getRowsByCase(req, table, targetCaseId, { maxRows: 1 });
                    if (existing && existing.length > 0) {
                        result.inserted[table] = 0;
                        return;
                    }
                    const rows = build(targetCaseId);
                    const inserted = await datastoreClient.insertRows(req, table, rows);
                    result.inserted[table] = (inserted || []).length;
                } catch (err) {
                    console.warn(`Seeding table ${table} warning:`, err.message);
                    result.inserted[table] = 0;
                }
            })
        );

        return result;
    }

    static async seedAllCases(req, targetCaseId) {
        if (targetCaseId) {
            return [await SeedService.seedCase(req, targetCaseId)];
        }
        let cases = await datastoreClient.getRows(req, 'CaseMaster', { maxRows: 10 }).catch(() => []);
        if (!cases || cases.length === 0) {
            const dummyCases = [
                { Status: 'Open', Jurisdiction: 'Indiranagar PS' },
                { Status: 'Under Investigation', Jurisdiction: 'Koramangala PS' }
            ];
            await datastoreClient.insertRows(req, 'CaseMaster', dummyCases).catch(() => []);
            cases = await datastoreClient.getRows(req, 'CaseMaster', { maxRows: 10 }).catch(() => []);
        }

        const caseIdToSeed = (cases && cases[0] && cases[0].ROWID) ? cases[0].ROWID : '1';
        return [await SeedService.seedCase(req, caseIdToSeed)];
    }
}

module.exports = SeedService;
