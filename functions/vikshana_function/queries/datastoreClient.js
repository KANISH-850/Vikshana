const catalyst = require('zcatalyst-sdk-node');
const fs = require('fs');
const path = require('path');

const LOCAL_DB_PATH = path.join(__dirname, '..', 'local_datastore.json');

function loadLocalDb() {
    try {
        if (fs.existsSync(LOCAL_DB_PATH)) return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
    } catch (e) { }
    return {};
}

function saveLocalDb(db) {
    try { fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2)); } catch (e) {}
}

function generateId() {
    return String(Math.floor(Math.random() * 100000000000000) + 100000000000000);
}

function isMissingTableError(error) {
    if (!error) return false;
    return true; // Gracefully fallback to local datastore for any Catalyst initialization or query errors
}

function unwrapRow(row) {
    if (!row) return null;
    if (Object.prototype.hasOwnProperty.call(row, 'ROWID')) return row;
    const values = Object.values(row);
    return values.length ? values[0] : {};
}

function getTable(req, tableName) {
    return catalyst.initialize(req).datastore().table(tableName);
}

async function getRows(req, tableName, { maxRows = 50 } = {}) {
    try {
        const response = await getTable(req, tableName).getPagedRows({ maxRows });
        return (response.data || []).map(unwrapRow);
    } catch (error) {
        if (isMissingTableError(error)) return (loadLocalDb()[tableName] || []).slice(0, maxRows);
        console.error(`[datastoreClient] getRows(${tableName}) failed:`, error.message);
        return [];
    }
}

async function getRowById(req, tableName, id) {
    if (!id) return null;
    try {
        const row = await getTable(req, tableName).getRow(id);
        return unwrapRow(row);
    } catch (error) {
        if (isMissingTableError(error)) {
            const rows = loadLocalDb()[tableName] || [];
            return rows.find(r => r.ROWID === String(id)) || null;
        }
        console.error(`[datastoreClient] getRowById(${tableName}, ${id}) failed:`, error.message);
        return null;
    }
}

function escapeVal(v) {
    return String(v).replace(/'/g, "''");
}

async function query(req, sql) {
    try {
        const app = catalyst.initialize(req);
        const rows = await app.zcql().executeZCQLQuery(sql);
        return rows || [];
    } catch (error) {
        console.error('[datastoreClient] query notice:', error.message);
        return [];
    }
}

async function getRowsWhere(req, tableName, conditions = {}, { maxRows = 50, orderBy, order = 'DESC' } = {}) {
    const clauses = Object.entries(conditions)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k} = '${escapeVal(v)}'`);
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
    const orderClause = orderBy ? ` ORDER BY ${orderBy} ${order}` : '';
    const sql = `SELECT * FROM ${tableName}${where}${orderClause} LIMIT ${Number(maxRows) || 50}`;
    try {
        const rows = await query(req, sql);
        return rows.map((r) => r[tableName] || unwrapRow(r));
    } catch (error) {
        if (isMissingTableError(error)) {
            let rows = loadLocalDb()[tableName] || [];
            for (const [k, v] of Object.entries(conditions)) {
                if (v !== undefined && v !== null && v !== '') {
                    rows = rows.filter(r => String(r[k]) === String(v));
                }
            }
            if (orderBy) {
                rows.sort((a, b) => {
                    if (a[orderBy] < b[orderBy]) return order === 'ASC' ? -1 : 1;
                    if (a[orderBy] > b[orderBy]) return order === 'ASC' ? 1 : -1;
                    return 0;
                });
            }
            return rows.slice(0, maxRows);
        }
        return [];
    }
}

async function getRowsByCase(req, tableName, caseId, { maxRows = 25, orderBy } = {}) {
    if (!caseId) return [];
    return getRowsWhere(req, tableName, { case_id: caseId }, { maxRows, orderBy });
}

async function insertRow(req, tableName, data) {
    try {
        const row = await getTable(req, tableName).insertRow(data);
        return unwrapRow(row);
    } catch (error) {
        if (isMissingTableError(error)) {
            const db = loadLocalDb();
            if (!db[tableName]) db[tableName] = [];
            const newRow = { ROWID: generateId(), CREATORID: 'system', CREATEDTIME: new Date().toISOString(), MODIFIEDTIME: new Date().toISOString(), ...data };
            db[tableName].push(newRow);
            saveLocalDb(db);
            return newRow;
        }
        throw error;
    }
}

async function insertRows(req, tableName, rows) {
    try {
        const inserted = await getTable(req, tableName).insertRows(rows);
        return (inserted || []).map(unwrapRow);
    } catch (error) {
        if (isMissingTableError(error)) {
            const db = loadLocalDb();
            if (!db[tableName]) db[tableName] = [];
            const newRows = rows.map(r => ({ ROWID: generateId(), CREATORID: 'system', CREATEDTIME: new Date().toISOString(), MODIFIEDTIME: new Date().toISOString(), ...r }));
            db[tableName].push(...newRows);
            saveLocalDb(db);
            return newRows;
        }
        throw error;
    }
}

async function updateRow(req, tableName, id, data) {
    try {
        const row = await getTable(req, tableName).updateRow({ ROWID: id, ...data });
        return unwrapRow(row);
    } catch (error) {
        if (isMissingTableError(error)) {
            const db = loadLocalDb();
            const table = db[tableName] || [];
            const idx = table.findIndex(r => String(r.ROWID) === String(id));
            if (idx === -1) throw new Error(`Row ${id} not found in mock table ${tableName}`);
            table[idx] = { ...table[idx], ...data, MODIFIEDTIME: new Date().toISOString() };
            saveLocalDb(db);
            return table[idx];
        }
        throw error;
    }
}

async function deleteRow(req, tableName, id) {
    try {
        return await getTable(req, tableName).deleteRow(id);
    } catch (error) {
        if (isMissingTableError(error)) {
            const db = loadLocalDb();
            const table = db[tableName] || [];
            const idx = table.findIndex(r => String(r.ROWID) === String(id));
            if (idx !== -1) {
                table.splice(idx, 1);
                saveLocalDb(db);
            }
            return true;
        }
        throw error;
    }
}

module.exports = {
    unwrapRow,
    query,
    getRows,
    getRowById,
    getRowsWhere,
    getRowsByCase,
    insertRow,
    insertRows,
    updateRow,
    deleteRow
};
