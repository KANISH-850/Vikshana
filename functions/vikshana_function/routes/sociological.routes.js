const express = require('express');
const SociologicalController = require('../controllers/SociologicalController');
const SociologicalAssistantController = require('../controllers/SociologicalAssistantController');

const router = express.Router();

router.get('/overview', SociologicalController.getOverview);
router.get('/demographics', SociologicalController.getDemographics);
router.get('/social-risk', SociologicalController.getSocialRisk);
router.get('/districts', SociologicalController.getDistrictComparison);
router.get('/correlations', SociologicalController.getCorrelations);
router.get('/migration', SociologicalController.getMigration);
router.get('/urbanization', SociologicalController.getUrbanization);
router.get('/indicators', SociologicalController.getSocialIndicators);
router.post('/custom-correlation', SociologicalController.postCustomCorrelation);

// AI Sociological Assistant
router.post('/assistant/ask', SociologicalAssistantController.ask);

module.exports = router;
