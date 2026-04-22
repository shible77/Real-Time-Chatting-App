# Realtime Chatting Application

A production‑ready, real‑time group chatting application built with a modern full‑stack architecture. This project demonstrates clean system design, secure authentication, real‑time communication, and scalable backend practices.

---

## 🚀 Features

* 🔐 **JWT‑based Authentication** (Signup / Login)
* 🛡️ **Protected Routes** on the frontend
* 💬 **Real‑time Messaging** using Socket.IO
* 🏠 **Create & Join Chat Rooms**
* 🪟 **Accessible Modal‑based UI** for room creation
* ⚡ **Persistent Sessions** with token handling
* 📡 **Auto socket reconnection** on refresh
* 🧱 **Clean, layered backend architecture**

---

## 🧠 Tech Stack

### Frontend

* **React.js** (with TypeScript)
* **React Router v6**
* **Axios** (API client)
* **Socket.IO Client**
* **Tailwind CSS** (utility‑first styling)

### Backend

* **Node.js**
* **Express.js**
* **TypeScript**
* **Socket.IO**
* **JWT Authentication**
* **MySQL**
* **Drizzle ORM + Drizzle Kit** (schema & migrations)

---

## 🏗️ Architecture Overview

```
Frontend (React)
   ├── Auth Store (Token)
   ├── Protected Routes
   ├── API Client (Axios)
   └── Socket Layer

Backend (Express)
   ├── Routes (REST APIs)
   ├── Controllers
   ├── Services
   ├── Database Layer (Drizzle ORM)
   └── Socket Handlers
```

This separation ensures:

* Maintainability
* Testability
* Scalability

---

## 🔐 Authentication Flow

1. User logs in / signs up
2. Server issues **JWT**
3. Token is stored on the client
4. Token is automatically attached to:

   * HTTP requests
   * Socket connections
5. Protected routes validate token presence

---

## 🔄 Real‑Time Communication

* Socket connection is initialized **only after authentication**
* Each user joins rooms via Socket.IO namespaces/events
* Messages are broadcast instantly to room members
* Designed to scale horizontally with a message broker

---

## 📁 Project Structure

```
backend/
 ├── src/
 │   ├── routes/
 │   ├── controllers/
 │   ├── services/
 │   ├── sockets/
 │   ├── db/
 │   └── index.ts

frontend/
 ├── src/
 │   ├── pages/
 │   ├── components/
 │   ├── api/
 │   ├── auth/
 │   ├── sockets/
 │   └── App.tsx
```

---

## ⚙️ Environment Variables

### Backend (`.env`)

```
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/chat_app
JWT_SECRET=your_secret_key
```

### Frontend (`.env`)

```
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🛠️ Setup Instructions

### Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Best Practices Followed

* Type‑safe backend with TypeScript
* Centralized error handling
* Secure token handling
* Scalable socket initialization
* Reusable UI components
* Clean commit‑ready structure

---

## 📈 Scalability Considerations

* Ready for Redis‑based Socket.IO adapter
* Stateless backend design
* Database migration-driven schema
* Can handle large concurrent users with load balancing

---

## 👨‍💻 Author

**Md. Salauddin**
Full‑Stack Engineer | Backend‑focused | Real‑time Systems Enthusiast

* Strong experience with Node.js, React, Redux, MySQL, PostgreSQL, Firebase, and system design
* Passionate about building scalable and production‑grade applications

---

## 📄 License

This project is licensed under the MIT License.
