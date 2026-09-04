const datastoreClient = require('../queries/datastoreClient');
const DateUtils = require('../utils/dateUtils');
const scoringConfig = require('../config/scoringConfig');

class DataQualityService {
    static async getDataQualityReport(req) {
        try {
            const cases = await datastoreClient.getRows(req, 'CaseMaster', { maxRows: 10000 }).catch(() => []);
            const totalRecords = cases.length;

            if (totalRecords === 0) {
                return {
                    status: 'INSUFFICIENT_DATA',
                    overallQualityScore: 0,
                    metrics: { completeness: 0, validity: 0, uniqueness: 0, freshness: 0 },
                    message: 'No records available to evaluate data quality.'
                };
            }

            let validDates = 0;
            let validLocations = 0;
            let validFIRTypes = 0;
            const uniqueIDs = new Set();
            let maxDatasetTimestamp = new Date(0);

            cases.forEach(c => {
                const id = c.ROWID || c.CaseMaster_Id;
                if (id) uniqueIDs.add(id);

                const dateStr = c.CrimeRegisteredDate || c.CREATEDTIME || c.FIRDate;
                const dt = DateUtils.parseDate(dateStr);
                if (dt) {
                    validDates++;
                    if (dt > maxDatasetTimestamp) maxDatasetTimestamp = dt;
                }

                if (c.UnitName || c.District_Name) validLocations++;
                if (c.CrimeGroup_Name || c.FIRType) validFIRTypes++;
            });

            const completeness = parseFloat(((validLocations + validFIRTypes) / (totalRecords * 2) * 100).toFixed(1));
            const validity = parseFloat((validDates / totalRecords * 100).toFixed(1));
            const uniqueness = parseFloat((uniqueIDs.size / totalRecords * 100).toFixed(1));

            // Empirical Data Freshness Calculation using reference date vs dataset max timestamp
            const referenceDate = maxDatasetTimestamp.getTime() > 0 ? maxDatasetTimestamp : new Date();
            const dataAgeDays = maxDatasetTimestamp.getTime() > 0 
                ? Math.max(0, Math.floor((referenceDate.getTime() - maxDatasetTimestamp.getTime()) / (1000 * 60 * 60 * 24)))
                : 999;

            let freshnessScore = 50.0;
            let freshnessLabel = 'Historical';

            for (const tier of scoringConfig.dataFreshnessDecay) {
                if (dataAgeDays <= tier.maxDays) {
                    freshnessScore = tier.score;
                    freshnessLabel = tier.label;
                    break;
                }
            }

            const overallQualityScore = parseFloat(((completeness * 0.35) + (validity * 0.30) + (uniqueness * 0.20) + (freshnessScore * 0.15)).toFixed(1));

            return {
                status: 'SUCCESS',
                overallQualityScore,
                totalRecordsAnalyzed: totalRecords,
                latestRecordDate: DateUtils.formatDateISO(maxDatasetTimestamp),
                referenceDate: DateUtils.formatDateISO(referenceDate),
                dataAgeDays,
                freshnessLabel,
                metrics: {
                    completeness: { score: completeness, description: 'Percentage of non-null location and crime classification fields.' },
                    validity: { score: validity, description: 'Percentage of valid ISO-parseable dates.' },
                    uniqueness: { score: uniqueness, description: 'Percentage of unique primary record identifiers.' },
                    freshness: { score: freshnessScore, label: freshnessLabel, ageDays: dataAgeDays, description: `Temporal decay rating based on dataset age (${dataAgeDays} days old).` }
                },
                methodology: 'Explainable weighted score evaluating Completeness (35%), Validity (30%), Uniqueness (20%), and Empirical Freshness Decay (15%).',
                disclaimer: 'Data quality metrics evaluate dataset structural integrity and coverage. They do not judge legal validity of reports.'
            };
        } catch (error) {
            console.error('Error in DataQualityService:', error);
            throw error;
        }
    }
}

module.exports = DataQualityService;
