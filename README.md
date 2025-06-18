# Socket Polling Project

A real-time polling application that allows teachers to create and manage polls while students can participate and view results instantly.

## Features

### Teacher Features
- Create and manage polls with multiple options
- Control poll visibility (draft/live/ended)
- Only one active poll at a time
- Real-time monitoring of student responses
- Automatic poll expiration

### Student Features
- Automatic poll notifications when a poll goes live
- Real-time response submission
- Instant view of poll results
- Single response per poll
- Immediate feedback after voting

### Technical Features
- Real-time WebSocket communication
- JWT-based authentication
- Role-based access control (teacher/student)
- Automatic reconnection handling
- Session management

## Video Demonstration
[![Watch the video](https://img.youtube.com/vi/V4UdyHtNldE/0.jpg)](https://youtu.be/V4UdyHtNldE)

Or click the link: [https://youtu.be/V4UdyHtNldE](https://youtu.be/V4UdyHtNldE)

## Screenshots
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/b1755e15-11a7-45f9-9f70-5f9ee94f391f" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/9d9c698e-b557-4296-902f-039035b3cd21" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/446825b1-3c14-41a2-81dd-b52a9cbf471a" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/6702b16b-e913-42d5-8621-a88723fc69b0" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/c93d1024-7385-4fa1-b864-4b598c3be98b" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/d54a67b6-6666-4ccc-8bd5-313750f74556" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/0d7b3cf6-eb6c-4d62-8546-00f4aace8cac" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/e3395c22-fa01-453e-a447-5f237ef89516" />
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/d2c70327-37ff-4482-84f0-7f7a14a6f3f3" />


## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite as the build tool
- React Router for navigation
- Socket.io client for real-time communication
- Axios for HTTP requests
- Shadcn UI (Radix UI) components
- TailwindCSS for styling
- React Hook Form for form handling

### Backend
- Node.js with Express
- TypeScript
- Socket.io for real-time communication
- MongoDB with Mongoose
- JWT for authentication
- Role-based middleware

## Prerequisites
- Node.js 16+
- MongoDB 5+

## Getting Started

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration:
# PORT=5001
# MONGODB_URI=your_mongodb_connection_string
# NODE_ENV=development
# JWT_SECRET=your_jwt_secret
# CORS_ORIGIN=http://localhost:8080

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration:
# VITE_API_URL=http://localhost:5001
# VITE_SOCKET_URL=http://localhost:5001

# Start development server
npm run dev
```

## Project Structure

```
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and socket services
│   │   └── types/          # TypeScript types
│   ├── .env                # Environment variables
│   └── vite.config.ts      # Vite configuration
│
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── middleware/     # Express and Socket.io middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── socket/         # WebSocket handlers
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── .env                # Environment variables
│   └── server.ts           # Main server file
│
└── vercel.json             # Vercel deployment configuration
```

## Development

### Building for Production

#### Backend
```bash
cd server
npm run build
```

#### Frontend
```bash
cd client
npm run build
```

### Deployment

The application is configured for deployment on Vercel. The `vercel.json` file in the root directory handles client-side routing for the SPA.

## API Endpoints

- `GET /api/polls` - Get all polls (teachers see all, students see only active)
- `GET /api/polls/:id` - Get a specific poll
- `GET /api/polls/:id/results` - Get poll results
- `GET /health` - Health check endpoint

## Socket Events

### Client to Server
- `create-poll` - Create a new poll (teachers only)
- `activate-poll` - Activate a poll (teachers only)
- `end-poll` - End a poll (teachers only)
- `submit-vote` - Submit a vote (students only)

### Server to Client
- `poll-created` - A new poll has been created
- `poll-activated` - A poll has been activated
- `poll-ended` - A poll has been ended
- `poll-updated` - Poll results have been updated
- `connection-status` - Connection status updates
- `error` - Error messages

## Authentication

The application uses a simple JWT-based authentication system. Users can log in as either a teacher or a student, and their role determines what actions they can perform.

## License

This project is licensed under the ISC License.