const db = require('../db');

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

exports.getByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const room = await db.query('SELECT * FROM room WHERE code = $1', [code]);
    if (room.rows.length === 0) return res.status(404).json({ error: 'Room introuvable' });

    const players = await db.query('SELECT * FROM player WHERE room_id = $1', [room.rows[0].id]);
    res.json({ ...room.rows[0], players: players.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { quiz_id } = req.body;
    let code;
    let exists = true;

    // Génère un code unique
    while (exists) {
      code = generateCode();
      const check = await db.query('SELECT id FROM room WHERE code = $1', [code]);
      exists = check.rows.length > 0;
    }

    const result = await db.query(
      'INSERT INTO room (quiz_id, code, status) VALUES ($1, $2, $3) RETURNING *',
      [quiz_id, code, 'waiting']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.join = async (req, res) => {
  try {
    const { code } = req.params;
    const { name } = req.body;

    const room = await db.query('SELECT * FROM room WHERE code = $1', [code]);
    if (room.rows.length === 0) return res.status(404).json({ error: 'Room introuvable' });
    if (room.rows[0].status !== 'waiting') return res.status(400).json({ error: 'La partie a déjà commencé' });

    // Vérifie si le nom est déjà pris dans cette room
    const existing = await db.query('SELECT * FROM player WHERE room_id = $1 AND name = $2', [room.rows[0].id, name]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Ce nom est déjà pris' });

    const player = await db.query(
      'INSERT INTO player (room_id, name, score) VALUES ($1, $2, 0) RETURNING *',
      [room.rows[0].id, name]
    );
    res.status(201).json({ player: player.rows[0], room: room.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};