const catalyst = require('zcatalyst-sdk-node');

/**
 * Catalyst's getPagedRows()/insertRow() responses nest each row's columns
 * under the table name (e.g. { CaseMaster: { ROWID, ... } }) at runtime,
 * even though the SDK's .d.ts types claim a flat ICatalystRow. Every
 * pre-existing service in this codebase unwraps rows the same way
 * (`Object.values(row)[0] || {}`) — this helper centralizes that.
 */
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
        console.error('[datastoreClient] query failed:', error.message, sql);
        return [];
    }
}

/**
 * Generic ZCQL equality-AND fetch (Catalyst's SQL dialect) instead of pulling
 * every row and filtering in JS. `conditions` values are simple equality
 * matches; undefined/null/'' entries are skipped so partial filters work.
 */
async function getRowsWhere(req, tableName, conditions = {}, { maxRows = 50, orderBy, order = 'DESC' } = {}) {
    const clauses = Object.entries(conditions)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k} = '${escapeVal(v)}'`);
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
    const orderClause = orderBy ? ` ORDER BY ${orderBy} ${order}` : '';
    const sql = `SELECT * FROM ${tableName}${where}${orderClause} LIMIT ${Number(maxRows) || 50}`;
    const rows = await query(req, sql);
    return rows.map((r) => r[tableName] || unwrapRow(r));
}

/** Case-scoped fetch — every new investigation-data table carries a `case_id` column by convention. */
async function getRowsByCase(req, tableName, caseId, { maxRows = 25, orderBy } = {}) {
    if (!caseId) return [];
    return getRowsWhere(req, tableName, { case_id: caseId }, { maxRows, orderBy });
}

async function insertRow(req, tableName, data) {
    const row = await getTable(req, tableName).insertRow(data);
    return unwrapRow(row);
}

async function insertRows(req, tableName, rows) {
    const inserted = await getTable(req, tableName).insertRows(rows);
    return (inserted || []).map(unwrapRow);
}

async function updateRow(req, tableName, id, data) {
    const row = await getTable(req, tableName).updateRow({ ROWID: id, ...data });
    return unwrapRow(row);
}

async function deleteRow(req, tableName, id) {
    return getTable(req, tableName).deleteRow(id);
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
