const db = require('../db');

exports.getByPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const questions = await db.query('SELECT * FROM question WHERE phase_id = $1 ORDER BY "order"', [phaseId]);
    
    for (let question of questions.rows) {
      const options = await db.query('SELECT * FROM answer_option WHERE question_id = $1', [question.id]);
      question.options = options.rows;
    }

    res.json(questions.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { phase_id, text, points, order, time_limit, options, has_options } = req.body;
    
    const result = await db.query(
  'INSERT INTO question (phase_id, text, points, "order", time_limit, has_options) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
  [phase_id, text, points ?? 1, order, time_limit ?? null, has_options ?? false]
);
    const question = result.rows[0];

    // Si des options QCM sont fournies
    if (options && options.length > 0) {
      for (let option of options) {
        await db.query(
          'INSERT INTO answer_option (question_id, text, is_correct) VALUES ($1, $2, $3)',
          [question.id, option.text, option.is_correct ?? false]
        );
      }
      const savedOptions = await db.query('SELECT * FROM answer_option WHERE question_id = $1', [question.id]);
      question.options = savedOptions.rows;
    } else {
      question.options = [];
    }

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, points, order, time_limit } = req.body;
    const result = await db.query(
      'UPDATE question SET text = $1, points = $2, "order" = $3, time_limit = $4 WHERE id = $5 RETURNING *',
      [text, points, order, time_limit ?? null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Question introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM question WHERE id = $1', [id]);
    res.json({ message: 'Question supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};