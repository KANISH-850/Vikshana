/**
 * EventCalendarService.js
 * Provides year-specific festival and major public event windows.
 */
class EventCalendarService {
    static YEAR_EVENT_CALENDAR = {
        2024: [
            { name: 'New Year', year: 2024, month: 1, day: 1, windowDays: 3, category: 'Public Holiday' },
            { name: 'Republic Day', year: 2024, month: 1, day: 26, windowDays: 2, category: 'National Event' },
            { name: 'Ugadi', year: 2024, month: 4, day: 9, windowDays: 3, category: 'Regional Festival' },
            { name: 'Ramadan / Eid', year: 2024, month: 4, day: 11, windowDays: 4, category: 'Religious Event' },
            { name: 'Independence Day', year: 2024, month: 8, day: 15, windowDays: 2, category: 'National Event' },
            { name: 'Ganesh Chaturthi', year: 2024, month: 9, day: 7, windowDays: 5, category: 'Regional Festival' },
            { name: 'Dasara', year: 2024, month: 10, day: 12, windowDays: 7, category: 'State Festival' },
            { name: 'Deepavali', year: 2024, month: 11, day: 1, windowDays: 4, category: 'Regional Festival' },
            { name: 'Christmas', year: 2024, month: 12, day: 25, windowDays: 3, category: 'Public Holiday' }
        ],
        2025: [
            { name: 'New Year', year: 2025, month: 1, day: 1, windowDays: 3, category: 'Public Holiday' },
            { name: 'Republic Day', year: 2025, month: 1, day: 26, windowDays: 2, category: 'National Event' },
            { name: 'Ugadi', year: 2025, month: 3, day: 30, windowDays: 3, category: 'Regional Festival' },
            { name: 'Ramadan / Eid', year: 2025, month: 3, day: 31, windowDays: 4, category: 'Religious Event' },
            { name: 'Independence Day', year: 2025, month: 8, day: 15, windowDays: 2, category: 'National Event' },
            { name: 'Ganesh Chaturthi', year: 2025, month: 8, day: 27, windowDays: 5, category: 'Regional Festival' },
            { name: 'Dasara', year: 2025, month: 10, day: 2, windowDays: 7, category: 'State Festival' },
            { name: 'Deepavali', year: 2025, month: 10, day: 20, windowDays: 4, category: 'Regional Festival' },
            { name: 'Christmas', year: 2025, month: 12, day: 25, windowDays: 3, category: 'Public Holiday' }
        ],
        2026: [
            { name: 'New Year', year: 2026, month: 1, day: 1, windowDays: 3, category: 'Public Holiday' },
            { name: 'Republic Day', year: 2026, month: 1, day: 26, windowDays: 2, category: 'National Event' },
            { name: 'Ugadi', year: 2026, month: 3, day: 19, windowDays: 3, category: 'Regional Festival' },
            { name: 'Ramadan / Eid', year: 2026, month: 3, day: 20, windowDays: 4, category: 'Religious Event' },
            { name: 'Independence Day', year: 2026, month: 8, day: 15, windowDays: 2, category: 'National Event' },
            { name: 'Ganesh Chaturthi', year: 2026, month: 9, day: 14, windowDays: 5, category: 'Regional Festival' },
            { name: 'Dasara', year: 2026, month: 10, day: 20, windowDays: 7, category: 'State Festival' },
            { name: 'Deepavali', year: 2026, month: 11, day: 8, windowDays: 4, category: 'Regional Festival' },
            { name: 'Christmas', year: 2026, month: 12, day: 25, windowDays: 3, category: 'Public Holiday' }
        ]
    };

    static getEventsForYear(year) {
        const y = parseInt(year, 10);
        if (this.YEAR_EVENT_CALENDAR[y]) {
            return {
                status: 'AVAILABLE',
                year: y,
                events: this.YEAR_EVENT_CALENDAR[y]
            };
        }

        // Fallback for years where explicit festival dates are unconfigured
        return {
            status: 'UNAVAILABLE_FALLBACK',
            year: y,
            message: `Year-specific festival calendar unconfigured for year ${y}. Event analysis skipped for this year without date guessing.`,
            events: []
        };
    }
}

module.exports = EventCalendarService;
