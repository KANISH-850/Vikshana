const datastoreClient = require('../queries/datastoreClient');

/**
 * AuditService
 * Handles pushing and retrieving AuditLogs from the Catalyst Data Store.
 */
class AuditService {
    /**
     * Creates a new Audit Log entry.
     * @param {Object} req - Express request object (used to extract IP, browser)
     * @param {Object} user - User object (contains id, name, role)
     * @param {String} action - Action performed (e.g. 'Login', 'Viewed Evidence')
     * @param {String} resource - Resource accessed or affected
     * @param {String} case_id - Case ID if applicable
     * @param {String} status - Status of the action (e.g. 'SUCCESS', 'FAILED')
     */
    static async logEvent(req, user, action, resource = '', case_id = '', status = 'SUCCESS') {
        try {
            const timestamp = new Date().toISOString();
            const log_id = `LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            
            const ip_address = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';
            const browser = req?.headers?.['user-agent'] || 'Unknown Browser';

            const user_id = user?.id || user?.user_id || 'ANONYMOUS';
            const user_name = user?.name || user?.email || 'System';
            const role = user?.role || 'Officer';

            const logData = {
                log_id,
                user_id,
                user_name,
                role,
                action,
                resource,
                case_id,
                status,
                ip_address,
                browser,
                timestamp,
                http_method: req?.method || 'UNKNOWN',
                reason: status === 'DENIED' ? 'Unauthorized access attempt blocked by RBAC middleware.' : 'Success'
            };

            await datastoreClient.insertRow(req, 'AuditLog', logData);
            return logData;
        } catch (error) {
            console.error('[AuditService] Failed to log event:', error);
            // Non-blocking, so we don't return/throw error to disrupt user flows
            return null;
        }
    }

    /**
     * Retrieves audit logs with optional filtering.
     */
    static async getLogs(filters = {}) {
        try {
            // Ideally we should use ZCQL for filtering in production.
            // For simplicity and fallback compatibility, we will fetch all or use datastoreClient methods.
            const query = 'SELECT * FROM AuditLog ORDER BY CREATEDTIME DESC LIMIT 1000';
            const results = await datastoreClient.executeQuery(query);
            let logs = results.map(r => r.AuditLog);

            // Apply filters manually if datastoreClient's executeQuery doesn't support advanced WHERE clauses yet
            if (filters.action) {
                logs = logs.filter(l => l.action === filters.action);
            }
            if (filters.user_id) {
                logs = logs.filter(l => l.user_id === filters.user_id);
            }
            if (filters.case_id) {
                logs = logs.filter(l => l.case_id === filters.case_id);
            }
            if (filters.status) {
                logs = logs.filter(l => l.status === filters.status);
            }
            if (filters.startDate && filters.endDate) {
                const start = new Date(filters.startDate).getTime();
                const end = new Date(filters.endDate).getTime();
                logs = logs.filter(l => {
                    const t = new Date(l.timestamp).getTime();
                    return t >= start && t <= end;
                });
            }

            return logs;
        } catch (error) {
            console.error('[AuditService] Failed to fetch logs:', error);
            throw new Error('Failed to fetch audit logs');
        }
    }
}

module.exports = AuditService;
