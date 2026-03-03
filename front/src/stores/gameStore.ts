import { defineStore } from "pinia";
import api from "../services/api";
import socket from "../services/socket";

export const useGameStore = defineStore("game", {
  state: () => ({
    room: null as any,
    player: null as any,
    players: [] as any[],
    phases: [] as any[],
    currentPhase: null as any,
    currentQuestion: null as any,
    buzzedPlayer: null as any,
    answers: [] as any[],
    status: "idle" as "idle" | "waiting" | "in_progress" | "finished",
    questionResolved: false as boolean,
    answerResult: null as { isCorrect: boolean; points: number } | null,
    resultsRevealed: false as boolean,
    playedQuestions: [] as number[],
  }),

  actions: {
    async createRoom(quiz_id: number) {
      const res = await api.post("/room", { quiz_id });
      this.room = res.data;
      return res.data;
    },

    async joinRoom(code: string, name: string) {
      const res = await api.post(`/room/${code}/join`, { name });
      this.player = res.data.player;
      this.room = res.data.room;
      return res.data;
    },

    connectSocket(roomCode: string) {
      socket.connect();
      this._loadPlayedQuestions(roomCode);

      socket.off("room:players_updated");
      socket.off("game:started");
      socket.off("game:question");
      socket.off("game:buzzed");
      socket.off("game:buzz_reset");
      socket.off("game:question_resolved");
      socket.off("game:answer_received");
      socket.off("game:all_answered");
      socket.off("game:finished");
      socket.off("game:answer_result");
      socket.off("game:results_revealed");

      socket.emit("room:join", {
        roomCode,
        playerId: this.player?.id ?? null,
      });

      socket.on("room:players_updated", (players: any[]) => {
        this.players = players;
      });

      socket.on("game:started", ({ phases }: any) => {
        this.playedQuestions = [];
        this._clearPlayedQuestions(roomCode);
        this.phases = phases;
        this.status = "in_progress";
        this.currentPhase = null;
        this.currentQuestion = null;
        this.playedQuestions = [];

        for (const phase of phases) {
          if (phase.questions && phase.questions.length > 0) {
            this.currentPhase = phase;
            break;
          }
        }
      });

      socket.on("game:question", ({ phaseId, questionId }: any) => {
        const phase = this.phases.find((p) => p.id === phaseId);
        if (phase) {
          this.currentPhase = phase;
          this.currentQuestion = phase.questions.find(
            (q: any) => q.id === questionId,
          );
          this.buzzedPlayer = null;
          this.answers = [];
          this.questionResolved = false;
          this.answerResult = null;
          this.resultsRevealed = false;
          if (!this.playedQuestions.includes(questionId)) {
            this.playedQuestions.push(questionId);
            this._savePlayedQuestions(roomCode);
          }
        }
      });

      socket.on("game:question_resolved", () => {
        this.questionResolved = true;
        this.buzzedPlayer = null;
      });

      socket.on("game:buzzed", ({ player }: any) => {
        this.buzzedPlayer = player;
      });

      socket.on("game:buzz_reset", () => {
        this.buzzedPlayer = null;
      });

      socket.on("game:answer_received", (answer: any) => {
        this.answers.push(answer);
      });

      socket.on("game:all_answered", () => {
        console.log("Tout le monde a répondu");
      });

      socket.on("game:answer_result", ({ isCorrect, points }: any) => {
        this.answerResult = { isCorrect, points };
      });

      socket.on("game:results_revealed", () => {
        this.resultsRevealed = true;
      });

      socket.on("game:finished", ({ leaderboard }: any) => {
        this.players = leaderboard;
        this.status = "finished";
        this._clearPlayedQuestions(roomCode);
      });
    },

    disconnectSocket() {
      socket.disconnect();
    },

    startGame(roomCode: string) {
      socket.emit("game:start", { roomCode });
    },

    nextQuestion(roomCode: string, phaseId: number, questionId: number) {
      socket.emit("game:next_question", { roomCode, phaseId, questionId });
    },

    buzz(roomCode: string, playerId: number) {
      socket.emit("game:buzz", { roomCode, playerId });
    },

    resetBuzz(roomCode: string) {
      socket.emit("game:buzz_reset", { roomCode });
    },

    resolveQuestion(roomCode: string) {
      socket.emit("game:question_resolved", { roomCode });
    },

    sendAnswer(
      roomCode: string,
      playerId: number,
      questionId: number,
      answer: string,
    ) {
      socket.emit("game:answer", { roomCode, playerId, questionId, answer });
    },

    awardPoints(
      roomCode: string,
      playerId: number,
      questionId: number,
      points: number,
    ) {
      socket.emit("game:award_points", {
        roomCode,
        playerId,
        questionId,
        points,
      });
    },

    revealResults(roomCode: string, questionId: number) {
      socket.emit("game:reveal_results", { roomCode, questionId });
      console.log("socket Emit");
    },

    _savePlayedQuestions(roomCode: string) {
      localStorage.setItem(
        `played_${roomCode}`,
        JSON.stringify(this.playedQuestions),
      );
    },

    _loadPlayedQuestions(roomCode: string) {
      const saved = localStorage.getItem(`played_${roomCode}`);
      this.playedQuestions = saved ? JSON.parse(saved) : [];
    },

    _clearPlayedQuestions(roomCode: string) {
      localStorage.removeItem(`played_${roomCode}`);
    },

    endGame(roomCode: string) {
      socket.emit("game:end", { roomCode });
    },
  },
});
