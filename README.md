# 🪔 Modak Masti (मोदक मस्ती) - Ganesh Chaturthi Festival Arcade

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An immersive, fast-paced festive arcade game celebrating **Ganesh Chaturthi**. Guide Lord Ganesha's sacred thali / Mushakraj to catch falling blessed modaks, build high-voltage combo chains, dodge festive hazards, trigger **Modak Fever**, and climb the real-time campus & global leaderboards!

---

## 🌟 Game Highlights

- 🪔 **Festive Arcade Action**: High-performance 60 FPS physics engine responsive to touch swipes, mouse movement, and keyboard arrow controls.
- 🟡 **Varied Blessed Treats**:
  - **Normal Modak**: Standard sweet offering (+10 pts)
  - **Golden Modak**: Shimmering golden blessing (+50 pts & audio fanfare)
  - **Diamond Modak**: Ultra-rare celestial treat (+100 pts & instant fever boost)
- ⚡ **Modak Fever Mode**: Catch consecutive sweets without dropping to trigger explosive Modak Fever with screen effects, golden modak rain, and 2x combo multiplier!
- 💣 **Hazards & Obstacles**: Dodge firecrackers, spoiled sweets, and tumbling brass bells to protect your score and lives.
- 🏆 **Campus & Global Leaderboards**:
  - Real-time score synchronization powered by **Google Firebase Firestore**
  - Multi-tab filtering: **Global All-Time**, **My Campus / College**, and **Today's Best**
  - Offline-first fallback with local score persistence
- 🎖️ **Achievements System**: Unlock badges for milestone catches, survival times, fever triggers, and flawless runs.
- 🔔 **Procedural Audio Synthesizer**: Native Web Audio API soundscapes featuring authentic temple bells, harmonized chimes, and festive celebration melodies (with mute toggle).
- 📱 **Fully Responsive**: Optimized for smartphones, tablets, and desktop displays with touch dragging and haptic feedback.

---

## 🎮 How to Play

### Controls
| Control Type | Action |
| :--- | :--- |
| **Touch / Mobile** | Drag finger or swipe horizontally across the screen |
| **Mouse (Desktop)** | Move the cursor left and right across the game board |
| **Keyboard** | Press `←` (Left Arrow) or `A` / `→` (Right Arrow) or `D` |
| **Audio Toggle** | Click the speaker icon in the top header to mute/unmute |

### Scoring & Multipliers
- **Base Score**:
  - Normal Modak: `10 × Combo Multiplier`
  - Golden Modak: `50 × Combo Multiplier`
  - Diamond Modak: `100 × Combo Multiplier`
- **Combo System**: Every consecutive catch adds to your combo meter (up to 5x multiplier). Dropping a modak or hitting a hazard resets your combo!
- **Modak Fever**: Filling the devotion meter launches 10 seconds of pure golden modak rain with zero penalty drops!

---

## 🛠️ Tech Stack & Architecture

- **UI & Game Loop**: React 19, TypeScript, HTML5 Canvas 2D engine
- **Styling & Motion**: Tailwind CSS v4, Motion (Framer Motion)
- **Database**: Google Firebase Firestore (Collections: `leaderboard`, `player_profiles`)
- **Sound Engine**: Web Audio API (zero external audio asset latency)
- **Effects**: `canvas-confetti` celebration particles
- **Build Tooling**: Vite 6, TSX, Node.js

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/uniquemaheshyadav/modak-masti.git
   cd modak-masti
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the URL displayed in the terminal) to play!

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled assets will be in the `dist/` directory ready for deployment.

---

## 🔥 Firebase Configuration (Optional)

The application automatically supports persistent leaderboards via Firebase Firestore. If you wish to connect your own Firebase project:

1. Create a Firebase project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Cloud Firestore** in test mode or with security rules.
3. Configure your project parameters in `firebase-applet-config.json` or `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_DATABASE_ID=your_database_id
   ```

---

## 📁 Project Structure

```text
├── index.html                 # HTML Entry point with SEO and festival metadata
├── metadata.json              # Applet specifications and metadata
├── firestore.rules            # Firestore security rules for leaderboard
├── firebase-blueprint.json    # Firestore schema definition
├── src/
│   ├── main.tsx               # React mount root
│   ├── App.tsx                # Main application state orchestrator
│   ├── types.ts               # TypeScript data interfaces (Scores, Profiles, Achievements)
│   ├── components/
│   │   ├── ModakCatchGame.tsx # Core game screen and canvas interaction
│   │   ├── PlatformHeader.tsx # Top navigation bar, volume, profile & leaderboard
│   │   ├── StartScreen.tsx    # Festive hero start screen with character & stats
│   │   ├── GameOverModal.tsx  # Game over breakdown, score share & replay
│   │   ├── LeaderboardModal.tsx # Global and campus leaderboard rankings
│   │   ├── ProfileModal.tsx   # Player name, roll number, and campus settings
│   │   ├── AchievementsModal.tsx # Trophy cabinet and achievement badges
│   │   └── HowToPlayModal.tsx # Quick rules and instructions popup
│   ├── game/
│   │   └── gameEngine.ts      # 60 FPS physics, particle systems, spawner & collisions
│   └── services/
│       ├── firebase.ts        # Cloud Firestore sync and score submissions
│       ├── sound.ts           # Web Audio API synthesizers for bells & chimes
│       └── storage.ts         # Local validation, roll number checks, and cached stats
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <b>गणपती बाप्पा मोरया! मंगलमूर्ती मोरया! 🪔</b><br/>
  <i>Wishing you happiness, wisdom, and festive joy this Ganesh Chaturthi.</i>
</div>
