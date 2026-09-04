const datastoreClient = require('../queries/datastoreClient');
const EventCalendarService = require('./EventCalendarService');

class SeasonalEventIntelligenceService {
    static MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    static DAY_NAMES = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    static async getSeasonalIntelligence(req) {
        try {
            const cases = await datastoreClient.getRows(req, 'CaseMaster', { maxRows: 2000 }).catch(() => []);
            
            const monthCounts = Array(12).fill(0);
            const monthCrimeTypes = Array.from({ length: 12 }, () => ({}));
            const monthLocations = Array.from({ length: 12 }, () => ({}));
            
            const dayCounts = Array(7).fill(0);
            const dayCrimeTypes = Array.from({ length: 7 }, () => ({}));

            const timeSlotCounts = {
                morning: 0,   // 06:00 - 12:00
                afternoon: 0, // 12:00 - 18:00
                evening: 0,   // 18:00 - 24:00
                night: 0      // 00:00 - 06:00
            };
            const hourCounts = Array(24).fill(0);
            let detailedTimeAvailable = false;

            const caseDates = [];

            cases.forEach(c => {
                const dateStr = c.CrimeRegisteredDate || c.CREATEDTIME || c.FIRDate;
                if (!dateStr) return;

                const dt = new Date(dateStr);
                if (isNaN(dt.getTime())) return;

                caseDates.push({ date: dt, record: c });

                const monthIdx = dt.getMonth();
                const dayIdx = dt.getDay();
                const crimeType = c.CrimeGroup_Name || c.FIRType || 'General Crime';
                const location = c.UnitName || c.District_Name || 'Unknown District';

                monthCounts[monthIdx]++;
                monthCrimeTypes[monthIdx][crimeType] = (monthCrimeTypes[monthIdx][crimeType] || 0) + 1;
                monthLocations[monthIdx][location] = (monthLocations[monthIdx][location] || 0) + 1;

                dayCounts[dayIdx]++;
                dayCrimeTypes[dayIdx][crimeType] = (dayCrimeTypes[dayIdx][crimeType] || 0) + 1;

                if (dateStr.includes('T') || dateStr.includes(':')) {
                    const hour = dt.getHours();
                    hourCounts[hour]++;
                    detailedTimeAvailable = true;
                    if (hour >= 6 && hour < 12) timeSlotCounts.morning++;
                    else if (hour >= 12 && hour < 18) timeSlotCounts.afternoon++;
                    else if (hour >= 18 && hour < 24) timeSlotCounts.evening++;
                    else timeSlotCounts.night++;
                }
            });

            const totalCases = cases.length || 1;
            const historicalMonthlyAvg = parseFloat((totalCases / 12).toFixed(2));

            // Monthly Trends Analysis
            const monthlyTrends = this.MONTH_NAMES.map((name, i) => {
                const count = monthCounts[i];
                const prevCount = monthCounts[i === 0 ? 11 : i - 1];
                const momChange = prevCount > 0 ? parseFloat((((count - prevCount) / prevCount) * 100).toFixed(2)) : 0;
                
                const topCrimeType = Object.entries(monthCrimeTypes[i])
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
                const topLocation = Object.entries(monthLocations[i])
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

                return {
                    month: name,
                    monthNumber: i + 1,
                    crimeCount: count,
                    historicalAverage: historicalMonthlyAvg,
                    momChangePct: momChange,
                    topCrimeType,
                    mostAffectedLocation: topLocation,
                    growthStatus: count > historicalMonthlyAvg ? 'ABOVE_AVERAGE' : 'BELOW_AVERAGE'
                };
            });

            const peakMonth = [...monthlyTrends].sort((a, b) => b.crimeCount - a.crimeCount)[0] || monthlyTrends[0];

            // Day of Week Analysis
            const dailyPatterns = this.DAY_NAMES.map((name, i) => {
                const count = dayCounts[i];
                const topCategory = Object.entries(dayCrimeTypes[i])
                    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

                return {
                    day: name,
                    crimeCount: count,
                    percentageOfTotal: parseFloat(((count / totalCases) * 100).toFixed(2)),
                    topCategory
                };
            });

            const peakDay = [...dailyPatterns].sort((a, b) => b.crimeCount - a.crimeCount)[0] || dailyPatterns[0];
            const lowestDay = [...dailyPatterns].sort((a, b) => a.crimeCount - b.crimeCount)[0] || dailyPatterns[0];

            // Event Intelligence Analysis — Uses Actual Case Date Filtering against Year-Specific Event Windows
            const dailyHistoricalAvg = parseFloat((totalCases / 365).toFixed(2));
            const availableYears = [2024, 2025, 2026];
            let allConfiguredEvents = [];
            const yearCalendarStatus = [];

            availableYears.forEach(yr => {
                const res = EventCalendarService.getEventsForYear(yr);
                yearCalendarStatus.push({ year: yr, status: res.status });
                if (res.status === 'AVAILABLE') {
                    allConfiguredEvents = allConfiguredEvents.concat(res.events);
                }
            });

            const eventAnalysis = allConfiguredEvents.map(event => {
                const windowBaseline = dailyHistoricalAvg * event.windowDays;
                
                // Actual incident count matching exact Year, Month, and Day window
                let actualObservedCount = 0;
                caseDates.forEach(cd => {
                    const y = cd.date.getFullYear();
                    const m = cd.date.getMonth() + 1;
                    const d = cd.date.getDate();
                    if (y === event.year && m === event.month && d >= event.day && d < (event.day + event.windowDays)) {
                        actualObservedCount++;
                    }
                });

                const deviationPct = windowBaseline > 0 
                    ? parseFloat((((actualObservedCount - windowBaseline) / windowBaseline) * 100).toFixed(2)) 
                    : 0;

                const anomalyScore = parseFloat((Math.abs(deviationPct) / 10).toFixed(2));

                return {
                    event: event.name,
                    year: event.year,
                    category: event.category,
                    eventWindow: `${event.windowDays} days (Year ${event.year}, Month ${event.month})`,
                    historicalBaseline: parseFloat(windowBaseline.toFixed(1)),
                    observedCrimeCount: actualObservedCount,
                    percentageChange: deviationPct,
                    anomalyScore: anomalyScore,
                    confidence: cases.length > 50 ? 'High' : 'Medium',
                    evidence: [
                        `Filtered incident count of ${actualObservedCount} recorded during ${event.name} (${event.year}) date window.`,
                        `Historical baseline for ${event.windowDays}-day period is ${windowBaseline.toFixed(1)}.`,
                        `Statistical deviation observed: ${deviationPct >= 0 ? '+' : ''}${deviationPct}%.`
                    ],
                    disclaimer: "Observed variation during an event period does not establish that the event caused the change.",
                    neutralInsight: deviationPct > 10 
                        ? `Reported incidents during the ${event.name} (${event.year}) window coincided with a ${deviationPct}% increase above baseline.`
                        : `Incident levels observed during ${event.name} (${event.year}) remained consistent with baseline patterns.`
                };
            });

            return {
                status: 'SUCCESS',
                summaryCards: {
                    peakCrimeMonth: peakMonth.month,
                    highestRiskDay: peakDay.day,
                    lowestRiskDay: lowestDay.day,
                    totalAnalyzedRecords: cases.length,
                    detailedTimeAvailable
                },
                monthlyTrends,
                dailyPatterns,
                timeOfDayPatterns: detailedTimeAvailable ? {
                    slots: timeSlotCounts,
                    hourlyDistribution: hourCounts
                } : {
                    status: 'UNAVAILABLE',
                    message: 'Detailed time-of-day timestamp analysis is unavailable due to dataset granularity limits.'
                },
                eventIntelligence: eventAnalysis,
                dataProvenance: {
                    dataSource: 'Karnataka State Police CaseMaster Dataset',
                    datasetType: 'Historical Crime Records',
                    coverage: 'State-level District & Unit records',
                    lastUpdated: new Date().toISOString().split('T')[0]
                }
            };
        } catch (error) {
            console.error('Error in SeasonalEventIntelligenceService:', error);
            throw error;
        }
    }
}

module.exports = SeasonalEventIntelligenceService;
