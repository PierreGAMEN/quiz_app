const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/:code', roomController.getByCode);
router.post('/', roomController.create);
router.post('/:code/join', roomController.join);

module.exports = router;