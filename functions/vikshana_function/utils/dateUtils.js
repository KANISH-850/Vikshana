/**
 * dateUtils.js
 * Centralized Date Normalization & Parsing Utility
 */
class DateUtils {
    static parseDate(value) {
        if (!value) return null;

        if (value instanceof Date) {
            return isNaN(value.getTime()) ? null : value;
        }

        const str = String(value).trim();
        if (!str) return null;

        // Try standard ISO / JS Date parse first
        let dt = new Date(str);
        if (!isNaN(dt.getTime())) {
            return dt;
        }

        // Support DD-MM-YYYY or DD/MM/YYYY
        const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (ddmmyyyyMatch) {
            const day = parseInt(ddmmyyyyMatch[1], 10);
            const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
            const year = parseInt(ddmmyyyyMatch[3], 10);
            dt = new Date(Date.UTC(year, month, day));
            return isNaN(dt.getTime()) ? null : dt;
        }

        // Support YYYY-MM-DD or YYYY/MM/DD
        const yyyymmddMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        if (yyyymmddMatch) {
            const year = parseInt(yyyymmddMatch[1], 10);
            const month = parseInt(yyyymmddMatch[2], 10) - 1;
            const day = parseInt(yyyymmddMatch[3], 10);
            dt = new Date(Date.UTC(year, month, day));
            return isNaN(dt.getTime()) ? null : dt;
        }

        return null;
    }

    static formatDateISO(value) {
        const dt = this.parseDate(value);
        return dt ? dt.toISOString().split('T')[0] : 'N/A';
    }

    static getMonthSpan(minDate, maxDate) {
        if (!minDate || !maxDate) return 1;
        const start = this.parseDate(minDate);
        const end = this.parseDate(maxDate);
        if (!start || !end || end < start) return 1;

        const yearDiff = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();
        const totalMonths = (yearDiff * 12) + monthDiff + 1;
        return Math.max(1, totalMonths);
    }
}

module.exports = DateUtils;
