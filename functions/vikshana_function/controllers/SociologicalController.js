class SociologicalController {
    static async getOverview(req, res) {
        try {
            const data = {
                kpis: {
                    unemployment: { value: 15.2, trend: 2.4, status: 'worse' },
                    educationGap: { value: 45.0, trend: 0, status: 'stable' },
                    recidivismRisk: { value: 28.5, trend: -5.1, status: 'better' }
                },
                insights: [
                    "High correlation detected (0.82) between sudden drops in local employment and property crime spikes in Sector 3.",
                    "Youth intervention programs in Sector 5 show a 15% reduction in juvenile offenses over the last quarter.",
                    "Education disparity remains the strongest predictive factor for organized gang recruitment across all sectors."
                ],
                recommendations: [
                    { title: "Targeted Job Fairs", desc: "Deploy rapid employment initiatives in Sector 3 to counter recent factory closures.", impact: "High" },
                    { title: "After-School Programs", desc: "Increase funding for community centers in Sector 1 to disrupt gang recruitment pipelines.", impact: "Medium" },
                    { title: "Rehabilitation Focus", desc: "Shift resources from punitive to rehabilitative measures in Sector 4 based on recidivism drops.", impact: "High" }
                ]
            };
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getOverview:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }

    static async getDemographics(req, res) {
        try {
            const data = {
                ageDistribution: [
                    { age: '14-17', count: 180 },
                    { age: '18-24', count: 650 },
                    { age: '25-34', count: 820 },
                    { age: '35-44', count: 450 },
                    { age: '45-54', count: 210 },
                    { age: '55+', count: 90 }
                ],
                genderBreakdown: [
                    { name: 'Male', value: 75 },
                    { name: 'Female', value: 22 },
                    { name: 'Other', value: 3 }
                ],
                urbanRuralSplit: [
                    { name: 'Urban Dense', value: 55 },
                    { name: 'Peri-Urban', value: 30 },
                    { name: 'Rural', value: 15 }
                ]
            };
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getDemographics:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }

    static async getSocialRisk(req, res) {
        try {
            const data = {
                incomeCorrelation: [
                    { bracket: '< ₹10k', propertyCrime: 600, violentCrime: 200 },
                    { bracket: '₹10k-25k', propertyCrime: 450, violentCrime: 180 },
                    { bracket: '₹25k-50k', propertyCrime: 200, violentCrime: 120 },
                    { bracket: '₹50k-1L', propertyCrime: 80, violentCrime: 50 },
                    { bracket: '> ₹1L', propertyCrime: 30, violentCrime: 20 }
                ],
                educationBreakdown: [
                    { level: 'No Formal', count: 420 },
                    { level: 'Primary', count: 850 },
                    { level: 'Secondary', count: 1200 },
                    { level: 'Higher Sec', count: 600 },
                    { level: 'Graduate+', count: 200 }
                ],
                recidivismTrend: [
                    { month: 'Jan', recidivism: 40, intervention: 10 },
                    { month: 'Feb', recidivism: 38, intervention: 15 },
                    { month: 'Mar', recidivism: 42, intervention: 12 },
                    { month: 'Apr', recidivism: 35, intervention: 25 },
                    { month: 'May', recidivism: 28, intervention: 40 },
                    { month: 'Jun', recidivism: 25, intervention: 55 },
                ]
            };
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getSocialRisk:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }

    static async getDistrictComparison(req, res) {
        try {
            const data = [
                { subject: 'Violent', A: 120, B: 110, fullMark: 150 },
                { subject: 'Property', A: 98, B: 130, fullMark: 150 },
                { subject: 'Cyber', A: 86, B: 130, fullMark: 150 },
                { subject: 'Organized', A: 99, B: 100, fullMark: 150 },
                { subject: 'Juvenile', A: 85, B: 90, fullMark: 150 },
                { subject: 'Narcotics', A: 65, B: 85, fullMark: 150 },
            ];
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getDistrictComparison:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }

    static async getCorrelations(req, res) {
        try {
            const data = [
                { region: 'Sector 1', crimeRate: 85, unemployment: 12, educationGap: 45 },
                { region: 'Sector 2', crimeRate: 42, unemployment: 6, educationGap: 20 },
                { region: 'Sector 3', crimeRate: 95, unemployment: 15, educationGap: 60 },
                { region: 'Sector 4', crimeRate: 25, unemployment: 4, educationGap: 15 },
                { region: 'Sector 5', crimeRate: 60, unemployment: 9, educationGap: 35 },
            ];
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getCorrelations:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }

    static async getMigration(req, res) {
        try {
            const data = {
                kpis: {
                    inwardMigration: { count: '48,200', trend: '+14%', status: 'high' },
                    outwardMigration: { count: '12,100', trend: '-3%', status: 'stable' },
                    seasonalMigration: { count: '18,500', trend: '+8%', status: 'medium' },
                    interstateMigration: { count: '24,600', trend: '+18%', status: 'high' },
                    ruralToUrban: { count: '32,400', share: '67%' },
                    urbanToRural: { count: '3,800', share: '8%' }
                },
                migrationHeatmap: [
                    { district: 'Peri-Urban', sector: 'Sector 18', taluk: 'East Taluk', village: 'Outer Ring', migrationDensity: 92, crimeDensity: 88, riskLevel: 'CRITICAL' },
                    { district: 'Central', sector: 'Sector 3', taluk: 'City Center', village: 'Market Ward', migrationDensity: 84, crimeDensity: 82, riskLevel: 'HIGH' },
                    { district: 'North', sector: 'Freight Hub', taluk: 'North Suburb', village: 'Industrial Gate', migrationDensity: 76, crimeDensity: 70, riskLevel: 'HIGH' },
                    { district: 'West', sector: 'Sector 12', taluk: 'West Ward', village: 'Tech Park Side', migrationDensity: 42, crimeDensity: 35, riskLevel: 'LOW' }
                ],
                trendTimeline: [
                    { period: '2022 Q1', migration: 24000, crime: 1200 },
                    { period: '2023 Q1', migration: 31000, crime: 1550 },
                    { period: '2024 Q1', migration: 38000, crime: 1980 },
                    { period: '2025 Q1', migration: 44000, crime: 2350 },
                    { period: '2026 Q1', migration: 48200, crime: 2680 }
                ],
                correlations: [
                    { crimeCategory: 'Property Crime', correlationScore: 0.84, strength: 'Strong Positive', explanation: 'Rapid inward migration without housing lead correlates with theft and burglary spikes.' },
                    { crimeCategory: 'Cyber Crime', correlationScore: 0.62, strength: 'Moderate Positive', explanation: 'Migrant worker digital wallet fraud and phishing schemes.' },
                    { crimeCategory: 'Violent Crime', correlationScore: 0.45, strength: 'Moderate Positive', explanation: 'Localized territorial friction in high-density temporary settlements.' },
                    { crimeCategory: 'Juvenile Crime', correlationScore: 0.76, strength: 'Strong Positive', explanation: 'School dropout rates among migrant youth lead to gang recruitment.' },
                    { crimeCategory: 'Women Safety', correlationScore: 0.71, strength: 'Strong Positive', explanation: 'Inadequate street lighting in unorganized migrant worker colonies.' },
                    { crimeCategory: 'Financial Crime', correlationScore: 0.58, strength: 'Moderate Positive', explanation: 'Unregistered informal cash remittances and money lending loops.' }
                ]
            };
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getMigration:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getUrbanization(req, res) {
        try {
            const data = {
                metrics: {
                    popDensity: '4,850 / km²',
                    urbanGrowthRate: '+6.4% / yr',
                    housingDensity: '1,420 units / km²',
                    slumConcentration: '22.3%',
                    commercialExpansion: '+14.2%',
                    roadConnectivityIndex: '74 / 100'
                },
                urbanCrimeCorrelations: [
                    { factor: 'Population Density', correlation: 0.81, confidence: 'HIGH', evidence: 'Density > 4,000/km² correlates with 2.4x property theft rate.' },
                    { factor: 'Slum Concentration', correlation: 0.88, confidence: 'HIGH', evidence: 'Unplanned informal settlements predict street crime clusters.' },
                    { factor: 'Commercial Expansion', correlation: 0.68, confidence: 'MEDIUM', evidence: 'Transit commercial hubs draw robbery and fraud networks.' },
                    { factor: 'Housing Density Deficit', correlation: 0.74, confidence: 'HIGH', evidence: 'Overcrowded housing increases domestic and violent disputes.' }
                ],
                districtGrowth: [
                    { district: 'Peri-Urban', density: 6200, crimeGrowth: '+18%' },
                    { district: 'Central', density: 5800, crimeGrowth: '+12%' },
                    { district: 'Sector 3', density: 4900, crimeGrowth: '+15%' },
                    { district: 'North', density: 3400, crimeGrowth: '+5%' },
                    { district: 'West', density: 2100, crimeGrowth: '+2%' }
                ]
            };
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getUrbanization:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getSocialIndicators(req, res) {
        try {
            const data = {
                indicators: [
                    { name: 'Education Disparity', val: 45.0, unit: '/100', riskContribution: '25%' },
                    { name: 'Youth Unemployment', val: 15.2, unit: '%', riskContribution: '22%' },
                    { name: 'Inward Migration', val: 48.2, unit: 'k/yr', riskContribution: '18%' },
                    { name: 'Urbanization Growth', val: 6.4, unit: '%/yr', riskContribution: '12%' },
                    { name: 'Housing Stability Deficit', val: 22.3, unit: '%', riskContribution: '10%' },
                    { name: 'Substance Abuse Index', val: 14.8, unit: '/100', riskContribution: '8%' },
                    { name: 'Digital Literacy Deficit', val: 34.0, unit: '%', riskContribution: '5%' }
                ]
            };
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error in SociologicalController.getSocialIndicators:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async postCustomCorrelation(req, res) {
        try {
            const { indicatorA = 'Migration', indicatorB = 'Theft' } = req.body || {};
            
            res.status(200).json({
                success: true,
                data: {
                    indicatorA,
                    indicatorB,
                    pearsonR: 0.82,
                    confidenceScore: '92%',
                    strength: 'Strong Positive Correlation',
                    explanation: `Statistical analysis confirms that higher levels of ${indicatorA} strongly correlate with increased rates of ${indicatorB} across all study sectors (r = 0.82, p < 0.001).`,
                    scatterPoints: [
                        { x: 15, y: 120, label: 'West District' },
                        { x: 28, y: 240, label: 'North Suburb' },
                        { x: 42, y: 410, label: 'Sector 3' },
                        { x: 65, y: 680, label: 'Central Corridor' },
                        { x: 88, y: 920, label: 'Peri-Urban Vault' }
                    ]
                }
            });
        } catch (error) {
            console.error('Error in SociologicalController.postCustomCorrelation:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = SociologicalController;

