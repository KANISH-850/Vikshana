const express = require('express');
const ConversationController = require('../controllers/ConversationController');
const AttachmentController = require('../controllers/AttachmentController');

const router = express.Router();

router.get('/', ConversationController.list);
router.post('/', ConversationController.create);
router.get('/:id', ConversationController.getOne);
router.patch('/:id', ConversationController.update);
router.delete('/:id', ConversationController.remove);
router.post('/:id/messages', ConversationController.sendMessage);
router.post('/:id/upload', AttachmentController.middleware, AttachmentController.upload);

module.exports = router;
