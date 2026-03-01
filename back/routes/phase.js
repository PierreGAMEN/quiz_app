const express = require('express');
const router = express.Router();
const phaseController = require('../controllers/phaseController');

router.get('/quiz/:quizId', phaseController.getByQuiz);
router.post('/', phaseController.create);
router.put('/:id', phaseController.update);
router.delete('/:id', phaseController.delete);

module.exports = router;