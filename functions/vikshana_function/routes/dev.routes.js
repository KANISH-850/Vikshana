const express = require('express');
const DevController = require('../controllers/DevController');

const router = express.Router();

// Dev-only utility: seeds Witness/Suspect/CCTVFootage/PhoneRecord/
// FinancialTransaction/TimelineEvent rows for every existing case so the
// investigation copilot has real, citable data. Idempotent per case/table.
router.post('/seed', DevController.seed);

module.exports = router;
