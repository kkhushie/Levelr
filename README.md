# Levelr - Gamified AI Goal Tracker 🚀

Levelr is a gamified productivity application that turns your goals into "Quests" and "Levels" using AI. It breaks down large objectives into actionable steps, rewarding you with XP and Coins as you progress.

## ✨ Features

-   **AI-Powered Quest Generation**: Uses Google Gemini to break down goals into detailed roadmaps. 🤖
-   **Gamification**: Earn XP, coins, and badges for completing tasks. 🎮
-   **Interactive Maps**: Visualize your journey with a level-based map interface. 🗺️
-   **Detailed Task Views**: Get checklists, pro-tips, and resources for every level. 📝
-   **Secure Authentication**: User registration and login with MongoDB persistence. 🔒

## 🛠️ Tech Stack

**Frontend**:
-   React (Vite)
-   TypeScript
-   Tailwind CSS (Pastel Theme)
-   Framer Motion (Animations)
-   React Router DOM

**Backend**:
-   Node.js & Express
-   MongoDB (Mongoose)
-   Google Gemini API (AI generation)

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16+)
-   MongoDB (Running locally or Atlas URI)
-   Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/levelr.git
    cd levelr
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```env
    # AI Configuration
    GEMINI_API_KEY=your_gemini_api_key_here

    # Database Configuration
    <!-- MONGODB_URI=mongodb://localhost:27017/levelr_db -->
    # Or for Atlas: mongodb+srv://<user>:<password>@cluster.mongodb.net/test

    # Server Configuration
    PORT=5000
    ```

### Running the App

We use `concurrently` to run both the Client and Server with a single command:

```bash
npm run dev:full
```

-   **Frontend**: `http://localhost:5173`
-   **Backend**: `http://localhost:5000`

### Manual Run
If you prefer running terminals separately:

*Terminal 1 (Server):*
```bash
npm run server
```

*Terminal 2 (Client):*
```bash
npm run dev
```

## 📂 Project Structure

```
levelr/
├── components/       # React UI Components
│   ├── QuestView.tsx # Level Map
│   └── ...
├── server/           # Backend Code
│   ├── config/       # DB Connection
│   ├── models/       # Mongoose Schemas (User, Goal)
│   └── index.js      # Express Entry Point
├── services/         # Frontend API Services
└── types.ts          # TypeScript Interfaces
```

## 🤝 Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
**Level Up Your Life!** 🌟
