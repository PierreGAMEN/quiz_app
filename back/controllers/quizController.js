const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM quiz ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await db.query('SELECT * FROM quiz WHERE id = $1', [id]);
    if (quiz.rows.length === 0) return res.status(404).json({ error: 'Quiz introuvable' });

    const phases = await db.query('SELECT * FROM phase WHERE quiz_id = $1 ORDER BY "order"', [id]);
    
    for (let phase of phases.rows) {
      const questions = await db.query('SELECT * FROM question WHERE phase_id = $1 ORDER BY "order"', [phase.id]);
      for (let question of questions.rows) {
        const options = await db.query('SELECT * FROM answer_option WHERE question_id = $1', [question.id]);
        question.options = options.rows;
      }
      phase.questions = questions.rows;
    }

    res.json({ ...quiz.rows[0], phases: phases.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await db.query(
      'INSERT INTO quiz (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const result = await db.query(
      'UPDATE quiz SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Quiz introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM quiz WHERE id = $1', [id]);
    res.json({ message: 'Quiz supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};