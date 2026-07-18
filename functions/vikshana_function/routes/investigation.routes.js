const express = require('express');
const InvestigationController = require('../controllers/InvestigationController');

const router = express.Router();

router.post('/', InvestigationController.investigate);

module.exports = router;
