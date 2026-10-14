# TaskFlow — Collaborative Task Manager

A full-stack task management application built with the MERN stack, designed to help users organize tasks, collaborate with team members, and break down work using AI-powered subtask generation.

## Overview

TaskFlow is a collaborative workspace where users can manage personal tasks, assign work to team members, track deadlines, and communicate with other users. The application combines task management, real-time communication, and AI-assisted productivity features in a single interface.

## Features

### Authentication & User Management
- User registration and login.
- JWT-based authentication using HTTP cookies.
- Protected routes for authenticated users.
- Username setup and user profile management.
- Persistent authentication state and user information retrieval.

### Task Management
- Create and edit tasks.
- Add task titles and descriptions.
- Set priorities: Low, Medium, and High.
- Assign tasks to users and collaborators.
- Set due dates and track upcoming deadlines.
- Create subtasks and track their completion.
- View task status and workload statistics.
- Organize work through My Tasks, Team Tasks, and Shared Tasks.
- View detailed task information.

### Collaboration & Communication
- Assign tasks to team members.
- Select collaborators when creating tasks.
- View tasks based on ownership and assignment.
- Communicate with other users through the chat functionality.
- View collaborator information, including usernames and profile pictures.

### AI-Powered Productivity
- Generate subtasks using AI to break down larger tasks into manageable steps.
- Integrate AI-assisted workflows into task creation.

### Dashboard & User Interface
- Task overview dashboard with workload statistics.
- Task status summaries for completed, in-progress, and overdue work.
- Priority breakdown and upcoming deadline sections.
- Responsive interface with sidebar navigation.
- Modal-based task creation and form validation.
- Toast notifications for success and error feedback.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| State Management | React Hooks, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT), HTTP cookies |
| Real-Time Communication | Socket.IO |
| AI Integration | Groq AI / LLM integration |
| Automated Testing | Playwright |
| Load Testing | k6 |
| Version Control | Git, GitHub |
| Deployment | Vercel, Render |

## Architecture

The application follows a client-server architecture.

```text
React Frontend
      |
      | REST API Requests
      | HTTP Cookies / JWT
      v
Node.js + Express.js Backend
      |
      +------ MongoDB
      |
      +------ AI API
      |
      +------ Socket.IO
               |
               +------ Real-time user communication
```

- **React frontend:** Renders the interface, manages application state, and communicates with the backend.
- **Express backend:** Handles authentication, task operations, and REST API requests.
- **MongoDB:** Persists user and task data.
- **Socket.IO:** Supports real-time communication between connected users.
- **AI integration:** Generates task subtasks to support task planning.

## Testing

### Playwright — End-to-End Testing

Automated browser tests have been developed to validate important application workflows.

| Test | Status |
|---|---|
| User signup and username setup | Passed |
| Invalid login error handling | Passed |
| Redirect unauthenticated users away from the homepage | Passed |
| Login API response | Passed |
| Task creation API response | HTTP 200 verified |
| Task appears in the UI after creation | Pending verification |

The task-creation workflow is still being verified to ensure that a successfully saved task appears in the correct task list without requiring a manual page refresh.

Run the Playwright tests from the frontend directory:

```bash
npx playwright test
```

Run a specific test in Chromium:

```bash
npx playwright test tests/task.spec.js --project=chromium
```

View the HTML test report:

```bash
npx playwright show-report
```

### k6 — Load Testing

The backend has been tested locally under different virtual-user loads to observe request behavior and resource usage.

Test configurations included:
- 10 virtual users for 30 seconds.
- 25 virtual users for 1 minute.
- 50 virtual users for 90 seconds.
- 100 virtual users for 2 minutes.
- 150 virtual users for 90 seconds.

These experiments helped explore application behavior under concurrent load. They do not establish a production capacity limit or guarantee performance under real-world traffic.

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB or a MongoDB connection URI
- Git
- Required AI API credentials for AI-powered features

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Task-manager-new
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Configure the backend environment variables in a `.env` file. Use the variable names expected by your backend code.

Typical configuration includes:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

If your code uses different variable names or an alternative AI provider, use the names required by your implementation.

**Security:** Never commit `.env` files, database credentials, JWT secrets, or API keys to GitHub.

Start the backend using the script configured in `backend/package.json`, for example:

```bash
npm run dev
```

### 3. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend API base URL to point to your backend, such as `http://localhost:5000`, using the environment variable or configuration expected by your `getBaseURL()` utility.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

### 4. Verify the application

1. Register a user account.
2. Complete username setup.
3. Log in and open the workspace.
4. Create a task and configure its priority, deadline, or assignees.
5. Test AI-powered subtask generation.
6. Test communication with another user.
7. Run the Playwright tests to verify the supported workflows.

## Project Goals

This project demonstrates practical full-stack development skills, including:

- Building REST APIs with Node.js and Express.js.
- Designing and querying MongoDB data models.
- Implementing cookie-based JWT authentication.
- Managing frontend state with React Hooks and Context API.
- Integrating AI capabilities into a productivity application.
- Implementing real-time user communication with Socket.IO.
- Writing browser automation tests with Playwright.
- Exploring backend behavior under concurrent load with k6.
- Managing source code and deployment workflows using Git and GitHub.

## Future Improvements

- Expand automated tests for task creation, editing, deletion, and assignment.
- Verify that task lists refresh immediately after successful creation.
- Add more comprehensive authorization and cross-user access tests.
- Expand real-time chat tests and message-history validation.
- Establish repeatable load-test scenarios with defined performance thresholds.
- Improve continuous integration with automated test execution.

## License

Add a license file if you intend to distribute this project as open source.
