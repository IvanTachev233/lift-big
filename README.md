# Lift Big - Workout Tracker

A web application for creating weightlifting programs and tracking workout progress, built with a Django REST backend and a React/TypeScript frontend.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

* **Python:** Version 3.10 or higher. ([Download Python](https://www.python.org/downloads/))
* **pip:** Python package installer (usually comes with Python).
* **Node.js:** Version 18 or higher (which includes npm). ([Download Node.js](https://nodejs.org/))

## Project Structure

The project is organized into two main directories:

* `/backend`: Contains the Django REST Framework API server.
* `/frontend`: Contains the React + TypeScript client application built with Vite.

## Local Development Setup

Follow these steps to get the project running on your local machine.

### Backend (Django) Setup

1.  **Navigate to Backend Directory:**
    ```bash
    cd backend
    ```

2.  **Create and Activate Virtual Environment:**
    * Create the environment (only needed once):
        ```bash
        python -m venv venv
        ```
    * Activate the environment:
        * macOS / Linux: `source venv/bin/activate`
        * Windows (cmd): `.\venv\Scripts\activate`
        * Windows (PowerShell): `.\venv\Scripts\Activate.ps1` (You might need to adjust Execution Policy)

3.  **Install Dependencies:**
    * Install requirements:
        ```bash
        pip install -r requirements.txt
        ```

4.  **Set Up Environment Variables:**
    * Create a `.env` file in the `backend` directory (alongside `manage.py`).
    * Copy the contents from `.env.example` and populate with your data

5.  **Run Database Migrations:** Apply the database schema changes:
    ```bash
    python manage.py migrate
    ```

6.  **Create Superuser (Admin):** Create an admin account to access the Django Admin interface:
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts to set a username, email (optional), and password.

### Frontend (React + TypeScript) Setup

1.  **Navigate to Frontend Directory:**
    * From the project root:
        ```bash
        cd frontend
        ```
    * Or from the `backend` directory:
        ```bash
        cd ../frontend
        ```

2.  **Install Dependencies:**
    * Using npm:
        ```bash
        npm install
        ```
    * Or using Yarn:
        ```bash
        yarn install
        ```

3.  **Set Up Environment Variables:**
    * Create a `.env` file in the `frontend` directory (alongside `package.json`).
    * Add the following variable (prefix depends on your build tool - Vite shown):
        ```dotenv
        # frontend/.env
        VITE_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
        ```
        *(If using Create React App, use `REACT_APP_API_URL=http://127.0.0.1:8000/api`)*

## Running the Application

You need to run both the backend and frontend development servers simultaneously.

1.  **Run Backend Server:**
    * Open a terminal window.
    * Navigate to the `backend` directory.
    * Activate the virtual environment (`source venv/bin/activate` or equivalent).
    * Start the Django development server:
        ```bash
        python manage.py runserver
        ```
    * The backend API will usually be running at `http://127.0.0.1:8000/`.

2.  **Run Frontend Server:**
    * Open a **separate** terminal window.
    * Navigate to the `frontend` directory.
    * Start the React development server:
        * Using npm: `npm run dev` (for Vite) or `npm start` (for CRA)
        * Using Yarn: `yarn dev` (for Vite) or `yarn start` (for CRA)
    * The frontend app will usually be running at `http://localhost:5173` (Vite default) or `http://localhost:3000` (CRA default).

3.  **Access the App:** Open your web browser and navigate to the **frontend URL** (e.g., `http://localhost:5173`). The React app will load and make calls to the backend API running on port 8000.

### One-Command Dev Environment (Optional)

If you are tired of opening two terminals, you can start both servers with the helper script in the project root:

```bash
# from the repository root
./dev.sh
```

The script will:

* activate `backend/venv` and launch `python manage.py runserver`
* start the Vite dev server from the `frontend` directory (chooses npm/yarn/pnpm automatically)
* stop both processes when you press `Ctrl+C`

Ensure you have already created the backend virtual environment (`backend/venv`) and installed frontend dependencies.  
You can override defaults when needed, for example:

```bash
FRONTEND_DEV_CMD="npm run dev -- --host 0.0.0.0" BACKEND_VENV_DIR="$HOME/.venvs/django" ./dev.sh
```

### Docker Dev Environment (Optional)

Prefer containers? The repository ships with `docker-compose.yml` that mirrors the local workflow.

1. Make sure Docker Desktop (or another Docker engine) is running.
2. Copy backend environment variables:
   ```bash
   cp backend/.env.example backend/.env  # then edit values as needed
   ```
   Optionally set `VITE_API_URL` in the root `.env` (defaults to `http://localhost:8000/api`).
3. Build and start both services:
   ```bash
   docker compose up --build
   ```
   * Backend available at `http://localhost:8000` (auto-migrates on start, hot reload via `runserver`).
   * Frontend available at `http://localhost:5173` with Vite HMR (file changes picked up thanks to bind mounts).
4. Stop everything with `Ctrl+C` (foreground) or `docker compose down`.

Need to run management commands in the container?

```bash
docker compose exec backend python manage.py createsuperuser
```

## Running Tests

### Backend Tests

1.  Navigate to the `backend` directory.
2.  Activate the virtual environment.
3.  Run the tests for a specific app (e.g., `core`):
    ```bash
    python manage.py test core
    ```
    Or run all tests:
    ```bash
    python manage.py test
    ```

## Database

* By default, the local development setup uses SQLite. The database file (`db.sqlite3`) will be created in the `backend` directory after running `migrate`. This file should be listed in your `.gitignore`.
* To apply schema changes based on model updates, run `python manage.py makemigrations <app_name>` followed by `python manage.py migrate` in the `backend` directory. Remember to commit the generated migration files.
