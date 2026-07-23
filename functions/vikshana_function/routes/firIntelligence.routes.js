const express = require('express');
const router = express.Router();
const firIntelligenceController = require('../controllers/FIRIntelligenceController');

// Route to process raw FIR text
router.post('/analyze', firIntelligenceController.analyze);

module.exports = router;
