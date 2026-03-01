# 🎯 Quiz App

Application de quiz multijoueur en temps réel. Un admin crée et anime des quiz, les joueurs rejoignent via un code de room et s'affrontent en direct.

## Stack

- **Back** : Node.js, Express, Socket.io, PostgreSQL
- **Front** : Vue 3, TypeScript, Vite, Pinia

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
git clone https://github.com/ton-user/quiz-app.git
cd quiz-app
npm install
cd back && npm install
cd ../front && npm install
```

Créer la base de données et les tables :

```bash
psql -U postgres -c "CREATE DATABASE quiz_app;"
psql -U postgres -d quiz_app -f back/schema.sql
```

Créer `back/.env` :

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=ton_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiz_app
```

Lancer :

```bash
npm run dev
```

- Back : http://localhost:3000
- Front : http://localhost:5173

## Utilisation

1. Créer un quiz sur `/admin` (phases + questions)
2. Lancer une room → partager le code aux joueurs
3. Les joueurs rejoignent sur `/join`
4. L'admin anime le quiz en temps réel

## TODO

- [ ] Authentification admin
- [ ] Timer automatique
- [ ] Reconnexion en cours de partie
- [ ] PWA mobile
