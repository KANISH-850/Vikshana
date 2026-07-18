const express = require('express');
const RelationshipController = require('../controllers/RelationshipController');

const router = express.Router();

router.get('/', RelationshipController.getNetwork);

module.exports = router;
