const db = require('./db');
require('dotenv').config();

async function clear() {
  await db.query('TRUNCATE player_answer, player, room, answer_option, question, phase, quiz RESTART IDENTITY CASCADE');
  console.log('✅ Base de données vidée');
  process.exit(0);
}

clear().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});