# Live Polling System

A real-time polling system for teachers to create and manage polls while students can participate and view results instantly.

## Features

### Teacher Features
- Create and manage polls
- Control poll visibility (draft/live/ended)
- Only one active poll at a time
- Real-time monitoring of responses
- Automatic poll expiration

### Student Features
- Automatic poll notifications
- Real-time response submission
- View live results
- Track response history
- Single response per poll

### Technical Features
- Real-time WebSocket communication
- Secure authentication & authorization
- Session management
- Automatic reconnection handling
- Rate limiting & security measures

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 5+
- Redis 6+

### Backend Setup
```bash
# Clone repository
git clone https://github.com/your-username/live-polling-system

# Install dependencies
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [Implementation Plan](./IMPLEMENTATION.md)
- [API Documentation](./API.md)
- [Security Guide](./SECURITY.md)
- [Testing Strategy](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Project Structure

```
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API and socket services
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
│
├── server/                # Backend application
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── socket/       # WebSocket handlers
│   │   └── types/        # TypeScript types
│   └── tests/            # Test suites
│
└── docs/                 # Documentation
```

## Development

### Running Tests
```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run E2E tests
npm run test:e2e
```

### Code Quality
```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

## Deployment

### Production Build
```bash
# Build backend
cd server
npm run build

# Build frontend
cd client
npm run build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Monitoring

### Health Checks
- Backend: `GET /health`
- Detailed: `GET /health/detailed`
- Metrics: `GET /metrics`

### Logging
- Application logs: `/var/log/app/`
- Access logs: `/var/log/nginx/`
- Error logs: `/var/log/app/error.log`

## Security

- JWT-based authentication
- Role-based access control
- Rate limiting
- WebSocket connection validation
- Data validation & sanitization
- Session management
- CORS configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@your-domain.com or join our Slack channel.

## Credits

- Lead Developer: [Your Name](https://github.com/your-username)
- Contributors: List of contributors

## Version History

- 1.0.0
  - Initial release
  - Basic polling functionality
  - Real-time updates
  - User authentication