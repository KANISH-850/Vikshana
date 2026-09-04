# VIKSHANA Demo Mode Governance & Environment Isolation

This document outlines the governance rules, environment configurations, and security isolation boundaries for **DEMO MODE** within the VIKSHANA platform.

---

## 1. Environment Configuration

Demo Mode is controlled via system environment variables:

```env
APP_MODE=development
DEMO_MODE=true
```

When `DEMO_MODE=true`:
- External demonstration datasets (e.g. `demo_socioeconomic_data.csv`, `financial_transactions_demo.csv`) are loaded for analytics demonstrations.
- Datastore queries use isolated sample cases (`CASE-DEMO-001`, `CASE_KSP_2025_001`).

---

## 2. Strict Security & Validation Governance

### Non-Negotiable Rules

1. **No Security Bypass**:
   `DEMO_MODE` **NEVER** disables authentication, JWT verification, or Role-Based Access Control (RBAC).

2. **No Hallucination Bypass**:
   The `HallucinationGuardService` remains active in `DEMO_MODE`. Unsupported entity claims, unverified numbers, and proper nouns are strictly validated against retrieved case ledgers.

3. **Explicit Synthetic Data Transparency**:
   All synthetic or demonstration datasets are prominently labeled on all UI surfaces and API outputs with:
   `"SIMULATED DATA — FOR DEMONSTRATION PURPOSES ONLY"`

4. **No Fabricated Evidence or Model Accuracy**:
   Demo mode uses real deterministic statistical algorithms (moving averages, graph cycle traversal, Pearson correlations) over synthetic records. Artificial MAE, fake model accuracy, or dummy missing evidence strings are strictly prohibited.
