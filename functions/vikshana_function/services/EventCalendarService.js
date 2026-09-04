/**
 * EventCalendarService.js
 * Provides configurable, year-specific festival and major public event windows.
 */
class EventCalendarService {
    static getEventsForYear(year = 2026) {
        return [
            { name: 'New Year', year, month: 1, day: 1, windowDays: 3, category: 'Public Holiday' },
            { name: 'Republic Day', year, month: 1, day: 26, windowDays: 2, category: 'National Event' },
            { name: 'Ugadi', year, month: 3, day: 30, windowDays: 3, category: 'Regional Festival' },
            { name: 'Ramadan / Eid', year, month: 4, day: 10, windowDays: 4, category: 'Religious Event' },
            { name: 'Independence Day', year, month: 8, day: 15, windowDays: 2, category: 'National Event' },
            { name: 'Ganesh Chaturthi', year, month: 9, day: 7, windowDays: 5, category: 'Regional Festival' },
            { name: 'Dasara', year, month: 10, day: 12, windowDays: 7, category: 'State Festival' },
            { name: 'Deepavali', year, month: 11, day: 1, windowDays: 4, category: 'Regional Festival' },
            { name: 'Christmas', year, month: 12, day: 25, windowDays: 3, category: 'Public Holiday' }
        ];
    }
}

module.exports = EventCalendarService;
