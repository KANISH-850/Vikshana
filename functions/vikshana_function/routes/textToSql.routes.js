const express = require('express');
const router = express.Router();
const textToSQLController = require('../controllers/TextToSQLController');

// Route to process natural language query
router.post('/query', textToSQLController.processQuery);

module.exports = router;
