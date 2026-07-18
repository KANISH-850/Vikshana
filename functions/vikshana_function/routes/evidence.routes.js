const express = require('express');
const EvidenceController = require('../controllers/EvidenceController');

const router = express.Router();

router.get('/', EvidenceController.getEvidence);

module.exports = router;
