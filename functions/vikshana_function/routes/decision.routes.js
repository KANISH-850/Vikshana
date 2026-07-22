const express = require('express');
const router = express.Router();
const DecisionSupportController = require('../controllers/DecisionSupportController');

router.get('/summary', DecisionSupportController.getSummary);
router.get('/summary/:caseId', DecisionSupportController.getSummary);

router.get('/timeline', DecisionSupportController.getTimeline);
router.get('/timeline/:caseId', DecisionSupportController.getTimeline);

router.get('/similar-cases', DecisionSupportController.getSimilarCases);
router.get('/similar-cases/:caseId', DecisionSupportController.getSimilarCases);

router.post('/lead-recommendations', DecisionSupportController.getLeadRecommendations);

module.exports = router;
