const correctMessages = [
  "Tu retombes sur tes pattes ! 🐱",
  "Parfaite réception ! 🤸‍♀️",
  "Le chat approuve 🐾",
  "Note maximale du jury ! 🏅",
  "Même le chat aurait pas trouvé aussi vite 🐱",
  "Les élèves peuvent pas en dire autant 😄",
  "Voie ouverte ! 🧗‍♀️",
  "Chipie au sommet ! 🏔️",
  "La Gom's assure 💪",
  "Prof d'EPS validé ✅",
  "Gaumardino dans la zone ! 🔥",
  "Réception parfaite, les juges se lèvent 🏅",
];

const wrongMessages = [
  "Chute ! 🧗‍♀️",
  "Le chat est déçu 🐱",
  "Même tes élèves auraient trouvé 😬",
  "Griffure ! 🐾",
  "Zéro pointé... comme un lundi matin en gym 😴",
  "Décroché de la voie 😅",
  "Le jury quitte la salle 🏃",
  "Gaumardino a glissé sur une pattoune 🐾",
  "Même le chat se cache 🙈",
  "On refera ça en cours de rattrapage 📚",
  "La Gom's a raté sa réception 😬",
  "Chipie... on t'attendait mieux 😄",
];

const buzzWonMessages = [
  "Trop lent·e ! 🐱 Les réflexes c'est en cours d'EPS 😄",
  "La Gom's a pas traîné elle ! ⚡",
  "Chipie aurait buzzé plus vite 😬",
  "Même le chat a pas vu passer la réponse 🐾",
  "Décroché avant même d'avoir commencé 🧗‍♀️",
  "Gaumardino était déjà au sommet 🏔️",
  "Trop occupé·e à caresser le chat ? 🐱",
  "Le jury note la lenteur... 🏅",
];

export function getRandomBuzzWonMessage(): string {
  return (
    buzzWonMessages[Math.floor(Math.random() * buzzWonMessages.length)] ?? ""
  );
}

export function getRandomMessage(isCorrect: boolean): string {
  const list = isCorrect ? correctMessages : wrongMessages;
  return list[Math.floor(Math.random() * list.length)] ?? "";
}
