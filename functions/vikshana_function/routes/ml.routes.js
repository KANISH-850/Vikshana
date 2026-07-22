const express = require('express');
const router = express.Router();
const QuickMLService = require('../services/QuickMLService');

// POST /ml/predict-risk - Predict suspect risk score via QuickML
router.post('/predict-risk', async (req, res) => {
    try {
        const result = await QuickMLService.predictSuspectRisk(req, req.body || {});
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in POST /ml/predict-risk:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /ml/predict-hotspots - Predict spatial-temporal crime hotspots via QuickML
router.get('/predict-hotspots', async (req, res) => {
    try {
        const sectorId = req.query.sectorId || 'Sector-18';
        const result = await QuickMLService.predictCrimeHotspots(req, { sectorId });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error in GET /ml/predict-hotspots:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
