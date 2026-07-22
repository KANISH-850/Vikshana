/**
 * ForecastingController.js
 * Crime Forecasting & Early Warning backend controller.
 */

const glmClient = require('../services/glmClient');

const FORECAST_DATA = {
    weeklyPrediction: [
        { day: 'Mon', predictedCrimes: 12, actualBaseline: 14, riskLevel: 'LOW' },
        { day: 'Tue', predictedCrimes: 15, actualBaseline: 13, riskLevel: 'LOW' },
        { day: 'Wed', predictedCrimes: 18, actualBaseline: 16, riskLevel: 'MEDIUM' },
        { day: 'Thu', predictedCrimes: 28, actualBaseline: 20, riskLevel: 'HIGH' },
        { day: 'Fri', predictedCrimes: 36, actualBaseline: 24, riskLevel: 'CRITICAL' },
        { day: 'Sat', predictedCrimes: 32, actualBaseline: 22, riskLevel: 'CRITICAL' },
        { day: 'Sun', predictedCrimes: 22, actualBaseline: 18, riskLevel: 'MEDIUM' }
    ],
    monthlyPrediction: [
        { week: 'Week 1', predictedCount: 94, trend: '+4%' },
        { week: 'Week 2', predictedCount: 112, trend: '+12%' },
        { week: 'Week 3', predictedCount: 140, trend: '+18%' },
        { week: 'Week 4', predictedCount: 125, trend: '+8%' }
    ],
    districtForecast: [
        { district: 'Peri-Urban', predictedIncidents: 142, riskScore: 88, status: 'CRITICAL' },
        { district: 'Central', predictedIncidents: 118, riskScore: 78, status: 'HIGH' },
        { district: 'Sector 3', predictedIncidents: 95, riskScore: 72, status: 'HIGH' },
        { district: 'North', predictedIncidents: 64, riskScore: 54, status: 'MEDIUM' },
        { district: 'South', predictedIncidents: 42, riskScore: 38, status: 'LOW' },
        { district: 'West', predictedIncidents: 30, riskScore: 28, status: 'LOW' }
    ],
    crimeTypeForecast: [
        { type: 'Property Crime', count: 185, share: '38%' },
        { type: 'Armed Intrusion', count: 112, share: '23%' },
        { type: 'Cyber/Wire Fraud', count: 98, share: '20%' },
        { type: 'Violent Assault', count: 54, share: '11%' },
        { type: 'Narcotics Trafficking', count: 42, share: '8%' }
    ],
    hotspots: [
        { id: 'HS-1', name: 'Sector 18 Commercial Vault Alley', district: 'Peri-Urban', densityScore: 92, riskLevel: 'CRITICAL', threatType: 'Armed Intrusion', peakHours: '21:00 - 01:30' },
        { id: 'HS-2', name: 'Eastern Expressway Transit Hub', district: 'Central', densityScore: 84, riskLevel: 'HIGH', threatType: 'Extortion & Stolen Goods', peakHours: '18:00 - 22:00' },
        { id: 'HS-3', name: 'Sector 3 Electronics Exchange', district: 'Sector 3', densityScore: 78, riskLevel: 'HIGH', threatType: 'Wire & Fencing Fraud', peakHours: '11:00 - 16:00' },
        { id: 'HS-4', name: 'North Railway Freight Yard', district: 'North', densityScore: 62, riskLevel: 'MEDIUM', threatType: 'Cargo Larceny', peakHours: '02:00 - 05:00' }
    ],
    earlyWarningAlerts: [
        {
            id: 'ALT-2026-09',
            title: 'CRITICAL: Peri-Urban Armed Intrusion Spike Flagged',
            severity: 'CRITICAL',
            district: 'Peri-Urban',
            timestamp: '2026-07-22T22:00:00Z',
            summary: 'Predicted 38% increase in armed property intrusion over the next 72 hours matching Vikram Sharma syndicate MO.',
            factors: ['NEET Youth Unemployment > 15.2%', 'Parole Release Vector', 'Thursday Night Shift Window'],
            recommendedAction: 'Deploy high-visibility mobile patrols along Sector 18 Commercial Vault Alley between 21:00 and 02:00 hrs.'
        },
        {
            id: 'ALT-2026-08',
            title: 'HIGH: Emerging Gang Recruitment Cluster in Sector 3',
            severity: 'HIGH',
            district: 'Sector 3',
            timestamp: '2026-07-22T19:30:00Z',
            summary: 'Education Disparity Index spike correlated with localized juvenile property offences.',
            factors: ['40% Secondary School Dropout Rate', 'Unregulated Youth Gathering Grounds'],
            recommendedAction: 'Initiate After-School Safe Zones program and increase foot patrols near high schools.'
        },
        {
            id: 'ALT-2026-07',
            title: 'MEDIUM: Wire Fraud Network Activity Detected',
            severity: 'MEDIUM',
            district: 'Central',
            timestamp: '2026-07-22T14:15:00Z',
            summary: 'Increase in flagged financial transactions across digital wallet nodes.',
            factors: ['Flagged Merchant Account Volume +18%', 'Shell Company Formation Pattern'],
            recommendedAction: 'Issue advisory to regional bank compliance officers regarding suspicious electronic transfers.'
        }
    ]
};

class ForecastingController {
    static async getDashboard(req, res) {
        try {
            res.status(200).json({
                success: true,
                data: {
                    weeklyPrediction: FORECAST_DATA.weeklyPrediction,
                    monthlyPrediction: FORECAST_DATA.monthlyPrediction,
                    districtForecast: FORECAST_DATA.districtForecast,
                    crimeTypeForecast: FORECAST_DATA.crimeTypeForecast
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getHotspots(req, res) {
        try {
            res.status(200).json({ success: true, data: FORECAST_DATA.hotspots });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getEarlyWarnings(req, res) {
        try {
            res.status(200).json({ success: true, data: FORECAST_DATA.earlyWarningAlerts });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async explainPrediction(req, res) {
        try {
            const { alertId, hotspotId } = req.body || {};
            const alert = FORECAST_DATA.earlyWarningAlerts.find(a => a.id === alertId) || FORECAST_DATA.earlyWarningAlerts[0];

            res.status(200).json({
                success: true,
                data: {
                    target: alert.title,
                    confidenceScore: 0.91,
                    riskSeverity: alert.severity,
                    factorsConsidered: [
                        'Historical 5-year spatial-temporal crime density matrix',
                        'NEET youth unemployment index spikes in target sector',
                        'Repeat offender parole release timeline correlation',
                        'Weather and seasonal shift vectors'
                    ],
                    historicalTrend: '38% increase compared to 4-week baseline average.',
                    reasoning: [
                        'Causal regression model identified strong interaction between NEET unemployment (15.2%) and Thursday night vault intrusions.',
                        'Spatial density clustering mapped top 3 escape corridors with 92% probability.',
                        'Parole releases in past 30 days created localized recruitment opportunities.'
                    ],
                    supportingEvidence: alert.factors,
                    generatedAt: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = ForecastingController;
