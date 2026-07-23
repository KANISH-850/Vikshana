/**
 * fieldFilter.middleware.js
 * 
 * Intercepts JSON responses and automatically strips or masks PII (Personally Identifiable Information)
 * based on the user's role before it leaves the server.
 */

function sanitizeData(data, role) {
    if (role === 'Supervisor' || role === 'Admin' || role === 'Administrator' || role === 'Investigator' || role === 'Officer') {
        return data; // Full access
    }

    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, role));
    }

    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            let newVal = sanitizeData(value, role);

            // Analyst: Mask personal identifiers
            if (role === 'Analyst') {
                if (['contact', 'phone', 'caller', 'receiver'].includes(key)) {
                    if (typeof value === 'string' && value.length > 4) {
                        newVal = '***-***-' + value.slice(-4);
                    } else if (value) {
                        newVal = '***-***-XXXX';
                    }
                }
                if (['address', 'location'].includes(key) && typeof value === 'string') {
                    newVal = '*** (RESTRICTED)';
                }
                if (['identityMasked', 'aadhaar', 'national_id'].includes(key) && value) {
                    newVal = 'XXXX-XXXX-XXXX';
                }
                if (['bank_account', 'account_number', 'financial_transaction', 'transaction_id', 'from_account', 'to_account', 'amount'].includes(key) && value) {
                    newVal = '***-HIDDEN-***';
                }
            }
            
            // Policymaker: Hide all personal identifiers (drop completely)
            if (role === 'Policymaker') {
                if ([
                    'contact', 'phone', 'caller', 'receiver', 
                    'address', 'location', 
                    'identityMasked', 'aadhaar', 'national_id',
                    'name', 'alias', 'fullName',
                    'from_account', 'to_account', 'bank_account', 'account_number', 'financial_transaction', 'transaction_id', 'amount'
                ].includes(key)) {
                    newVal = undefined; // Will be dropped from JSON
                }
            }

            if (newVal !== undefined) {
                sanitized[key] = newVal;
            }
        }
        return sanitized;
    }

    return data;
}

const fieldFilter = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (body) {
        // If a valid user is present and the body is structured properly, filter the payload.
        if (req.user && req.user.role && body) {
            // Apply filtering rules if the response body contains data
            if (body.success !== undefined && body.data !== undefined) {
                body.data = sanitizeData(body.data, req.user.role);
            } else if (Array.isArray(body) || typeof body === 'object') {
                // Apply to raw array or object if not wrapped in standard {success, data}
                body = sanitizeData(body, req.user.role);
            }
        }
        
        return originalJson.call(this, body);
    };

    next();
};

module.exports = { fieldFilter, sanitizeData };
