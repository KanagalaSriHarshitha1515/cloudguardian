# 🚀 CloudGuardian Backend

CloudGuardian is a backend application developed to simplify Docker container management. It provides REST APIs to monitor and manage Docker resources such as containers, images, volumes, networks, Docker Swarm, services, and stacks. The project is built using Node.js, Express.js, PostgreSQL, Prisma ORM, and Dockerode.

The main objective of this project is to provide a centralized platform where users can manage Docker resources securely through authenticated APIs.

---

## Features

### Authentication
- User Registration
- User Login
- JWT-based Authentication

### Project Management
- Create Project
- View Projects
- Update Project
- Delete Project

### Docker Host Management
- Add Docker Host
- View Docker Hosts
- Test Docker Connection

### Container Management
- View Containers
- Create Containers
- Start Containers
- Stop Containers
- Restart Containers
- Delete Containers
- View Container Logs
- Monitor Container Statistics

### Image Management
- View Docker Images
- Pull Images from Docker Hub
- Tag Images
- Delete Images

### Volume Management
- View Volumes
- Create Volumes
- Inspect Volumes
- Delete Volumes
- Remove Unused Volumes

### Network Management
- View Networks
- Create Networks
- Inspect Networks
- Delete Networks
- Connect Containers
- Disconnect Containers

### Docker Swarm
- Initialize Swarm
- View Swarm Information
- List Swarm Nodes
- Leave Swarm

### Service Management
- Create Services
- View Services
- Scale Services
- Delete Services

### Stack Management
- Deploy Docker Stacks
- View Stacks
- View Stack Services
- View Stack Tasks
- Remove Stacks

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Dockerode
- JWT Authentication
- Swagger UI
- Helmet
- Morgan
- Express Rate Limit

---

## Project Structure

```
backend
│
├── prisma
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── utils
│   ├── validators
│   ├── app.js
│   └── server.js
│
├── package.json
└── README.md
```

---

## Installation

Clone the repository

```bash
git clone <repository-url>
```

Move into the project directory

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file and add the following:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

Start the development server

```bash
npm run dev
```

---

## API Documentation

Swagger documentation is available at:

```
http://localhost:5000/api/docs
```

---

## Authentication

Protected APIs require a JWT token.

Example:

```
Authorization: Bearer <your_token>
```

---

## Future Improvements

- React Dashboard
- Real-time Docker Monitoring
- WebSocket Support
- Role-Based Access Control
- Deployment using Docker and Kubernetes

---

## Developed By

Kanagala Sri Harshitha

Bachelor of Engineering (Computer Science)

Final Year Project – CloudGuardian