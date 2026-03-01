const db = require('../db');

exports.getByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const result = await db.query('SELECT * FROM phase WHERE quiz_id = $1 ORDER BY "order"', [quizId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { quiz_id, title, order, type } = req.body;
    const result = await db.query(
      'INSERT INTO phase (quiz_id, title, "order", type) VALUES ($1, $2, $3, $4) RETURNING *',
      [quiz_id, title, order, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order, type } = req.body;
    const result = await db.query(
      'UPDATE phase SET title = $1, "order" = $2, type = $3 WHERE id = $4 RETURNING *',
      [title, order, type, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Phase introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM phase WHERE id = $1', [id]);
    res.json({ message: 'Phase supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};