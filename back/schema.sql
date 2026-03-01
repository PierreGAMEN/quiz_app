CREATE TABLE quiz (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE phase (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL -- 'buzz', 'written', 'all_answer', 'mcq'
);

CREATE TABLE question (
  id SERIAL PRIMARY KEY,
  phase_id INTEGER REFERENCES phase(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  "order" INTEGER NOT NULL,
  time_limit INTEGER -- en secondes, nullable
);

CREATE TABLE answer_option (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES question(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

CREATE TABLE room (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(id),
  code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'in_progress', 'finished'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE player (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES room(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  score INTEGER DEFAULT 0
);

CREATE TABLE player_answer (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES player(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES question(id),
  answer TEXT,
  is_correct BOOLEAN,
  points_awarded INTEGER DEFAULT 0,
  answered_at TIMESTAMP DEFAULT NOW()
);