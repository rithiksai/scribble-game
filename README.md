# Skribbl.in - Multiplayer Drawing & Guessing Game


**Live Demo:** [https://skribbl.in](https://skribbl.in)

A real-time multiplayer drawing and guessing game where players take turns drawing a word while others try to guess it. Similar to Pictionary but on the web!

## 🎮 Features

- **Real-time Drawing Canvas**: Share your artistic creations instantly with all players
- **Turn-based Gameplay**: Players rotate as the drawer, keeping gameplay fresh and engaging
- **Word Hints**: Letter count hints help players make educated guesses
- **Timed Rounds**: Race against the clock to guess the word
- **Score System**: Earn points based on how quickly you guess correctly
- **Live Chat**: Guess words through an integrated chat system
- **Room Creation**: Create private rooms to play with friends
- **Responsive Design**: Play on desktop or mobile devices

## 🛠️ Technologies Used

### Frontend
- React.js
- Socket.io Client
- HTML5 Canvas API
- React Router
- CSS3

### Backend
- Node.js
- Express
- Socket.io
- RESTful API

### Deployment
- Heroku (Backend)
- Vercel (Frontend)
- GoDaddy (Domain)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Local Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/skribbl-game.git
   cd skribbl-game
   ```

2. Install dependencies for the server
   ```bash
   cd server
   npm install
   ```

3. Install dependencies for the client
   ```bash
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory
   ```
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

5. Create a `.env` file in the client directory
   ```
   REACT_APP_SOCKET_SERVER=http://localhost:5000
   ```

6. Start the development environment
   ```bash
   # In the server directory
   npm run dev
   
   # In a separate terminal, in the client directory
   npm start
   ```

7. Visit `http://localhost:3000` in your browser

## 🎨 How to Play

1. **Enter a Username**: Start by entering a username on the home page
2. **Join or Create a Room**: Either create a new game room or join an existing one
3. **Wait for Players**: At least 2 players are needed to start the game
4. **Drawing Turn**: When it's your turn to draw, you'll be given a word to illustrate
5. **Guessing**: When others are drawing, type your guesses in the chat
6. **Scoring**: Earn points based on how quickly you guess correctly. The drawer also earns points when others guess correctly
7. **Rounds**: After each round, a new player takes the role of drawer

## 📂 Project Structure

```
skribbl-game/
├── client/             # React frontend
│   ├── public/
│   └── src/
│       ├── components/ # UI components
│       ├── context/    # Context providers
│       └── pages/      # Page components
└── server/             # Node.js backend
    ├── index.js        # Main server file
    └── ...
```

## 🌐 Deployment

The application is deployed using the following setup:

- **Backend**: Hosted on Heroku
- **Frontend**: Deployed on Vercel
- **Domain**: Custom domain (skribbl.in) configured through GoDaddy

## 🔮 Future Improvements

- [ ] User authentication
- [ ] Custom word lists
- [ ] Persistent leaderboards
- [ ] More drawing tools
- [ ] Game history
- [ ] Team mode
- [ ] Mobile app version

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by games like Pictionary and skribbl.io
- Thanks to all contributors who have helped with the project
- Special thanks to the open-source community for the awesome tools and libraries

---

Built with ❤️ by [Rithik Sai]

Feel free to contribute to this project by submitting issues or pull requests!
