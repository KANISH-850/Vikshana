const express = require('express');
require('dotenv').config({ path: __dirname + '/.env' });
const cors = require('cors');

// Import route
const dashboardRoutes = require('./routes/dashboard.routes');
const investigateRoutes = require('./routes/investigation.routes');
const relationshipRoutes = require('./routes/relationship.routes');
const evidenceRoutes = require('./routes/evidence.routes');
const reportRoutes = require('./routes/report.routes');
const devRoutes = require('./routes/dev.routes');
const conversationRoutes = require('./routes/conversation.routes');
const caseRoutes = require('./routes/case.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/dashboard', dashboardRoutes);
app.use('/investigate', investigateRoutes); // @deprecated — superseded by /conversations; kept live and unreferenced by the frontend
app.use('/relationships', relationshipRoutes);
app.use('/evidence', evidenceRoutes);
app.use('/reports', reportRoutes);
app.use('/dev', devRoutes);
app.use('/conversations', conversationRoutes);
app.use('/cases', caseRoutes);

// Fallback for missing routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found in VIKSHANA API' });
});

// Catalyst requires exporting the express app for advancedio
module.exports = app;
