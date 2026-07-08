# Todo Desktop Application

A full-stack Todo application built with **React, TypeScript, Node.js, Express, MongoDB, and Electron**. The project is available as both a **web application** and a **Windows desktop application**. Users can securely register, log in, and manage their personal tasks through a clean and responsive interface.

---

## Features

- User Registration & Login
- JWT-based Authentication
- Create, Update and Delete Tasks
- Mark Tasks as Completed
- Personal Task Management
- Responsive React Frontend
- RESTful Backend API
- Electron Desktop Application
- Windows Installer (.exe)

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

### Desktop
- Electron
- Electron Builder

---

## Project Structure

```
Todo-DesktopApp/
│
├── backend/          # Express backend
│
└── frontend/
    ├── electron/     # Electron main process
    ├── src/          # React source code
    ├── public/
    ├── package.json
    └── vite.config.ts
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Todo-DesktopApp
```

### 2. Install dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the backend folder.

```env
ATLAS_PASSWORD=your_mongodb_password
JWT_SECRET=your_secret_key
PORT=5000
```

---

## Running the Project

### Start Backend

```bash
cd backend
npm run dev
```

### Start React Frontend

```bash
cd frontend
npm run dev
```

### Start Electron

Open another terminal.

```bash
cd frontend
npm run electron
```

---

## Build Desktop Application

```bash
cd frontend
npm run build
npm run dist
```

The generated Windows installer will be available inside the `release` folder.

---