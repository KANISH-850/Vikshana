const express = require('express');
const router = express.Router();
const OffenderProfilingController = require('../controllers/OffenderProfilingController');

router.get('/list', OffenderProfilingController.getList);
router.get('/profile/:id', OffenderProfilingController.getProfile);
router.get('/compare/:id1/:id2', OffenderProfilingController.compareOffenders);
router.post('/ai-insights', OffenderProfilingController.askAIInsights);

module.exports = router;
