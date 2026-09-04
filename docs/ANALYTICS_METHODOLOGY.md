# VIKSHANA Analytics & Intelligence Methodology

This document details the exact mathematical formulas, statistical algorithms, graph processing methods, and data quality scoring models implemented across the **VIKSHANA** platform.

---

## 1. Chronological Time-Series Forecasting & Backtesting

### A. Period Moving Average
Monthly period aggregation sorts historical incident timestamps chronologically into $P_1, P_2, \dots, P_n$. 
For any period $i \ge 3$, the 3-period moving average $\text{MA}_i$ is computed as:

$$\text{MA}_i = \frac{\text{Actual}_{i-2} + \text{Actual}_{i-1} + \text{Actual}_i}{3}$$

### B. Empirical Backtesting (MAE & RMSE)
To validate forecast reliability without artificial metrics, the backtesting engine evaluates actual incident counts $\text{Actual}_i$ against historical 2-period predictions $\hat{y}_i$:

$$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |\text{Actual}_i - \hat{y}_i|$$

$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (\text{Actual}_i - \hat{y}_i)^2}$$

---

## 2. Seasonal & Event Window Baseline Analytics

Event incident counts are evaluated using exact date-range window matching against `CaseMaster` registration timestamps.
For an event of window duration $W$ days (e.g. $W=3$), the expected baseline count $B_E$ is derived from the overall daily average $D_{\text{avg}}$:

$$B_E = D_{\text{avg}} \times W = \left(\frac{N_{\text{total}}}{365}\right) \times W$$

$$\text{Deviation } (\%) = \left(\frac{\text{Actual}_{W} - B_E}{B_E}\right) \times 100$$

> **Mandatory Disclaimer**: *Observed statistical variations during an event period reflect correlation and do not establish event causation.*

---

## 3. Explainable Evidence Support Score

The Hypothesis Engine evaluates investigation hypotheses using a rule-based deterministic scoring model starting from a neutral baseline score of $50$:

$$\text{Score} = 50 + 10 \cdot S + 5 \cdot V + B_{\text{corroboration}} - P_{\text{contradiction}} - P_{\text{gap}}$$

Where:
- $S$: Count of supporting evidence items linked to the hypothesis statement.
- $V$: Count of verified supporting evidence items.
- $B_{\text{corroboration}}$: Multi-source corroboration bonus ($+20$).
- $P_{\text{contradiction}}$: Conflict penalty ($15$ points per contradicting record).
- $P_{\text{gap}}$: Evidence coverage gap penalty ($5$ points per missing evidence type: `Physical`, `Digital`, `Witness`, `Documentary`).

> **Terminology Policy**: *Score evaluates evidence data coverage. It never measures criminal guilt.*

---

## 4. Financial Intelligence Graph Cycle Detection

Financial pattern detection executes direct graph traversal across synthetic transaction nodes $(u, v) \in E$:

1. **Circular Transaction Cycle ($A \to B \to C \to A$)**: Detected when a 3-hop directed path terminates at the originating account node.
   $$\text{Risk Score} = 50 + \text{FactorWeight}_{\text{circular}} (35) = 85$$
2. **Rapid Multi-Hop Transfer**: Sequence of transfers $(u \to v, t_1)$ and $(v \to w, t_2)$ where:
   $$0 \le t_2 - t_1 \le 60 \text{ minutes}$$
   $$\text{Risk Score} = 45 + \text{FactorWeight}_{\text{rapid}} (25) = 70$$

---

## 5. Community Detection & Neutral Labeling

Graph clustering executes Connected Components and Modularity Optimization across entity relationship graphs.

- **Entity Identifiers**: Resolved deterministically (`Accused_<ROWID>`) to guarantee graph reproducibility.
- **Connection Density**: Computed as $D = \frac{2 |E|}{|V|(|V|-1)}$.
- **Neutral Terminology**: Clusters are strictly labeled as `High-Connectivity Cluster` or `Potential Association Network`.

---

## 6. Data Quality Intelligence Model

Data Quality Score $Q$ evaluates four structural pillars:

$$Q = 0.35 \cdot \text{Completeness} + 0.30 \cdot \text{Validity} + 0.20 \cdot \text{Uniqueness} + 0.15 \cdot \text{Freshness}$$

- **Completeness**: Non-null ratio for location and crime classification fields.
- **Validity**: Proportion of parseable ISO dates.
- **Uniqueness**: Primary key uniqueness ratio.
- **Freshness**: Timestamp currency rating.
