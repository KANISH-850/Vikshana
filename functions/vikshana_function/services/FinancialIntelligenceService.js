const fs = require('fs');
const path = require('path');
const datastoreClient = require('../queries/datastoreClient');

class FinancialIntelligenceService {
    static DEMO_CSV_PATH = path.join(__dirname, '../../../dataset/financial_transactions_demo.csv');
    static DEMO_BANNER = "SIMULATED FINANCIAL DATA — FOR DEMONSTRATION PURPOSES ONLY";

    static async getTransactionsData(req) {
        let transactions = [];
        try {
            if (fs.existsSync(this.DEMO_CSV_PATH)) {
                const text = fs.readFileSync(this.DEMO_CSV_PATH, 'utf-8');
                const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
                if (lines.length > 1) {
                    const headers = lines[0].split(',').map(h => h.trim());
                    for (let i = 1; i < lines.length; i++) {
                        const parts = lines[i].split(',').map(p => p.trim());
                        if (parts.length < headers.length) continue;
                        const row = {};
                        headers.forEach((h, idx) => { row[h] = parts[idx]; });
                        transactions.push({
                            transactionId: row.transaction_id,
                            fromAccount: row.from_account,
                            toAccount: row.to_account,
                            amount: parseFloat(row.amount) || 0,
                            timestamp: row.timestamp,
                            transactionType: row.transaction_type,
                            location: row.location,
                            linkedCaseId: row.linked_case_id,
                            riskFlag: row.risk_flag,
                            dataSource: this.DEMO_BANNER
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Error reading financial demo CSV:', e);
        }

        if (transactions.length === 0) {
            transactions = [
                { transactionId: 'TXN_DEMO_1001', fromAccount: 'ACC_DEMO_001', toAccount: 'ACC_DEMO_002', amount: 450000, timestamp: '2026-01-10T10:15:00Z', transactionType: 'Wire Transfer', location: 'Bengaluru', linkedCaseId: 'CASE_KSP_2025_001', riskFlag: 'High Value', dataSource: this.DEMO_BANNER },
                { transactionId: 'TXN_DEMO_1002', fromAccount: 'ACC_DEMO_002', toAccount: 'ACC_DEMO_003', amount: 440000, timestamp: '2026-01-10T10:22:00Z', transactionType: 'IMPS', location: 'Bengaluru', linkedCaseId: 'CASE_KSP_2025_001', riskFlag: 'Rapid Transfer', dataSource: this.DEMO_BANNER },
                { transactionId: 'TXN_DEMO_1003', fromAccount: 'ACC_DEMO_003', toAccount: 'ACC_DEMO_004', amount: 435000, timestamp: '2026-01-10T10:30:00Z', transactionType: 'RTGS', location: 'Mysuru', linkedCaseId: 'CASE_KSP_2025_001', riskFlag: 'Rapid Transfer', dataSource: this.DEMO_BANNER },
                { transactionId: 'TXN_DEMO_1004', fromAccount: 'ACC_DEMO_004', toAccount: 'ACC_DEMO_001', amount: 430000, timestamp: '2026-01-10T10:45:00Z', transactionType: 'Wire Transfer', location: 'Bengaluru', linkedCaseId: 'CASE_KSP_2025_001', riskFlag: 'Circular Transaction', dataSource: this.DEMO_BANNER }
            ];
        }

        return transactions;
    }

    static async getFinancialOverview(req) {
        try {
            const transactions = await this.getTransactionsData(req);
            const accountSet = new Set();
            transactions.forEach(t => {
                accountSet.add(t.fromAccount);
                accountSet.add(t.toAccount);
            });

            const suspiciousPatterns = await this.detectSuspiciousPatterns(req);
            const moneyTrails = await this.analyzeMoneyTrails(req);

            return {
                status: 'SUCCESS',
                isDemoData: true,
                demoBanner: this.DEMO_BANNER,
                summaryCards: {
                    transactionsAnalyzed: transactions.length,
                    potentiallySuspiciousPatternsCount: suspiciousPatterns.patterns.length,
                    moneyTrailsDetectedCount: moneyTrails.trails.length,
                    connectedAccountsCount: accountSet.size
                },
                recentTransactions: transactions,
                dataProvenance: {
                    dataSource: 'Simulated Financial Transactions Demonstration Dataset',
                    datasetType: 'Synthetic Financial Demo Data',
                    coverage: `${accountSet.size} Synthetic Accounts`,
                    limitations: ['Synthetic accounts and transactions for demonstration analytics only.'],
                    lastUpdated: new Date().toISOString().split('T')[0]
                }
            };
        } catch (error) {
            console.error('Error in FinancialIntelligenceService getFinancialOverview:', error);
            throw error;
        }
    }

    static async analyzeMoneyTrails(req) {
        try {
            const transactions = await this.getTransactionsData(req);
            
            // Build adjacency graph of accounts
            const graph = new Map();
            transactions.forEach(t => {
                if (!graph.has(t.fromAccount)) graph.set(t.fromAccount, []);
                graph.get(t.fromAccount).push(t);
            });

            const trails = [];

            // Detect paths with 2 or more hops
            graph.forEach((txList, startAccount) => {
                txList.forEach(t1 => {
                    const nextHops = graph.get(t1.toAccount) || [];
                    nextHops.forEach(t2 => {
                        const pathAccounts = [t1.fromAccount, t1.toAccount, t2.toAccount];
                        const totalAmount = t1.amount + t2.amount;
                        
                        // Check if third hop exists
                        const thirdHops = graph.get(t2.toAccount) || [];
                        if (thirdHops.length > 0) {
                            thirdHops.forEach(t3 => {
                                pathAccounts.push(t3.toAccount);
                                trails.push({
                                    trailId: `TRAIL_${t1.transactionId}_${t3.transactionId}`,
                                    sourceAccount: startAccount,
                                    destinationAccount: t3.toAccount,
                                    path: pathAccounts,
                                    hopCount: 3,
                                    totalAmountFlow: totalAmount + t3.amount,
                                    linkedCases: Array.from(new Set([t1.linkedCaseId, t2.linkedCaseId, t3.linkedCaseId].filter(Boolean))),
                                    riskScore: 82,
                                    description: `Multi-hop transfer path: ${pathAccounts.join(' → ')}`
                                });
                            });
                        } else {
                            trails.push({
                                trailId: `TRAIL_${t1.transactionId}_${t2.transactionId}`,
                                sourceAccount: startAccount,
                                destinationAccount: t2.toAccount,
                                path: pathAccounts,
                                hopCount: 2,
                                totalAmountFlow: totalAmount,
                                linkedCases: Array.from(new Set([t1.linkedCaseId, t2.linkedCaseId].filter(Boolean))),
                                riskScore: 68,
                                description: `Two-hop transfer path: ${pathAccounts.join(' → ')}`
                            });
                        }
                    });
                });
            });

            return {
                status: 'SUCCESS',
                isDemoData: true,
                demoBanner: this.DEMO_BANNER,
                trails: trails.slice(0, 10),
                totalTrailsFound: trails.length
            };
        } catch (error) {
            console.error('Error in analyzeMoneyTrails:', error);
            throw error;
        }
    }

    static async detectSuspiciousPatterns(req) {
        try {
            const transactions = await this.getTransactionsData(req);
            const patterns = [];

            // Build adjacency map for true graph cycle and sequence traversal
            const accountTxMap = new Map();
            transactions.forEach(t => {
                if (!accountTxMap.has(t.fromAccount)) accountTxMap.set(t.fromAccount, []);
                accountTxMap.get(t.fromAccount).push(t);
            });

            // 1. Independent Graph Cycle Traversal (Circular Transactions: A -> B -> C -> A)
            const circularPaths = [];
            accountTxMap.forEach((txs1, accA) => {
                txs1.forEach(t1 => {
                    const accB = t1.toAccount;
                    const txs2 = accountTxMap.get(accB) || [];
                    txs2.forEach(t2 => {
                        const accC = t2.toAccount;
                        const txs3 = accountTxMap.get(accC) || [];
                        txs3.forEach(t3 => {
                            if (t3.toAccount === accA) {
                                circularPaths.push({ path: [accA, accB, accC, accA], txs: [t1, t2, t3] });
                            }
                        });
                    });
                });
            });

            if (circularPaths.length > 0) {
                const accountsInvolved = Array.from(new Set(circularPaths.flatMap(cp => cp.path)));
                const factorWeight = 35;
                const riskScore = Math.min(100, 50 + factorWeight);
                patterns.push({
                    patternId: 'PAT_CIRCULAR_001',
                    patternType: 'Circular Transaction Pattern',
                    detectionMethod: 'Graph Cycle Traversal Algorithm (3-hop closure)',
                    severity: 'Critical',
                    accountsInvolved,
                    transactionCount: circularPaths.length * 3,
                    evidenceSummary: `Detected ${circularPaths.length} closed-loop transaction cycles returning funds to original source account.`,
                    riskScore,
                    scoreBreakdown: { base: 50, circularFactor: 35, total: riskScore },
                    confidence: 'High',
                    status: 'Potentially Suspicious Pattern'
                });
            }

            // 2. Timestamp Sequence Delta Analysis (Rapid Multi-Hop Transfers)
            const rapidTransfers = [];
            accountTxMap.forEach((txs1, accA) => {
                txs1.forEach(t1 => {
                    const t1Time = new Date(t1.timestamp).getTime();
                    const txs2 = accountTxMap.get(t1.toAccount) || [];
                    txs2.forEach(t2 => {
                        const t2Time = new Date(t2.timestamp).getTime();
                        const timeDiffMinutes = (t2Time - t1Time) / (1000 * 60);
                        if (timeDiffMinutes >= 0 && timeDiffMinutes <= 60) { // Hop within 60 mins
                            rapidTransfers.push({ t1, t2, timeDiffMinutes });
                        }
                    });
                });
            });

            if (rapidTransfers.length > 0) {
                const accountsInvolved = Array.from(new Set(rapidTransfers.flatMap(rt => [rt.t1.fromAccount, rt.t1.toAccount, rt.t2.toAccount])));
                const factorWeight = 25;
                const riskScore = Math.min(100, 45 + factorWeight);
                patterns.push({
                    patternId: 'PAT_RAPID_002',
                    patternType: 'Rapid Multi-Hop Transfer Pattern',
                    detectionMethod: 'Timestamp Delta Analysis (<60 minutes transfer window)',
                    severity: 'High',
                    accountsInvolved,
                    transactionCount: rapidTransfers.length * 2,
                    evidenceSummary: `Detected ${rapidTransfers.length} rapid multi-hop transfers executed in sequence within 60 minutes.`,
                    riskScore,
                    scoreBreakdown: { base: 45, rapidSequenceFactor: 25, total: riskScore },
                    confidence: 'Medium-High',
                    status: 'Potentially Suspicious Pattern'
                });
            }

            // 3. High-Value Threshold Detection (Configurable threshold ₹4,00,000)
            const HIGH_VALUE_THRESHOLD = 400000;
            const highValueTransfers = transactions.filter(t => t.amount >= HIGH_VALUE_THRESHOLD);
            if (highValueTransfers.length > 0) {
                const accountsInvolved = Array.from(new Set(highValueTransfers.flatMap(t => [t.fromAccount, t.toAccount])));
                const riskScore = 65;
                patterns.push({
                    patternId: 'PAT_HIGHVAL_003',
                    patternType: 'High-Value Transaction Pattern',
                    detectionMethod: `Threshold Filter (Amount >= ₹${HIGH_VALUE_THRESHOLD.toLocaleString('en-IN')})`,
                    severity: 'Moderate',
                    accountsInvolved,
                    transactionCount: highValueTransfers.length,
                    evidenceSummary: `${highValueTransfers.length} transactions exceeded high-value threshold.`,
                    riskScore,
                    scoreBreakdown: { base: 40, highValueFactor: 25, total: riskScore },
                    confidence: 'High',
                    status: 'Potentially Suspicious Pattern'
                });
            }

            return {
                status: 'SUCCESS',
                isDemoData: true,
                demoBanner: this.DEMO_BANNER,
                patterns,
                disclaimer: 'Patterns are categorized as "Potentially Suspicious". Statistical flag does not confirm unlawful activity without investigative verification.'
            };
        } catch (error) {
            console.error('Error in detectSuspiciousPatterns:', error);
            throw error;
        }
    }
}

module.exports = FinancialIntelligenceService;
