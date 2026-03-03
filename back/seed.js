const db = require('./db');
require('dotenv').config();

async function seed() {
  console.log('🌱 Début du seeding...');

  // Nettoie les données existantes
  await db.query('TRUNCATE player_answer, player, room, answer_option, question, phase, quiz RESTART IDENTITY CASCADE');

  // ─────────────────────────────────────────
  // QUIZ 1 : Culture générale
  // ─────────────────────────────────────────
  const quiz1 = await db.query(
    `INSERT INTO quiz (title, description) VALUES ($1, $2) RETURNING id`,
    ['Culture Générale', 'Un quiz classique tous niveaux']
  );
  const quiz1Id = quiz1.rows[0].id;

  const phase1 = await db.query(
    `INSERT INTO phase (quiz_id, title, "order", type) VALUES ($1, $2, $3, $4) RETURNING id`,
    [quiz1Id, 'Buzz rapide', 1, 'buzz']
  );
  const phase1Id = phase1.rows[0].id;

  const phase2 = await db.query(
    `INSERT INTO phase (quiz_id, title, "order", type) VALUES ($1, $2, $3, $4) RETURNING id`,
    [quiz1Id, 'QCM', 2, 'all_answer']
  );
  const phase2Id = phase2.rows[0].id;

  // Questions buzz
  const buzzQuestions1 = [
    { text: 'Quelle est la capitale de l\'Australie ?', points: 2 },
    { text: 'Qui a peint la Joconde ?', points: 2 },
    { text: 'Combien de cordes a une guitare classique ?', points: 1 },
    { text: 'Quel est le plus grand océan du monde ?', points: 1 },
    { text: 'Quelle est la formule chimique de l\'eau ?', points: 1 },
  ];

  for (let i = 0; i < buzzQuestions1.length; i++) {
    await db.query(
      `INSERT INTO question (phase_id, text, points, "order") VALUES ($1, $2, $3, $4)`,
      [phase1Id, buzzQuestions1[i].text, buzzQuestions1[i].points, i + 1]
    );
  }

  // Questions QCM
  const qcmQuestions1 = [
    {
      text: 'Quelle est la planète la plus proche du Soleil ?',
      points: 2,
      options: [
        { text: 'Vénus', is_correct: false },
        { text: 'Mercure', is_correct: true },
        { text: 'Mars', is_correct: false },
        { text: 'Terre', is_correct: false },
      ]
    },
    {
      text: 'En quelle année a eu lieu la Révolution française ?',
      points: 2,
      options: [
        { text: '1776', is_correct: false },
        { text: '1804', is_correct: false },
        { text: '1789', is_correct: true },
        { text: '1815', is_correct: false },
      ]
    },
    {
      text: 'Quel pays a la plus grande superficie du monde ?',
      points: 1,
      options: [
        { text: 'Canada', is_correct: false },
        { text: 'Chine', is_correct: false },
        { text: 'États-Unis', is_correct: false },
        { text: 'Russie', is_correct: true },
      ]
    },
    {
      text: 'Combien de joueurs dans une équipe de football ?',
      points: 1,
      options: [
        { text: '9', is_correct: false },
        { text: '10', is_correct: false },
        { text: '11', is_correct: true },
        { text: '12', is_correct: false },
      ]
    },
  ];

  for (let i = 0; i < qcmQuestions1.length; i++) {
    const q = await db.query(
      `INSERT INTO question (phase_id, text, points, "order") VALUES ($1, $2, $3, $4) RETURNING id`,
      [phase2Id, qcmQuestions1[i].text, qcmQuestions1[i].points, i + 1]
    );
    for (let opt of qcmQuestions1[i].options) {
      await db.query(
        `INSERT INTO answer_option (question_id, text, is_correct) VALUES ($1, $2, $3)`,
        [q.rows[0].id, opt.text, opt.is_correct]
      );
    }
  }

  // ─────────────────────────────────────────
  // QUIZ 2 : Cinéma
  // ─────────────────────────────────────────
  const quiz2 = await db.query(
    `INSERT INTO quiz (title, description) VALUES ($1, $2) RETURNING id`,
    ['Cinéma', 'Films, acteurs et réalisateurs']
  );
  const quiz2Id = quiz2.rows[0].id;

  const phase3 = await db.query(
    `INSERT INTO phase (quiz_id, title, "order", type) VALUES ($1, $2, $3, $4) RETURNING id`,
    [quiz2Id, 'Buzz ciné', 1, 'buzz']
  );
  const phase3Id = phase3.rows[0].id;

  const phase4 = await db.query(
    `INSERT INTO phase (quiz_id, title, "order", type) VALUES ($1, $2, $3, $4) RETURNING id`,
    [quiz2Id, 'QCM ciné', 2, 'all_answer']
  );
  const phase4Id = phase4.rows[0].id;

  const buzzQuestions2 = [
    { text: 'Quel acteur joue Jack Dawson dans Titanic ?', points: 2 },
    { text: 'Qui réalise le film Inception ?', points: 2 },
    { text: 'Dans quel film trouve-t-on le personnage de Forrest Gump ?', points: 1 },
    { text: 'Quelle saga met en scène le personnage de Darth Vader ?', points: 1 },
  ];

  for (let i = 0; i < buzzQuestions2.length; i++) {
    await db.query(
      `INSERT INTO question (phase_id, text, points, "order") VALUES ($1, $2, $3, $4)`,
      [phase3Id, buzzQuestions2[i].text, buzzQuestions2[i].points, i + 1]
    );
  }

  const qcmQuestions2 = [
    {
      text: 'Quelle année sort le premier Star Wars ?',
      points: 2,
      options: [
        { text: '1975', is_correct: false },
        { text: '1977', is_correct: true },
        { text: '1980', is_correct: false },
        { text: '1983', is_correct: false },
      ]
    },
    {
      text: 'Qui réalise Pulp Fiction ?',
      points: 2,
      options: [
        { text: 'Martin Scorsese', is_correct: false },
        { text: 'Steven Spielberg', is_correct: false },
        { text: 'Quentin Tarantino', is_correct: true },
        { text: 'David Fincher', is_correct: false },
      ]
    },
    {
      text: 'Dans quelle ville se déroule The Dark Knight ?',
      points: 1,
      options: [
        { text: 'Metropolis', is_correct: false },
        { text: 'New York', is_correct: false },
        { text: 'Gotham City', is_correct: true },
        { text: 'Chicago', is_correct: false },
      ]
    },
  ];

  for (let i = 0; i < qcmQuestions2.length; i++) {
    const q = await db.query(
      `INSERT INTO question (phase_id, text, points, "order") VALUES ($1, $2, $3, $4) RETURNING id`,
      [phase4Id, qcmQuestions2[i].text, qcmQuestions2[i].points, i + 1]
    );
    for (let opt of qcmQuestions2[i].options) {
      await db.query(
        `INSERT INTO answer_option (question_id, text, is_correct) VALUES ($1, $2, $3)`,
        [q.rows[0].id, opt.text, opt.is_correct]
      );
    }
  }

  // ─────────────────────────────────────────
  // QUIZ 3 : Sport
  // ─────────────────────────────────────────
  const quiz3 = await db.query(
    `INSERT INTO quiz (title, description) VALUES ($1, $2) RETURNING id`,
    ['Sport', 'Football, tennis, JO et plus']
  );
  const quiz3Id = quiz3.rows[0].id;

  const phase5 = await db.query(
    `INSERT INTO phase (quiz_id, title, "order", type) VALUES ($1, $2, $3, $4) RETURNING id`,
    [quiz3Id, 'Buzz sport', 1, 'buzz']
  );
  const phase5Id = phase5.rows[0].id;

  const phase6 = await db.query(
    `INSERT INTO phase (quiz_id, title, "order", type) VALUES ($1, $2, $3, $4) RETURNING id`,
    [quiz3Id, 'QCM sport', 2, 'all_answer']
  );
  const phase6Id = phase6.rows[0].id;

  const buzzQuestions3 = [
    { text: 'Dans quel sport utilise-t-on un volant ?', points: 1 },
    { text: 'Combien de sets dans un match de tennis en Grand Chelem masculin ?', points: 2 },
    { text: 'Quel pays a remporté la Coupe du Monde 2018 ?', points: 2 },
    { text: 'Quel athlète détient le record du 100m ?', points: 2 },
  ];

  for (let i = 0; i < buzzQuestions3.length; i++) {
    await db.query(
      `INSERT INTO question (phase_id, text, points, "order") VALUES ($1, $2, $3, $4)`,
      [phase5Id, buzzQuestions3[i].text, buzzQuestions3[i].points, i + 1]
    );
  }

  const qcmQuestions3 = [
    {
      text: 'Combien de joueurs dans une équipe de basketball ?',
      points: 1,
      options: [
        { text: '4', is_correct: false },
        { text: '5', is_correct: true },
        { text: '6', is_correct: false },
        { text: '7', is_correct: false },
      ]
    },
    {
      text: 'Dans quelle ville se sont déroulés les JO d\'été 2020 ?',
      points: 2,
      options: [
        { text: 'Pékin', is_correct: false },
        { text: 'Paris', is_correct: false },
        { text: 'Tokyo', is_correct: true },
        { text: 'Londres', is_correct: false },
      ]
    },
    {
      text: 'Quel club a remporté le plus de Ligues des Champions ?',
      points: 2,
      options: [
        { text: 'FC Barcelone', is_correct: false },
        { text: 'Bayern Munich', is_correct: false },
        { text: 'AC Milan', is_correct: false },
        { text: 'Real Madrid', is_correct: true },
      ]
    },
    {
      text: 'Quelle surface est utilisée à Roland-Garros ?',
      points: 1,
      options: [
        { text: 'Gazon', is_correct: false },
        { text: 'Dur', is_correct: false },
        { text: 'Terre battue', is_correct: true },
        { text: 'Moquette', is_correct: false },
      ]
    },
  ];

  for (let i = 0; i < qcmQuestions3.length; i++) {
    const q = await db.query(
      `INSERT INTO question (phase_id, text, points, "order") VALUES ($1, $2, $3, $4) RETURNING id`,
      [phase6Id, qcmQuestions3[i].text, qcmQuestions3[i].points, i + 1]
    );
    for (let opt of qcmQuestions3[i].options) {
      await db.query(
        `INSERT INTO answer_option (question_id, text, is_correct) VALUES ($1, $2, $3)`,
        [q.rows[0].id, opt.text, opt.is_correct]
      );
    }
  }

  console.log('✅ Seeding terminé — 3 quiz insérés');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erreur pendant le seeding:', err);
  process.exit(1);
});