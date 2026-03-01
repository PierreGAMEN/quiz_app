const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/', quizController.getAll);
router.get('/:id', quizController.getById);
router.post('/', quizController.create);
router.put('/:id', quizController.update);
router.delete('/:id', quizController.delete);

// A SUPPRIMER PLUS TARD
router.delete('/reset/all', async (req, res) => {
  try {
    await require('../db').query('TRUNCATE player_answer, player, room, answer_option, question, phase, quiz RESTART IDENTITY CASCADE');
    res.json({ message: 'Base de données vidée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;