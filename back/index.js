const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
const quizRoutes = require('./routes/quiz');
const phaseRoutes = require('./routes/phase');
const questionRoutes = require('./routes/question');
const roomRoutes = require('./routes/room');

app.use('/api/quiz', quizRoutes);
app.use('/api/phase', phaseRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/room', roomRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Quiz app API is running' });
});

const socketHandler = require('./socket');
socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});