const express = require('express');
require('dotenv').config({ path: __dirname + '/.env' });
const cors = require('cors');
const { authenticateToken, authorizeRole } = require('./middleware/authorize.middleware');
const { fieldFilter } = require('./middleware/fieldFilter.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const investigateRoutes = require('./routes/investigation.routes');
const relationshipRoutes = require('./routes/relationship.routes');
const evidenceRoutes = require('./routes/evidence.routes');
const reportRoutes = require('./routes/report.routes');
const devRoutes = require('./routes/dev.routes');
const conversationRoutes = require('./routes/conversation.routes');
const caseRoutes = require('./routes/case.routes');
const signalRoutes = require('./routes/signal.routes');
const jobRoutes = require('./routes/job.routes');
const mlRoutes = require('./routes/ml.routes');
const convokraftRoutes = require('./routes/convokraft.routes');
const sociologicalRoutes = require('./routes/sociological.routes');
const offenderRoutes = require('./routes/offender.routes');
const decisionRoutes = require('./routes/decision.routes');
const forecastingRoutes = require('./routes/forecasting.routes');
const auditRoutes = require('./routes/audit.routes');
const textToSqlRoutes = require('./routes/textToSql.routes');
const firIntelligenceRoutes = require('./routes/firIntelligence.routes');
const evidenceIntelligenceRoutes = require('./routes/evidenceIntelligence.routes');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(authenticateToken);
app.use(fieldFilter);

// Public Routes
app.use('/auth', authRoutes);
app.use('/dev', devRoutes);
app.use('/audit', authorizeRole('Administrator', 'Supervisor'), auditRoutes);

// Role Protected API Routes
app.use('/dashboard', authorizeRole('Administrator', 'Investigator', 'Analyst', 'Supervisor', 'Policymaker'), dashboardRoutes);
app.use('/investigate', authorizeRole('Administrator', 'Investigator', 'Supervisor'), investigateRoutes);
app.use('/conversations', authorizeRole('Administrator', 'Investigator', 'Supervisor'), conversationRoutes);
app.use('/cases', authorizeRole('Administrator', 'Investigator', 'Supervisor'), caseRoutes);
app.use('/decision', authorizeRole('Administrator', 'Investigator', 'Supervisor'), decisionRoutes);
app.use('/offender', authorizeRole('Administrator', 'Investigator', 'Supervisor'), offenderRoutes);
app.use('/evidence', authorizeRole('Administrator', 'Investigator', 'Supervisor'), evidenceRoutes);

app.use('/relationships', authorizeRole('Administrator', 'Investigator', 'Analyst', 'Supervisor'), relationshipRoutes);
app.use('/sociological', authorizeRole('Administrator', 'Analyst', 'Supervisor', 'Policymaker'), sociologicalRoutes);
app.use('/forecasting', authorizeRole('Administrator', 'Analyst', 'Supervisor', 'Policymaker'), forecastingRoutes);
app.use('/ml', authorizeRole('Administrator', 'Investigator', 'Analyst', 'Supervisor'), mlRoutes);

app.use('/reports', authorizeRole('Administrator', 'Investigator', 'Analyst', 'Supervisor', 'Policymaker'), reportRoutes);
app.use('/signals', authorizeRole('Administrator', 'Investigator', 'Analyst', 'Supervisor', 'Policymaker'), signalRoutes);
app.use('/jobs', authorizeRole('Administrator', 'Investigator', 'Supervisor'), jobRoutes);
app.use('/convokraft', authorizeRole('Administrator', 'Investigator', 'Supervisor'), convokraftRoutes);
app.use('/text-to-sql', authorizeRole('Administrator', 'Investigator', 'Supervisor', 'Analyst', 'Policymaker'), textToSqlRoutes);
app.use('/fir-intelligence', authorizeRole('Administrator', 'Investigator', 'Supervisor', 'Analyst', 'Policymaker'), firIntelligenceRoutes);
app.use('/evidence-intelligence', authorizeRole('Administrator', 'Investigator', 'Supervisor', 'Analyst', 'Policymaker'), evidenceIntelligenceRoutes);



// Fallback for missing routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found in VIKSHANA API' });
});

module.exports = app;
