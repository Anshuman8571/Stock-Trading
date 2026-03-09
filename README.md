<div align="center">
  <h1>📈 AI-Powered Stock Trading Platform</h1>
  <p>
    <strong>A robust, full-stack stock trading simulator with integrated GenAI agents, real-time market data extraction, and asynchronous order processing.</strong>
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#testing">Testing</a>
  </p>
</div>

---

## 📖 Overview

This project is a comprehensive full-stack stock trading platform designed to simulate real-world trading environments. It allows users to manage their portfolios, place market and limit orders, and interact with an integrated AI agent. The AI agent, powered by Google Generative AI (Gemini) and LangChain, acts as a financial assistant—analyzing stock trends by dynamically fetching live data and answering specific queries about the user's portfolio.

## ✨ Features

### 🏦 Trading & Order Management
* **Market Orders:** Instantly buy or sell stocks at the current market price.
* **Limit Orders:** Set price targets for buying or selling. Orders are queued and processed asynchronously in the background when the target price is hit.
* **Portfolio Tracking:** Real-time visibility into current holdings, cash balance, and overall portfolio performance.

### 🤖 AI Financial Assistant (GenAI integration)
* **Portfolio Analysis:** Ask the AI questions regarding your current holdings and get context-aware answers.
* **Live Market Intelligence:** Uses integrated web-scraping (Cheerio) combined with LangChain agents to pull live stock data and news, providing up-to-date analysis and recommendations.

### ⚙️ Robust System Design
* **Asynchronous Processing:** Powered by Redis and BullMQ to handle limit orders efficiently without blocking the main event loop.
* **Containerized Environment:** Fully dockerized services for frictionless setup, deployment, and scaling across different environments.
* **Secure Authentication:** JWT-based authentication combined with secure cookie management and password hashing (Bcrypt).

---

## 🏗 Architecture

The platform is divided into three primary tiers:

1.  **Client Tier (Frontend):** A responsive Single Page Application (SPA) built with React and Vite. State is managed deterministically via Zustand, and routing via React Router.
2.  **Application Tier (Backend):** A Node.js and Express.js REST API. It handles business logic, portfolio management, AI routing, and API endpoint security.
3.  **Data & Worker Tier:**
    *   **PostgreSQL:** The primary relational database for persistent storage (Users, Orders, Portfolios).
    *   **Redis:** In-memory data store used for caching and managing the BullMQ job queues.
    *   **Background Workers:** Separate Node.js processes dedicated to polling and executing limit orders off the main thread.

---

## 🛠 Tech Stack

### Frontend
*   **Framework:** React 18, Vite
*   **State Management:** Zustand
*   **Styling:** Tailwind CSS
*   **Testing:** Vitest, React Testing Library, Jest DOM

### Backend
*   **Framework:** Node.js, Express.js
*   **Database ORM/Driver:** `pg` (PostgreSQL)
*   **Queues & Caching:** BullMQ, Redis
*   **AI Integration:** `@google/generative-ai`, `@langchain/google-genai`, LangGraph
*   **Testing:** Jest, Supertest

### Infrastructure
*   **Containers:** Docker, Docker Compose

---

## 🚀 Getting Started

Follow these steps to get a local development environment up and running.

### Prerequisites
*   [Docker Desktop](https://docs.docker.com/get-docker/) installed and running.
*   [Node.js](https://nodejs.org/) (v18 or higher) installed locally if developing outside containers.
*   A Google Gemini API Key.
*   *(Optional)* A Google OAuth Client ID if using Google SSO.

### 1. Clone the repository
\`\`\`bash
git clone <your-repository-url>
cd Stock-Trading
\`\`\`

### 2. Environment Configuration
You need to configure the environment variables for both the backend and frontend.

**Backend Configuration:**
Create a `.env.docker` file in the `Backend/` directory:
\`\`\`env
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=stock-trading
DATABASE_URL=postgres://postgres:your_secure_password@postgres:5432/stock-trading

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# AI & Authentication Configuration
GOOGLE_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
\`\`\`

**Frontend Configuration:**
Create a `.env` file in the `frontend/` directory:
\`\`\`env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
\`\`\`

### 3. Spin up the Infrastructure
The provided `docker-compose.yml` orchestrates the Database, Redis Cache, API Backend, Background Workers, and the Frontend.

\`\`\`bash
# Build and start all containers in detached mode
docker compose up --build -d
\`\`\`

**Access Points:**
*   **Frontend UI:** [http://localhost:5173](http://localhost:5173)
*   **Backend API:** [http://localhost:3000](http://localhost:3000)
*   **PostgreSQL DB:** `localhost:5432`

---

## 🧪 Testing and Quality Assurance

The repository maintains strict testing standards to ensure transaction reliability and accurate UI state representations.

### Backend Testing (Jest & Supertest)
Backend tests are designed to mock database and Redis connections to test API flows and logic independently.
\`\`\`bash
cd Backend
npm install
npm run test
\`\`\`
*(Developer Note: Ensure connections are cleanly closed in `afterAll` hooks to prevent open handle memory leaks in Jest.)*

### Frontend Testing (React Testing Library)
Frontend integration tests validate user journeys (e.g., placing orders, logging in). 
\`\`\`bash
cd frontend
npm install
npm run test
\`\`\`
*(Developer Note: When writing tests involving Zustand, remember to utilize localized mock stores to prevent state pollution across distinct test suites. State updates must be wrapped in `act(...)` blocks.)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the [issues page](https://github.com/your-username/Stock-Trading/issues) if you want to contribute.

## 📝 License

This project is open-source and available under the **ISC License**.
