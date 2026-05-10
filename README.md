#  ZNU Academic Portal

Welcome to the ZNU Academic Portal! This project is a full-stack web application designed to manage university student accounts, doctors, courses, timetables, and quizzes. 

The application is fully containerized using Docker, making it incredibly easy to set up and run on any operating system without worrying about installing dependencies like Node.js or PostgreSQL locally.

---

##  Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **[Git](https://git-scm.com/downloads)** (To clone the repository)
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Must be running in the background)
3. **Make** *(Optional but recommended)*
   - **Mac/Linux:** Usually pre-installed.
   - **Windows:** Recommended to use WSL2 (Ubuntu) which has `make` pre-installed.

---

##  Getting Started

Follow these steps to get your local development environment up and running.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/academic-portal.git
cd academic-portal
```

### 2. Setup Environment Variables
The project requires environment variables to securely store database credentials, API keys, and port configurations.

#### For Linux / Mac / Windows (WSL2):
Run the automated setup command. This will copy all `.env.example` templates into `.env` files.
```bash
make setup
```

#### For Windows (PowerShell without Make):
If you don't have `make` installed, copy the files manually:
```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

** Important:** Open the newly created `.env` files (in the root, `backend/`, and `frontend/` folders) and fill in your actual passwords and API keys (like your Supabase keys, JWT secret, etc.).

### 3. Start the Application

Start the containers, build the images, and automatically download all `npm` dependencies inside the container.

#### For Linux / Mac / Windows (WSL2):
```bash
sudo make dev
```
*(You may omit `sudo` depending on your Docker permission setup).*

#### For Windows (PowerShell without Make):
```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

##  Database Initialization

You **do not** need to manually create tables or insert schemas!
On the very first run, Docker will detect that the PostgreSQL database is empty and will automatically execute the `schema.sql` file to build the entire database structure for you. 

---

##  Accessing the Portal

Once the terminal says that the frontend and backend are running, open your browser:

- **Frontend (Student & Doctor Portals):** [http://localhost:5173](http://localhost:5173)
- **Backend API Base URL:** [http://localhost:5000/api](http://localhost:5000/api)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

##  Useful Commands (Makefile)

If you are using Mac/Linux/WSL, we provide a handy `Makefile` to simplify common tasks:

- `make dev` : Starts the development environment (with hot-reloading).
- `make prod` : Starts the production-ready environment.
- `make stop` : Stops all running containers.
- `make clean` : Stops containers AND deletes the database volumes (⚠️ Wipes all data).
- `make logs` : Displays real-time logs for all services.
- `make db-shell` : Opens an interactive PostgreSQL shell inside the container.
- `make build` : Forces a rebuild of the Docker images.

*To see all available commands, just type `make` or `make help` in your terminal.*

---

## Architecture Stack

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose
- **Authentication:** JWT, Supabase, Google/Microsoft OAuth

