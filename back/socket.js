const db = require('./db');

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log(`Client connecté : ${socket.id}`);

    // Rejoindre une room WebSocket
    socket.on('room:join', async ({ roomCode, playerId }) => {
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.playerId = playerId;

      const players = await db.query(
        `SELECT p.* FROM player p
         JOIN room r ON r.id = p.room_id
         WHERE r.code = $1`,
        [roomCode]
      );

      // Notifie tout le monde dans la room
      io.to(roomCode).emit('room:players_updated', players.rows);
      console.log(`Joueur ${playerId} a rejoint la room ${roomCode}`);
    });

    // Admin démarre le quiz
    socket.on('game:start', async ({ roomCode }) => {
  await db.query('UPDATE room SET status = $1 WHERE code = $2', ['in_progress', roomCode]);

  const roomResult = await db.query('SELECT * FROM room WHERE code = $1', [roomCode]);
  const room = roomResult.rows[0];

  const phases = await db.query('SELECT * FROM phase WHERE quiz_id = $1 ORDER BY "order"', [room.quiz_id]);
  for (let phase of phases.rows) {
    const questions = await db.query('SELECT * FROM question WHERE phase_id = $1 ORDER BY "order"', [phase.id]);
    for (let question of questions.rows) {
      const options = await db.query('SELECT * FROM answer_option WHERE question_id = $1', [question.id]);
      question.options = options.rows;
    }
    phase.questions = questions.rows;
  }

  console.log('Émission game:started', JSON.stringify({ phases: phases.rows }));
  io.to(roomCode).emit('game:started', { phases: phases.rows }); // <- phases.rows et pas phases
});

socket.on('game:display_mode', ({ roomCode, enabled }) => {
  io.to(roomCode).emit('game:display_mode_updated', { enabled });
});

    // Admin passe à la question suivante
    socket.on('game:next_question', ({ roomCode, phaseId, questionId }) => {
      io.to(roomCode).emit('game:question', { phaseId, questionId });
    });

    socket.on('game:question_resolved', ({ roomCode }) => {
    io.to(roomCode).emit('game:question_resolved');
});

    // Joueur buzz
    socket.on('game:buzz', async ({ roomCode, playerId }) => {
      const player = await db.query('SELECT * FROM player WHERE id = $1', [playerId]);
      io.to(roomCode).emit('game:buzzed', { player: player.rows[0] });
    });

    // Admin annule le buzz et relance
socket.on('game:buzz_reset', ({ roomCode }) => {
  io.to(roomCode).emit('game:buzz_reset');
});

    // Joueur envoie une réponse écrite
    socket.on('game:answer', async ({ roomCode, playerId, questionId, answer }) => {
  await db.query(
    'INSERT INTO player_answer (player_id, question_id, answer) VALUES ($1, $2, $3)',
    [playerId, questionId, answer]
  );

  // Notifie l'admin qu'une réponse est arrivée
  io.to(roomCode).emit('game:answer_received', { playerId, answer });

  // Vérifie si tous les joueurs de CETTE room ont répondu à CETTE question
  const players = await db.query(
    `SELECT p.id FROM player p JOIN room r ON r.id = p.room_id WHERE r.code = $1`,
    [roomCode]
  );
  const answers = await db.query(
    `SELECT pa.* FROM player_answer pa
     JOIN player p ON p.id = pa.player_id
     JOIN room r ON r.id = p.room_id
     WHERE r.code = $1 AND pa.question_id = $2`,
    [roomCode, questionId]
  );

  if (answers.rows.length >= players.rows.length) {
    io.to(roomCode).emit('game:all_answered', { questionId });
  }
});

socket.on('game:reveal_results', async ({ roomCode, questionId }) => {
  const question = await db.query('SELECT * FROM question WHERE id = $1', [questionId]);
  const answers = await db.query(
    `SELECT pa.* FROM player_answer pa
     JOIN player p ON p.id = pa.player_id
     JOIN room r ON r.id = p.room_id
     WHERE r.code = $1 AND pa.question_id = $2`,
    [roomCode, questionId]
  );

  // Récupère la bonne réponse depuis les options
  const correctOption = await db.query(
    'SELECT * FROM answer_option WHERE question_id = $1 AND is_correct = true',
    [questionId]
  );
  const correctAnswer = correctOption.rows[0]?.text?.toLowerCase().trim();

  for (let ans of answers.rows) {
    const isCorrect = ans.answer?.toLowerCase().trim() === correctAnswer;
    const points = isCorrect ? question.rows[0].points : 0;

    await db.query(
      'UPDATE player_answer SET is_correct = $1, points_awarded = $2 WHERE id = $3',
      [isCorrect, points, ans.id]
    );

    if (isCorrect) {
      await db.query('UPDATE player SET score = score + $1 WHERE id = $2', [points, ans.player_id]);
    }

    // Notifie chaque joueur individuellement
    const playerSockets = await io.in(roomCode).fetchSockets();
    for (let s of playerSockets) {
      if (s.data.playerId === ans.player_id) {
        s.emit('game:answer_result', { isCorrect, points });
      }
    }
  }

  // Met à jour les scores pour tout le monde
  const players = await db.query(
    `SELECT p.* FROM player p JOIN room r ON r.id = p.room_id WHERE r.code = $1`,
    [roomCode]
  );
  io.to(roomCode).emit('room:players_updated', players.rows);
  io.to(roomCode).emit('game:results_revealed', { 
  answers: answers.rows,
  correctAnswer: correctOption.rows[0]?.text
});
});

    // Admin attribue des points manuellement (buzz ou correction)
    socket.on('game:award_points', async ({ roomCode, playerId, questionId, points }) => {
      await db.query(
        `INSERT INTO player_answer (player_id, question_id, points_awarded)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [playerId, questionId, points]
      );
      await db.query(
        'UPDATE player SET score = score + $1 WHERE id = $2',
        [points, playerId]
      );

      const players = await db.query(
        `SELECT p.* FROM player p JOIN room r ON r.id = p.room_id WHERE r.code = $1`,
        [roomCode]
      );
      io.to(roomCode).emit('room:players_updated', players.rows);
    });

    // Admin termine le quiz
    socket.on('game:end', async ({ roomCode }) => {
      await db.query('UPDATE room SET status = $1 WHERE code = $2', ['finished', roomCode]);
      const players = await db.query(
        `SELECT p.* FROM player p JOIN room r ON r.id = p.room_id WHERE r.code = $1 ORDER BY p.score DESC`,
        [roomCode]
      );
      io.to(roomCode).emit('game:finished', { leaderboard: players.rows });
    });

    socket.on('disconnect', async () => {
  console.log(`Client déconnecté : ${socket.id}`);
  
  const { roomCode, playerId } = socket.data;
  
  if (roomCode && playerId) {
    // Vérifie si la partie est en cours
    const room = await db.query('SELECT * FROM room WHERE code = $1', [roomCode]);
    
    if (room.rows.length > 0 && room.rows[0].status === 'waiting') {
      // Supprime le joueur seulement si la partie n'a pas commencé
      await db.query('DELETE FROM player WHERE id = $1', [playerId]);
    }

    // Notifie les autres joueurs
    const players = await db.query(
      `SELECT p.* FROM player p JOIN room r ON r.id = p.room_id WHERE r.code = $1`,
      [roomCode]
    );
    io.to(roomCode).emit('room:players_updated', players.rows);
  }
});
  });

};