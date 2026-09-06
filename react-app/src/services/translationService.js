/**
 * translationService.js
 * 
 * Handles translation using multi-tier architecture:
 *  1. Immediate Built-in Comprehensive Dictionary (instant offline Kannada & Hindi)
 *  2. In-memory Map cache + LocalStorage (survives page reloads)
 *  3. Backend Zia NLP / LLM Translation Proxy (for dynamic DB content)
 */

import api from './api';

// ── Built-in Comprehensive Dictionary ──────────────────────────────────────────
const OFFLINE_DICTIONARY = {
    kn: {
        // Navigation & Sidebar
        'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'VIKSHANA Sentinel': 'ವೀಕ್ಷಣಾ ಸೆಂಟಿನೆಲ್',
        'Investigation Workspace': 'ತನಿಖಾ ಕ್ಷೇತ್ರ',
        'Forensic Intelligence Hub': 'ವಿಧಿವಿಜ್ಞಾನ ಗುಪ್ತಚರ ಕೇಂದ್ರ',
        'Investigation Search': 'ತನಿಖಾ ಹುಡುಕಾಟ',
        'Sociological Insights': 'ಸಾಮಾಜಿಕ ಒಳನೋಟಗಳು',
        'Crime Forecasting': 'ಅಪರಾಧ ಮುನ್ಸೂಚನೆ',
        'Investigation Report': 'ತನಿಖಾ ವರದಿ',
        'Investigation Reports': 'ತನಿಖಾ ವರದಿಗಳು',
        'Audit Logs': 'ಆಡಿಟ್ ಲಾಗ್‌ಗಳು',
        'Security Audit Logs': 'ಸುರಕ್ಷತಾ ಆಡಿಟ್ ಲಾಗ್‌ಗಳು',
        'PRIMARY ACTIONS': 'ಪ್ರಾಥಮಿಕ ಕ್ರಮಗಳು',
        'INTELLIGENCE': 'ಗುಪ್ತಚರ',
        'ADMIN & REPORTING': 'ಆಡಳಿತ ಮತ್ತು ವರದಿ',

        // Roles & Users
        'ROLE: ADMINISTRATOR': 'ಪಾತ್ರ: ನಿರ್ವಾಹಕ',
        'ROLE: INVESTIGATOR': 'ಪಾತ್ರ: ತನಿಖಾಧಿಕಾರಿ',
        'ROLE: SUPERVISOR': 'ಪಾತ್ರ: ಮೇಲ್ವಿಚಾರಕ',
        'ROLE: ANALYST': 'ಪಾತ್ರ: ವಿಶ್ಲೇಷಕ',
        'ROLE: POLICYMAKER': 'ಪಾತ್ರ: ನೀತಿ ನಿರೂಪಕ',
        'ROLE: OFFICER': 'ಪಾತ್ರ: ಅಧಿಕಾರಿ',
        'ROLE: Administrator': 'ಪಾತ್ರ: ನಿರ್ವಾಹಕ',
        'ROLE: Investigator': 'ಪಾತ್ರ: ತನಿಖಾಧಿಕಾರಿ',
        'Administrator': 'ನಿರ್ವಾಹಕ',
        'Investigator': 'ತನಿಖಾಧಿಕಾರಿ',
        'Supervisor': 'ಮೇಲ್ವಿಚಾರಕ',
        'Analyst': 'ವಿಶ್ಲೇಷಕ',
        'Policymaker': 'ನೀತಿ ನಿರೂಪಕ',
        'Officer': 'ಅಧಿಕಾರಿ',
        'Viewer': 'ವೀಕ್ಷಕ',
        'Admin User': 'ನಿರ್ವಾಹಕ ಬಳಕೆದಾರ',

        // General UI & Badges
        'Page Translated': 'ಅನುವಾದಿಸಲಾಗಿದೆ',
        'Translated': 'ಅನುವಾದಿಸಲಾಗಿದೆ',
        'Active Investigation': 'ಸಕ್ರಿಯ ತನಿಖೆ',
        'Active Case': 'ಸಕ್ರಿಯ ಪ್ರಕರಣ',
        'Active Case ID:': 'ಸಕ್ರಿಯ ಪ್ರಕರಣ ಐಡಿ:',
        'Refresh': 'ನವೀಕರಿಸಿ',
        'All Cases (Global View)': 'ಎಲ್ಲಾ ಪ್ರಕರಣಗಳು (ಜಾಗತಿಕ ನೋಟ)',
        '🌐 All Cases (Global View)': '🌐 ಎಲ್ಲಾ ಪ್ರಕರಣಗಳು (ಜಾಗತಿಕ ನೋಟ)',
        'Search everywhere (Cases, FIRs, Entities)...': 'ಎಲ್ಲಾ ಕಡೆ ಹುಡುಕಿ (ಪ್ರಕರಣಗಳು, ಎಫ್‌ಐಆರ್, ವ್ಯಕ್ತಿಗಳು)...',
        'Search cases, FIRs, entities...': 'ಎಲ್ಲಾ ಕಡೆ ಹುಡುಕಿ (ಪ್ರಕರಣಗಳು, ಎಫ್‌ಐಆರ್, ವ್ಯಕ್ತಿಗಳು)...',

        // Forensics Hub
        'Multi-Modal Forensic & Intelligence Hub': 'ಬಹು-ಮಾದರಿ ವಿಧಿವಿಜ್ಞಾನ ಮತ್ತು ಗುಪ್ತಚರ ಕೇಂದ್ರ',
        'Unified data layer covering 10 operational forensic domains, Vector-RAG retrieval, and Scikit-Learn Python ML.': '10 ಕಾರ್ಯಾಚರಣಾ ವಿಧಿವಿಜ್ಞಾನ ಕ್ಷೇತ್ರಗಳು, ವೆಕ್ಟರ್-RAG ಮರುಪಡೆಯುವಿಕೆ ಮತ್ತು Scikit-Learn ಪೈಥಾನ್ ML ಅನ್ನು ಒಳಗೊಂಡಿರುವ ಏಕೀಕೃತ ಡೇಟಾ ಶ್ರೇಣಿ.',
        'Evidence & Chain of Custody': 'ಸಾಕ್ಷ್ಯ ಮತ್ತು ಪಾಲನೆಯ ಸರಪಳಿ',
        'CCTV Surveillance': 'ಸಿಸಿಟಿವಿ ಕಣ್ಗಾವಲು',
        'CDR Phone Intelligence': 'ಸಿಡಿಆರ್ ಫೋನ್ ಗುಪ್ತಚರ',
        'Financial Intelligence': 'ಹಣಕಾಸು ಗುಪ್ತಚರ',
        'Forensic Lab Reports': 'ವಿಧಿವಿಜ್ಞಾನ ಪ್ರಯೋಗಾಲಯ ವರದಿಗಳು',
        'Weapons & Ballistics': 'ಆಯುಧಗಳು ಮತ್ತು ಬ್ಯಾಲಿಸ್ಟಿಕ್ಸ್',
        'Vehicle Seizures': 'ವಾಹನ ಜಪ್ತಿಗಳು',
        'Biometrics & DNA': 'ಬಯೋಮೆಟ್ರಿಕ್ಸ್ ಮತ್ತು ಡಿಎನ್‌ಎ',
        'Court Proceedings': 'ನ್ಯಾಯಾಲಯದ ಕಲಾಪಗಳು',
        'Interrogations': 'ವಿಚಾರಣೆಗಳು',
        'Semantic Vector RAG': 'ಸೆಮ್ಯಾಂಟಿಕ್ ವೆಕ್ಟರ್ RAG',
        'Python ML Pipeline': 'ಪೈಥಾನ್ ML ಪೈಪ್‌ಲೈನ್',
        'Physical Evidence & Chain of Custody': 'ಭೌತಿಕ ಸಾಕ್ಷ್ಯ ಮತ್ತು ಪಾಲನೆಯ ಸರಪಳಿ',
        'Record Evidence': 'ಸಾಕ್ಷ್ಯ ದಾಖಲಿಸಿ',
        'Physical Weapon': 'ಭೌತಿಕ ಆಯುಧ',
        'Fingerprint Lift Card': 'ಬೆರಳಚ್ಚು ಕಾರ್ಡ್',
        'Blood / Biological Swab': 'ರಕ್ತ / ಜೈವಿಕ ಸ್ವ್ಯಾಬ್',
        'Digital Media / Flash Drive': 'ಡಿಜಿಟಲ್ ಮಾಧ್ಯಮ / ಫ್ಲ್ಯಾಶ್ ಡ್ರೈವ್',
        'Narcotic Substance': 'ಮಾದಕ ವಸ್ತು',
        'Documentary Evidence': 'ದಾಖಲಾತಿ ಸಾಕ್ಷ್ಯ',
        'Description of item...': 'ವಸ್ತುವಿನ ವಿವರಣೆ...',
        'HQ Vault A-12': 'ಪ್ರಧಾನ ಕಚೇರಿ ಕಪಾಟು A-12',
        'recorded items': 'ದಾಖಲಾದ ವಸ್ತುಗಳು',
        'Evidence ID': 'ಸಾಕ್ಷ್ಯ ಐಡಿ',
        'Type': 'ವಿಧ',
        'Description': 'ವಿವರಣೆ',
        'Storage Location': 'ಸಂಗ್ರಹ ಸ್ಥಳ',
        'SHA-256 Hash': 'SHA-256 ಹ್ಯಾಶ್',
        'Chain of Custody': 'ಪಾಲನೆಯ ಸರಪಳಿ',

        // Investigation Workspace & Tabs
        'Command Center Idle': 'ಕಮಾಂಡ್ ಸೆಂಟರ್ ಸಿದ್ಧವಾಗಿದೆ',
        'Case Overview': 'ಪ್ರಕರಣದ ಅವಲೋಕನ',
        'Foresight (ML)': 'ಪೂರ್ವದೃಷ್ಟಿ (ML)',
        'Foresight': 'ಪೂರ್ವದೃಷ್ಟಿ (ML)',
        'Investigation Leads': 'ತನಿಖಾ ಮುನ್ನಡೆಗಳು',
        'Leads': 'ತನಿಖಾ ಮುನ್ನಡೆಗಳು',
        'MO Profile': 'ಅಪರಾಧ ವಿಧಾನ (MO)',
        'MO Intelligence': 'ಅಪರಾಧ ವಿಧಾನ (MO)',
        'Evidence Integrity': 'ಸಾಕ್ಷ್ಯ ಸಮಗ್ರತೆ',
        'Evidence Chain': 'ಸಾಕ್ಷ್ಯ ಸರಪಳಿ',
        'FIR Details': 'ಎಫ್‌ಐಆರ್ ವಿವರಗಳು',
        'FIR Intelligence': 'ಎಫ್‌ಐಆರ್ ಗುಪ್ತಚರ',
        'Evidence Intelligence': 'ಸಾಕ್ಷ್ಯ ಗುಪ್ತಚರ',
        'Timeline Intelligence': 'ಸಮಯರೇಖೆ ಗುಪ್ತಚರ',
        'Timeline': 'ಸಮಯರೇಖೆ',
        'Historical Intelligence': 'ಐತಿಹಾಸಿಕ ಗುಪ್ತಚರ',
        'Historical Match': 'ಐತಿಹಾಸಿಕ ಸಾಮ್ಯತೆ',
        'Relationships': 'ಸಂಬಂಧಗಳು',
        'Decision Support': 'ನಿರ್ಧಾರ ಬೆಂಬಲ',
        'VIKSHANA Copilot': 'ವೀಕ್ಷಣಾ ಕೋಪೈಲಟ್',
        'Intelligence Command': 'ಗುಪ್ತಚರ ಕಮಾಂಡ್',
        'FIR SUMMARY': 'ಎಫ್‌ಐಆರ್ ಸಾರಾಂಶ',
        'Victims': 'ಸಂತ್ರಸ್ತರು',
        'Suspects': 'ಅನುಮಾನಿತರು',
        'Evidence': 'ಸಾಕ್ಷ್ಯಗಳು',
        'Witnesses': 'ಸಾಕ್ಷಿಗಳು',
        'CRIME TYPE': 'ಅಪರಾಧ ವಿಧ',
        'DATE': 'ದಿನಾಂಕ',
        'POLICE STATION': 'ಪೋಲೀಸ್ ಠಾಣೆ',
        'Deterministic Case Completeness': 'ಪ್ರಕರಣದ ಪೂರ್ಣತೆಯ ಸ್ಕೋರ್',
        'CATEGORY BREAKDOWN': 'ವರ್ಗಗಳ ವಿಂಗಡಣೆ',

        // Crime Forecasting Page
        'Crime Forecasting & Seasonal Intelligence': 'ಅಪರಾಧ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಋತುಮಾನ ಬುದ್ಧಿಮತ್ತೆ',
        'Deterministic time-series analysis, event anomaly detection, and seasonal trend modeling.': 'ಸಮಯ-ಸರಣಿ ವಿಶ್ಲೇಷಣೆ, ಘಟನೆ ವ್ಯತ್ಯಾಸ ಪತ್ತೆ ಮತ್ತು ಋತುಮಾನ ಪ್ರವೃತ್ತಿ ಮಾದರಿ.',
        '30-Day Trend Forecast': '೩೦ ದಿನಗಳ ಪ್ರವೃತ್ತಿ ಮುನ್ಸೂಚನೆ',
        'Seasonal & Event Intelligence': 'ಋತುಮಾನ ಮತ್ತು ಘಟನೆ ಬುದ್ಧಿಮತ್ತೆ',
        'Historical Baseline': 'ಐತಿಹಾಸಿಕ ಬೇಸ್‌ಲೈನ್',
        'Recent Average': 'ಇತ್ತೀಚಿನ ಸರಾಸರಿ',
        'Forecast (Next 30D)': 'ಮುನ್ಸೂಚನೆ (ಮುಂದಿನ ೩೦ ದಿನಗಳು)',
        'Historical Trend vs Moving Average': 'ಐತಿಹಾಸಿಕ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಚಲಿಸುವ ಸರಾಸರಿ',
        'Explanation & Evidence': 'ವಿವರಣೆ ಮತ್ತು ಸಾಕ್ಷ್ಯ',
        'Records Analyzed': 'ವಿಶ್ಲೇಷಿಸಿದ ದಾಖಲೆಗಳು',
        'Calculation Method': 'ಲೆಕ್ಕಾಚಾರದ ವಿಧಾನ',
        'Data Reliability': 'ಮಾಹಿತಿ ವಿಶ್ವಾಸಾರ್ಹತೆ',
        'Backtest Validation': 'ಬ್ಯಾಕ್‌ಟೆಸ್ಟ್ ಪರಿಶೀಲನೆ',
        'Forecast Period': 'ಮುನ್ಸೂಚನೆ ಅವಧಿ',
        'SYSTEM LIMITATIONS': 'ವ್ಯವಸ್ಥೆಯ ಮಿತಿಗಳು',
        'Peak Crime Month': 'ಗರಿಷ್ಠ ಅಪರಾಧ ತಿಂಗಳು',
        'Highest Risk Day': 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ದಿನ',
        'Lowest Risk Day': 'ಕಡಿಮೆ ಅಪಾಯದ ದಿನ',
        'Dataset Coverage': 'ಡೇಟಾಸೆಟ್ ವ್ಯಾಪ್ತಿ',
        'Month-Wise Crime Trends (Jan - Dec)': 'ತಿಂಗಳುವಾರು ಅಪರಾಧ ಪ್ರವೃತ್ತಿಗಳು (ಜನವರಿ - ಡಿಸೆಂಬರ್)',
        'Day-of-Week Crime Patterns': 'ವಾರದ ದಿನಗಳ ಅಪರಾಧ ಮಾದರಿಗಳು',
        'Festival & Public Event Window Intelligence': 'ಹಬ್ಬ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಬುದ್ಧಿಮತ್ತೆ',
        'Event Name': 'ಕಾರ್ಯಕ್ರಮದ ಹೆಸರು',
        'Window': 'ಅವಧಿ',
        'Baseline': 'ಬೇಸ್‌ಲೈನ್',
        'Observed': 'ಗಮನಿಸಿದ ಘಟನೆಗಳು',
        'Deviation': 'ವಿಚಲನೆ',
        'Anomaly Score': 'ವ್ಯತ್ಯಾಸ ಸ್ಕೋರ್',
        'Evidence Insight': 'ಸಾಕ್ಷ್ಯ ಒಳನೋಟ',
        'EARLY WARNING: TREND DETECTED': 'ಮುನ್ನೆಚ್ಚರಿಕೆ: ಪ್ರವೃತ್ತಿ ಪತ್ತೆಯಾಗಿದೆ',

        // Sentinel Dashboard
        'VIKSHANA SENTINEL - AUTONOMOUS CASE TRIAGE & ACTION AGENT': 'ವೀಕ್ಷಣಾ ಸೆಂಟಿನೆಲ್ - ಸ್ವಾಯತ್ತ ಪ್ರಕರಣ ವಿಂಗಡಣೆ ಮತ್ತು ಕ್ರಮ ಏಜೆಂಟ್',
        'Continuous automated surveillance across all active FIR dockets': 'ಎಲ್ಲಾ ಸಕ್ರಿಯ ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳ ನಿರಂತರ ಸ್ವಯಂಚಾಲಿತ ಕಣ್ಗಾವಲು',
        'COPILOT INVESTIGATION': 'ಕೋಪೈಲಟ್ ತನಿಖೆ',
        'Run Autonomous Scan': 'ಸ್ವಾಯತ್ತ ಸ್ಕ್ಯಾನ್ ಚಲಾಯಿಸಿ',
        'CASES MONITORED': 'ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿದ ಪ್ರಕರಣಗಳು',
        'CRITICAL PRIORITY': 'ತೀವ್ರ ಆದ್ಯತೆ',
        'HIGH PRIORITY': 'ಹೆಚ್ಚಿನ ಆದ್ಯತೆ',
        'ACTIONS AWAITING': 'ಬಾಕಿ ಇರುವ ಕ್ರಮಗಳು',
        'INVESTIGATION GAPS': 'ತನಿಖಾ ಕೊರತೆಗಳು',
        'PATTERN SURGES': 'ಮಾದರಿ ಏರಿಕೆಗಳು',
        'TOP CASES REQUIRING ATTENTION TODAY': 'ಇಂದು ಹೆಚ್ಚಿನ ಗಮನ ಅಗತ್ಯವಿರುವ ಪ್ರಮುಖ ಪ್ರಕರಣಗಳು',
        'CASE TRIAGE INTELLIGENCE DOSSIER': 'ಪ್ರಕರಣ ವಿಂಗಡಣೆ ಗುಪ್ತಚರ ಡಾಕ್ಯುಮೆಂಟ್',
        'OPEN FULL WORKSPACE': 'ಪೂರ್ಣ ಕಾರ್ಯಸ್ಥಳ ತೆರೆಯಿರಿ',

        // Sociological Insights
        'Sociological & Social Risk Intelligence': 'ಸಾಮಾಜಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಅಪಾಯದ ಗುಪ್ತಚರ',
        'Demographic correlations, economic indicators, and district social risk scoring.': 'ಜನಸಂಖ್ಯಾ ಸಂಬಂಧಗಳು, ಆರ್ಥಿಕ ಸೂಚಕಗಳು ಮತ್ತು ಜಿಲ್ಲಾ ಸಾಮಾಜಿಕ ಅಪಾಯದ ಸ್ಕೋರಿಂಗ್.',
        'Social Risk Correlation': 'ಸಾಮಾಜಿಕ ಅಪಾಯದ ಪರಸ್ಪರ ಸಂಬಂಧ',
        'Demographic Distribution': 'ಜನಸಂಖ್ಯಾ ಹಂಚಿಕೆ',
        'ETHICAL & RESPONSIBLE AI MANDATE': 'ನೈತಿಕ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ಎಐ ಮಾರ್ಗದರ್ಶಿ',
        'AVG POPULATION DENSITY': 'ಸರಾಸರಿ ಜನಸಾಂದ್ರತೆ',
        'AVG LITERACY RATE': 'ಸರಾಸರಿ ಸಾಕ್ಷರತಾ ಪ್ರಮಾಣ',
        'AVG EMPLOYMENT RATE': 'ಸರಾಸರಿ ಉದ್ಯೋಗ ಪ್ರಮಾಣ',
        'AVG URBANIZATION': 'ಸರಾಸರಿ ನಗರೀಕರಣ',

        // Search / ZCQL
        'ZCQL COMMAND CENTER': 'ZCQL ಕಮಾಂಡ್ ಸೆಂಟರ್',
        'DUAL-LLM ENGINE ACTIVE': 'ದ್ವಿ-LLM ಇಂಜಿನ್ ಸಕ್ರಿಯವಾಗಿದೆ',
        'Enter natural language query or ZCQL directive...': 'ಸಾಮಾನ್ಯ ಭಾಷೆಯ ಪ್ರಶ್ನೆ ಅಥವಾ ZCQL ನಿರ್ದೇಶನವನ್ನು ನಮೂದಿಸಿ...',
        'EXECUTE': 'ಚಲಾಯಿಸಿ',
        'Recent FIRs & Cases': 'ಇತ್ತೀಚಿನ ಎಫ್‌ಐಆರ್‌ಗಳು ಮತ್ತು ಪ್ರಕರಣಗಳು',
        'Accused Profiles': 'ಆರೋಪಿಗಳ ಪ್ರೊಫೈಲ್‌ಗಳು',

        // Reports & Audit Logs
        'AI OFFICER BRIEF': 'ಎಐ ಅಧಿಕಾರಿ ಸಾರಾಂಶ',
        'Table': 'ಕೋಷ್ಟಕ',
        'Timeline': 'ಸಮಯರೇಖೆ',
        'Action Filter': 'ಕ್ರಮದ ಶೋಧಕ',
        'Status Filter': 'ಸ್ಥಿತಿಯ ಶೋಧಕ',
        'Start Date': 'ಆರಂಭದ ದಿನಾಂಕ',
        'End Date': 'ಅಂತಿಮ ದಿನಾಂಕ',
        'Export CSV': 'CSV ರಫ್ತು ಮಾಡಿ',
        'Export PDF': 'PDF ರಫ್ತು ಮಾಡಿ',
        'Timestamp': 'ಸಮಯದ ಮುದ್ರೆ',
        'User': 'ಬಳಕೆದಾರ',
        'Action': 'ಕ್ರಮ',
        'Resource': 'ಸಂಪನ್ಮೂಲ',
        'Status': 'ಸ್ಥಿತಿ',

        // Status & Common
        'Good Evening, Officer.': 'ಶುಭ ಸಂಜೆ, ಅಧಿಕಾರಿಗಳೇ.',
        'Good Morning, Officer.': 'ಶುಭೋದಯ, ಅಧಿಕಾರಿಗಳೇ.',
        'Good Afternoon, Officer.': 'ಶುಭ ಮಧ್ಯಾಹ್ನ, ಅಧಿಕಾರಿಗಳೇ.',
        'Active': 'ಸಕ್ರಿಯ',
        'Closed': 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ',
        'Under Investigation': 'ತನಿಖೆಯಲ್ಲಿದೆ',
        'High': 'ಹೆಚ್ಚು',
        'Medium': 'ಮಧ್ಯಮ',
        'Low': 'ಕಡಿಮೆ',
        'Loading...': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
        'Error': 'ದೋಷ',
        'Success': 'ಯಶಸ್ಸು',
        'Retry': 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
        'Logout': 'ನಿರ್ಗಮಿಸಿ',
        'TRIAGE': 'ವಿಂಗಡಣೆ'
    },
    hi: {
        // Navigation & Sidebar
        'Dashboard': 'डैशबोर्ड',
        'VIKSHANA Sentinel': 'वीक्षणा सेंटिनल',
        'Investigation Workspace': 'जांच कार्यक्षेत्र',
        'Forensic Intelligence Hub': 'फोरेंसिक इंटेलिजेंस हब',
        'Investigation Search': 'जांच खोज',
        'Sociological Insights': 'सामाजिक अंतर्दृष्टि',
        'Crime Forecasting': 'अपराध पूर्वानुमान',
        'Investigation Report': 'जांच रिपोर्ट',
        'Investigation Reports': 'जांच रिपोर्ट',
        'Audit Logs': 'ऑडिट लॉग',
        'Security Audit Logs': 'सुरक्षा ऑडिट लॉग',
        'PRIMARY ACTIONS': 'प्राथमिक क्रियाएं',
        'INTELLIGENCE': 'इंटेलिजेंस',
        'ADMIN & REPORTING': 'प्रशासन और रिपोर्टिंग',

        // Roles & Users
        'ROLE: ADMINISTRATOR': 'भूमिका: प्रशासक',
        'ROLE: INVESTIGATOR': 'भूमिका: जांचकर्ता',
        'ROLE: SUPERVISOR': 'भूमिका: पर्यवेक्षक',
        'ROLE: ANALYST': 'भूमिका: विश्लेषक',
        'ROLE: POLICYMAKER': 'भूमिका: नीति निर्माता',
        'ROLE: OFFICER': 'भूमिका: अधिकारी',
        'ROLE: Administrator': 'भूमिका: प्रशासक',
        'ROLE: Investigator': 'भूमिका: जांचकर्ता',
        'Administrator': 'प्रशासक',
        'Investigator': 'जांचकर्ता',
        'Supervisor': 'पर्यवेक्षक',
        'Analyst': 'विश्लेषक',
        'Policymaker': 'नीति निर्माता',
        'Officer': 'अधिकारी',
        'Viewer': 'दर्शक',
        'Admin User': 'प्रशासक उपयोगकर्ता',

        // General UI & Badges
        'Page Translated': 'अनुवादित',
        'Translated': 'अनुवादित',
        'Active Case ID:': 'सक्रिय मामला आईडी:',
        'Refresh': 'ताज़ा करें',
        'All Cases (Global View)': 'सभी मामले (वैश्विक दृश्य)',
        '🌐 All Cases (Global View)': '🌐 सभी मामले (वैश्विक दृश्य)',
        'Search everywhere (Cases, FIRs, Entities)...': 'हर जगह खोजें (मामले, प्राथमिकी, संस्थाएं)...',
        'Search cases, FIRs, entities...': 'हर जगह खोजें (मामले, प्राथमिकी, संस्थाएं)...',

        // Forensics Hub
        'Multi-Modal Forensic & Intelligence Hub': 'मल्टी-मॉडल फोरेंसिक और इंटेलिजेंस हब',
        'Unified data layer covering 10 operational forensic domains, Vector-RAG retrieval, and Scikit-Learn Python ML.': '10 फोरेंसिक डोमेन, वेक्टर-RAG और Scikit-Learn पायथन ML को एकीकृत करने वाली डेटा परत।',
        'Evidence & Chain of Custody': 'साक्ष्य और अभिरक्षा श्रृंखला',
        'CCTV Surveillance': 'सीसीटीवी निगरानी',
        'CDR Phone Intelligence': 'सीडीआर फोन इंटेलिजेंस',
        'Financial Intelligence': 'वित्तीय इंटेलिजेंस',
        'Forensic Lab Reports': 'फोरेंसिक लैब रिपोर्ट',
        'Weapons & Ballistics': 'हथियार और बैलिस्टिक',
        'Vehicle Seizures': 'वाहन जब्ती',
        'Biometrics & DNA': 'बायोमेट्रिक्स और डीएनए',
        'Court Proceedings': 'न्यायालय की कार्यवाही',
        'Interrogations': 'पूछताछ',
        'Semantic Vector RAG': 'सिमेंटिक वेक्टर RAG',
        'Python ML Pipeline': 'पायथन ML पाइपलाइन',
        'Physical Evidence & Chain of Custody': 'भौतिक साक्ष्य और अभिरक्षा श्रृंखला',
        'Record Evidence': 'साक्ष्य दर्ज करें',
        'Physical Weapon': 'भौतिक हथियार',
        'Fingerprint Lift Card': 'फिंगरप्रिंट कार्ड',
        'Blood / Biological Swab': 'रक्त / जैविक स्वाब',
        'Digital Media / Flash Drive': 'डिजिटल मीडिया / पेन ड्राइव',
        'Narcotic Substance': 'नशीला पदार्थ',
        'Documentary Evidence': 'दस्तावेज़ी साक्ष्य',
        'Description of item...': 'वस्तु का विवरण...',
        'HQ Vault A-12': 'मुख्यालय वॉल्ट A-12',
        'recorded items': 'दर्ज की गई वस्तुएं',
        'Evidence ID': 'साक्ष्य आईडी',
        'Type': 'प्रकार',
        'Description': 'विवरण',
        'Storage Location': 'भंडारण स्थान',
        'SHA-256 Hash': 'SHA-256 हैश',
        'Chain of Custody': 'अभिरक्षा श्रृंखला',

        // Investigation Workspace & Tabs
        'Command Center Idle': 'कमांड सेंटर तैयार',
        'Case Overview': 'मामला अवलोकन',
        'Foresight (ML)': 'दूरदर्शिता (ML)',
        'Foresight': 'दूरदर्शिता (ML)',
        'Investigation Leads': 'जांच सुराग',
        'Leads': 'जांच सुराग',
        'MO Profile': 'अपराध विधि (MO)',
        'MO Intelligence': 'एमओ इंटेलिजेंस',
        'Evidence Integrity': 'साक्ष्य सत्यता',
        'Evidence Chain': 'साक्ष्य श्रृंखला',
        'FIR Details': 'प्राथमिकी विवरण',
        'FIR Intelligence': 'प्राथमिकी इंटेलिजेंस',
        'Evidence Intelligence': 'साक्ष्य इंटेलिजेंस',
        'Timeline Intelligence': 'समयरेखा इंटेलिजेंस',
        'Timeline': 'समयरेखा',
        'Historical Intelligence': 'ऐतिहासिक इंटेलिजेंस',
        'Historical Match': 'ऐतिहासिक मिलान',
        'Relationships': 'संबंध',
        'Decision Support': 'निर्णय समर्थन',
        'VIKSHANA Copilot': 'वीक्षणा कोपायलट',
        'Intelligence Command': 'इंटेलिजेंस कमांड',
        'FIR SUMMARY': 'प्राथमिकी सारांश',
        'Victims': 'पीड़ित',
        'Suspects': 'संदिग्ध',
        'Evidence': 'साक्ष्य',
        'Witnesses': 'गवाह',
        'CRIME TYPE': 'अपराध प्रकार',
        'DATE': 'दिनांक',
        'POLICE STATION': 'पुलिस स्टेशन',
        'Deterministic Case Completeness': 'मामला पूर्णता स्कोर',
        'CATEGORY BREAKDOWN': 'श्रेणी विवरण',

        // Crime Forecasting Page
        'Crime Forecasting & Seasonal Intelligence': 'अपराध पूर्वानुमान और मौसमी इंटेलिजेंस',
        'Deterministic time-series analysis, event anomaly detection, and seasonal trend modeling.': 'समय-श्रृंखला विश्लेषण, घटना विसंगति पहचान और मौसमी रुझान मॉडलिंग।',
        '30-Day Trend Forecast': '30-दिवसीय रुझान पूर्वानुमान',
        'Seasonal & Event Intelligence': 'मौसमी और घटना इंटेलिजेंस',
        'Historical Baseline': 'ऐतिहासिक आधार रेखा',
        'Recent Average': 'हाल का औसत',
        'Forecast (Next 30D)': 'पूर्वानुमान (अगले 30 दिन)',
        'Historical Trend vs Moving Average': 'ऐतिहासिक रुझान बनाम मूविंग एवरेज',
        'Explanation & Evidence': 'स्पष्टीकरण और साक्ष्य',
        'Records Analyzed': 'विश्लेषित रिकॉर्ड',
        'Calculation Method': 'गणना विधि',
        'Data Reliability': 'डेटा विश्वसनीयता',
        'Backtest Validation': 'बैकटेस्ट सत्यापन',
        'Forecast Period': 'पूर्वानुमान अवधि',
        'SYSTEM LIMITATIONS': 'सिस्टम सीमाएं',
        'Peak Crime Month': 'शीर्ष अपराध महीना',
        'Highest Risk Day': 'उच्चतम जोखिम वाला दिन',
        'Lowest Risk Day': 'न्यूनतम जोखिम वाला दिन',
        'Dataset Coverage': 'डेटासेट कवरेज',
        'Month-Wise Crime Trends (Jan - Dec)': 'माहवार अपराध रुझान (जनवरी - दिसंबर)',
        'Day-of-Week Crime Patterns': 'सप्ताह के दिन के अपराध पैटर्न',
        'Festival & Public Event Window Intelligence': 'त्योहार और सार्वजनिक कार्यक्रम इंटेलिजेंस',
        'Event Name': 'कार्यक्रम का नाम',
        'Window': 'समयावधि',
        'Baseline': 'आधार रेखा',
        'Observed': 'देखे गए मामले',
        'Deviation': 'विचलन',
        'Anomaly Score': 'विसंगति स्कोर',
        'Evidence Insight': 'साक्ष्य अंतर्दृष्टि',
        'EARLY WARNING: TREND DETECTED': 'प्रारंभिक चेतावनी: रुझान पाया गया',

        // Sentinel Dashboard
        'VIKSHANA SENTINEL - AUTONOMOUS CASE TRIAGE & ACTION AGENT': 'वीक्षणा सेंटिनल - स्वायत्त मामला वर्गीकरण और कार्रवाई एजेंट',
        'Continuous automated surveillance across all active FIR dockets': 'सभी सक्रिय प्राथमिकी डॉकेट पर निरंतर स्वचालित निगरानी',
        'COPILOT INVESTIGATION': 'कोपायलट जांच',
        'Run Autonomous Scan': 'स्वायत्त स्कैन चलाएं',
        'CASES MONITORED': 'निगरानी किए गए मामले',
        'CRITICAL PRIORITY': 'गंभीर प्राथमिकता',
        'HIGH PRIORITY': 'उच्च प्राथमिकता',
        'ACTIONS AWAITING': 'लंबित कार्रवाई',
        'INVESTIGATION GAPS': 'जांच अंतराल',
        'PATTERN SURGES': 'पैटर्न में उछाल',
        'TOP CASES REQUIRING ATTENTION TODAY': 'आज ध्यान देने योग्य शीर्ष मामले',
        'CASE TRIAGE INTELLIGENCE DOSSIER': 'मामला वर्गीकरण इंटेलिजेंस डोजियर',
        'OPEN FULL WORKSPACE': 'पूरा कार्यक्षेत्र खोलें',

        // Sociological Insights
        'Sociological & Social Risk Intelligence': 'सामाजिक और सामाजिक जोखिम इंटेलिजेंस',
        'Demographic correlations, economic indicators, and district social risk scoring.': 'जनसांख्यिकीय संबंध, आर्थिक संकेतक और जिला सामाजिक जोखिम स्कोरिंग।',
        'Social Risk Correlation': 'सामाजिक जोखिम सहसंबंध',
        'Demographic Distribution': 'जनसांख्यिकीय वितरण',
        'ETHICAL & RESPONSIBLE AI MANDATE': 'नैतिक और जिम्मेदार एआई जनादेश',
        'AVG POPULATION DENSITY': 'औसत जनसंख्या घनत्व',
        'AVG LITERACY RATE': 'औसत साक्षरता दर',
        'AVG EMPLOYMENT RATE': 'औसत रोजगार दर',
        'AVG URBANIZATION': 'औसत शहरीकरण',

        // Search / ZCQL
        'ZCQL COMMAND CENTER': 'ZCQL कमांड सेंटर',
        'DUAL-LLM ENGINE ACTIVE': 'डुअल-LLM इंजन सक्रिय',
        'Enter natural language query or ZCQL directive...': 'प्राकृतिक भाषा प्रश्न या ZCQL निर्देश दर्ज करें...',
        'EXECUTE': 'निष्पादित करें',
        'Recent FIRs & Cases': 'हाल की प्राथमिकी और मामले',
        'Accused Profiles': 'आरोपी प्रोफाइल',

        // Reports & Audit Logs
        'AI OFFICER BRIEF': 'एआई अधिकारी संक्षिप्त',
        'Table': 'तालिका',
        'Timeline': 'समयरेखा',
        'Action Filter': 'कार्रवाई फ़िल्टर',
        'Status Filter': 'स्थिति फ़िल्टर',
        'Start Date': 'प्रारंभ तिथि',
        'End Date': 'अंतिम तिथि',
        'Export CSV': 'CSV निर्यात करें',
        'Export PDF': 'PDF निर्यात करें',
        'Timestamp': 'समय मुहर',
        'User': 'उपयोगकर्ता',
        'Action': 'कार्रवाई',
        'Resource': 'संसाधन',
        'Status': 'स्थिति',

        // Status & Common
        'Good Evening, Officer.': 'शुभ संध्या, अधिकारी।',
        'Good Morning, Officer.': 'शुभ प्रभात, अधिकारी।',
        'Good Afternoon, Officer.': 'शुभ दोपहर, अधिकारी।',
        'Active': 'सक्रिय',
        'Closed': 'बंद',
        'Under Investigation': 'जांच के तहत',
        'High': 'उच्च',
        'Medium': 'मध्यम',
        'Low': 'कम',
        'Loading...': 'लोड हो रहा है...',
        'Error': 'त्रुटि',
        'Success': 'सफलता',
        'Retry': 'पुनः प्रयास करें',
        'Logout': 'लॉग आउट',
        'TRIAGE': 'ट्राएज'
    }
};

// ── Cache setup ───────────────────────────────────────────────────────────────
const MEM_CACHE = new Map(); // "lang:text" → translatedText
const LS_KEY    = 'vikshana_xlat_v4'; // Cache key

function cacheKey(text, lang) {
    return `${lang}:${text}`;
}

// Load from localStorage on first import
(function initCache() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;
        const obj = JSON.parse(raw);
        Object.entries(obj).forEach(([k, v]) => MEM_CACHE.set(k, v));
    } catch (_) { /* corrupted — ignore */ }
})();

// Throttled localStorage save
let _lsSaveTimer = null;
function scheduleLSSave() {
    if (_lsSaveTimer) return;
    _lsSaveTimer = setTimeout(() => {
        _lsSaveTimer = null;
        try {
            const obj = {};
            MEM_CACHE.forEach((v, k) => { obj[k] = v; });
            localStorage.setItem(LS_KEY, JSON.stringify(obj));
        } catch (_) { /* ignore */ }
    }, 2000);
}

export function clearTranslationCache() {
    MEM_CACHE.clear();
    if (_lsSaveTimer) clearTimeout(_lsSaveTimer);
    _lsSaveTimer = null;
    try { localStorage.removeItem(LS_KEY); } catch (_) {}
}

// ── Concurrency limiter ───────────────────────────────────────────────────────
const MAX_CONCURRENT = 3;
let _activeRequests = 0;
const _waitQueue = [];

function acquireSlot() {
    return new Promise(resolve => {
        if (_activeRequests < MAX_CONCURRENT) {
            _activeRequests++;
            resolve();
        } else {
            _waitQueue.push(resolve);
        }
    });
}

function releaseSlot() {
    if (_waitQueue.length > 0) {
        const next = _waitQueue.shift();
        next();
    } else {
        _activeRequests--;
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get a cached or dictionary translation immediately (synchronous).
 * Features exact & normalized (case-insensitive) dictionary matching.
 */
export function getCached(text, lang) {
    if (!text || lang === 'en') return lang === 'en' ? text : null;
    const trimmed = text.trim();
    
    // 1. Check dictionary exact match
    if (OFFLINE_DICTIONARY[lang] && OFFLINE_DICTIONARY[lang][trimmed]) {
        return OFFLINE_DICTIONARY[lang][trimmed];
    }
    
    // 2. Check dictionary normalized / case-insensitive match
    if (OFFLINE_DICTIONARY[lang]) {
        const norm = trimmed.toLowerCase().replace(/[:?._!-]+$/, '').trim();
        for (const [k, v] of Object.entries(OFFLINE_DICTIONARY[lang])) {
            if (k.toLowerCase().replace(/[:?._!-]+$/, '').trim() === norm) {
                return v;
            }
        }
    }
    
    return MEM_CACHE.get(cacheKey(trimmed, lang)) ?? null;
}

/**
 * Translate an array of strings to the target language.
 */
export async function translateTexts(texts, targetLang) {
    if (!texts || !texts.length) return [];
    if (targetLang === 'en') return texts;

    const lang = targetLang.toLowerCase().trim();
    const results = new Array(texts.length).fill(null);
    const uncachedIndexes = [];

    // 1. Resolve dictionary or memory cache immediately
    texts.forEach((text, i) => {
        if (!text || !text.trim()) {
            results[i] = text || '';
            return;
        }
        const trimmed = text.trim();
        if (OFFLINE_DICTIONARY[lang] && OFFLINE_DICTIONARY[lang][trimmed]) {
            results[i] = OFFLINE_DICTIONARY[lang][trimmed];
            return;
        }
        const cached = MEM_CACHE.get(cacheKey(trimmed, lang));
        if (cached !== undefined) {
            results[i] = cached;
        } else {
            uncachedIndexes.push(i);
        }
    });

    if (uncachedIndexes.length === 0) return results;

    // 2. Fetch uncached strings in batches from backend
    const uniqueTexts = [...new Set(uncachedIndexes.map(i => texts[i].trim()))];
    const translationMap = new Map();

    for (let start = 0; start < uniqueTexts.length; start += 25) {
        const chunk = uniqueTexts.slice(start, start + 25);

        await acquireSlot();
        try {
            const response = await api.post('/ml/translate', {
                texts: chunk,
                sourceLanguage: 'en',
                targetLanguage: lang
            });

            const translations = response.data?.data?.translations;
            if (Array.isArray(translations)) {
                chunk.forEach((origText, j) => {
                    const translated = translations[j];
                    if (translated && typeof translated === 'string' && translated.trim()) {
                        translationMap.set(origText, translated);
                        MEM_CACHE.set(cacheKey(origText, lang), translated);
                    } else {
                        const dictFallback = OFFLINE_DICTIONARY[lang]?.[origText] || origText;
                        MEM_CACHE.set(cacheKey(origText, lang), dictFallback);
                        translationMap.set(origText, dictFallback);
                    }
                });
                scheduleLSSave();
            } else {
                chunk.forEach(t => {
                    const dictFallback = OFFLINE_DICTIONARY[lang]?.[t] || t;
                    MEM_CACHE.set(cacheKey(t, lang), dictFallback);
                    translationMap.set(t, dictFallback);
                });
            }
        } catch (err) {
            chunk.forEach(t => {
                const dictFallback = OFFLINE_DICTIONARY[lang]?.[t] || t;
                MEM_CACHE.set(cacheKey(t, lang), dictFallback);
                translationMap.set(t, dictFallback);
            });
        } finally {
            releaseSlot();
        }
    }

    // 3. Fill in results
    uncachedIndexes.forEach(i => {
        const text = texts[i].trim();
        results[i] = translationMap.get(text) || MEM_CACHE.get(cacheKey(text, lang)) || OFFLINE_DICTIONARY[lang]?.[text] || text;
    });

    return results;
}

/**
 * Translate a single string.
 */
export async function translateOne(text, targetLang) {
    if (!text) return text;
    const [result] = await translateTexts([text], targetLang);
    return result;
}

const translationService = {
    getCached,
    translateTexts,
    translateOne,
    clearTranslationCache
};

export default translationService;
