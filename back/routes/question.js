const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/phase/:phaseId', questionController.getByPhase);
router.post('/', questionController.create);
router.put('/:id', questionController.update);
router.delete('/:id', questionController.delete);

module.exports = router;