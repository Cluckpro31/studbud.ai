# 🧠 StudBud AI - Your Offline-First Study Companion

Welcome to **StudBud AI** - a privacy-first, fully offline, and insanely smart AI Study Companion. 

Built with React and Vite, StudBud AI runs entirely in your browser. Thanks to cutting-edge WebGPU and WebLLM technology, the AI runs **100% locally on your machine**. This means zero latency, zero subscription fees, and total privacy for your notes and questions.

---

## 🎥 Demo Video (Mandatory)

**👉 [Insert Link to Demo Video Here]**
*(2–3 minutes showing the problem, solution, and on-device AI working)*

---

## 🚀 Live Demo & Offline Installation

You don't need to build the source code to use StudBud! You can install the fully-packaged offline app directly from your browser.

**👉 [Launch StudBud AI](https://cluckpro31.github.io/studbud.ai/)**

### How to Install for Offline Desktop Use
1. Open the [Launch Link](https://cluckpro31.github.io/studbud.ai/) in **Google Chrome** or **Microsoft Edge**.
2. Look at the right side of your URL bar for the **Install** icon (a screen with a downward arrow), or click the browser menu (⋮) and select **"Install studbud.ai"**.
3. Confirm the installation.
4. **You're Done!** StudBud will now open as a standalone desktop application. It caches the AI models and the UI directly to your computer. You can disconnect from Wi-Fi entirely and the app will continue to function perfectly!

---

## 📝 Sample Inputs and Expected Outputs

Once you have initialized the offline model, you can try the following prompts in the **Study Assistant** chat:

**Sample Input 1:**
> "Can you explain what a Plant Cell is based on my syllabus?"

**Expected Output 1:**
> *The AI will respond concisely, referencing the textbook data (NCERT/ICSE), and will automatically generate a visual Mermaid.js diagram illustrating the structure of a plant cell.*

**Sample Input 2:**
> "I need a study plan to cover Solid State Chemistry in 3 days."

**Expected Output 2:**
> *The AI will break down the chapter into 3 distinct, actionable days, referencing specific subtopics from the provided textbook context.*

---

## 🌟 Key Features

- **Local AI Engine**: Powered by WebLLM, it downloads the model locally. Ask anything, summarize papers, or chat without an internet connection.
- **Dynamic Study Planner**: Plan your week visually. Create sessions and track your progress.
- **Analytics Hub**: Gamify your studying. Track your daily **Study Streak**, total hours studied, and earn XP points dynamically.
- **Retro Medieval Mode**: Personalize your interface. Toggle between the sleek modern dark mode and an immersive medieval pixel-art theme.
- **Privacy-First**: No data leaves your machine. Your chats, analytics, and schedules are stored locally using IndexedDB.

---

## 🛠️ For Developers (Setup Instructions)

If you want to run the project locally, build it, or contribute:

### Dependencies
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

### 1. Clone the repository
```bash
git clone https://github.com/Cluckpro31/studbud.ai.git
cd studbud.ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser. Note: PWA Service Workers are enabled in dev mode, so you can test offline capabilities instantly!

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 📚 Technical Documentation & Architecture

For an in-depth look at how the AI model is optimized, system data flow, privacy validations, and performance benchmarks, please read our comprehensive **[ARCHITECTURE.md](./ARCHITECTURE.md)** file.

---

## ⚙️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS, Lucide Icons, Glassmorphism UI
- **AI Integration**: `@mlc-ai/web-llm` (WebGPU)
- **Data Persistence**: `localforage` (IndexedDB)
- **Deployment**: GitHub Pages, Vite PWA Plugin
