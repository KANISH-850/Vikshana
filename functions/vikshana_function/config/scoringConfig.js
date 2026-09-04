/**
 * scoringConfig.js
 * Centralized Configuration for Intelligence Scoring Weights and Thresholds
 */
module.exports = {
    hypothesisScoring: {
        baseScore: 0,
        weights: {
            supportingItem: 15,
            verifiedItem: 10,
            corroborationBonus: 20,
            timelineConsistency: 10,
            contradictionPenalty: 15,
            evidenceGapPenalty: 5
        },
        maxScore: 100,
        minScore: 0
    },
    dataFreshnessDecay: [
        { maxDays: 30, score: 95.0, label: 'Very Fresh' },
        { maxDays: 90, score: 80.0, label: 'Recent' },
        { maxDays: 365, score: 65.0, label: 'Aging' },
        { maxDays: Infinity, score: 45.0, label: 'Historical' }
    ],
    financialRiskWeights: {
        baseScore: 40,
        circularPattern: 35,
        rapidSequence: 25,
        highValue: 20
    }
};
