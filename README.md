# 🧠 StudBud AI

Welcome to **StudBud AI** - your privacy-first, fully offline, and insanely smart AI Study Companion. 

Built with React and Vite, StudBud AI runs entirely in your browser. Thanks to cutting-edge WebGPU and WebLLM technology, the AI runs 100% locally on your machine. This means zero latency, zero subscription fees, and total privacy for your notes and questions.

## 🚀 Live Demo & Offline Installation

You don't need to build the source code to use StudBud! You can install the fully-packaged offline app directly from your browser.

**👉 [Launch StudBud AI](https://cluckpro31.github.io/studbud.ai/)**

### How to Install for Offline Desktop Use
1. Open the [Launch Link](https://cluckpro31.github.io/studbud.ai/) in **Google Chrome** or **Microsoft Edge**.
2. Look at the right side of your URL bar for the **Install** icon (a screen with a downward arrow), or click the browser menu (⋮) and select **"Install studbud.ai"**.
3. Confirm the installation.
4. **You're Done!** StudBud will now open as a standalone desktop application. It caches the AI models and the UI directly to your computer. You can disconnect from Wi-Fi entirely and the app will continue to function perfectly!

---

## 🌟 Key Features

- **Local AI Engine**: Powered by WebLLM, it downloads the model locally. Ask anything, summarize papers, or chat without an internet connection.
- **Dynamic Study Planner**: Plan your week visually. Create sessions and track your progress.
- **Analytics Hub**: Gamify your studying. Track your daily **Study Streak**, total hours studied, and earn XP points dynamically.
- **Retro Medieval Mode**: Personalize your interface. Toggle between the sleek modern dark mode and an immersive medieval pixel-art theme.
- **Privacy-First**: No data leaves your machine. Your chats, analytics, and schedules are stored locally using IndexedDB.

## 🛠️ For Developers

If you want to run the project locally or contribute:

1. Clone the repository:
   ```bash
   git clone https://github.com/Cluckpro31/studbud.ai.git
   ```
2. Navigate into the directory and install dependencies:
   ```bash
   cd studbud.ai
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## ⚙️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS, Lucide Icons, Glassmorphism UI
- **AI Integration**: `@mlc-ai/web-llm` (WebGPU)
- **Data Persistence**: `localforage` (IndexedDB)
- **Deployment**: GitHub Pages, Vite PWA Plugin
