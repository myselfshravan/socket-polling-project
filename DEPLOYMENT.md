# Deployment & Monitoring Guide

## Infrastructure Setup

### Production Environment
```yaml
# Docker Compose configuration
version: '3.8'
services:
  backend:
    build: ./server
    env_file: .env.production
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}

  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
  redis_data:
```

## Environment Configuration

### Production Variables
```bash
# .env.production
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=your-secure-jwt-secret
REFRESH_TOKEN_SECRET=your-secure-refresh-token-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## Deployment Process

### Backend Deployment
1. Build Process:
```bash
# Build backend
npm run build

# Run database migrations
npm run migrate

# Start production server
npm run start:prod
```

### Frontend Deployment
1. Build Process:
```bash
# Build frontend
npm run build

# Deploy static files
aws s3 sync dist/ s3://your-bucket-name
```

## Monitoring Setup

### Application Monitoring

```typescript
// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Prometheus Metrics
const metrics = {
  activeConnections: new Gauge({
    name: 'ws_active_connections',
    help: 'Number of active WebSocket connections'
  }),
  pollResponses: new Counter({
    name: 'poll_responses_total',
    help: 'Total number of poll responses'
  }),
  responseLatency: new Histogram({
    name: 'response_latency_seconds',
    help: 'Response latency in seconds'
  })
};
```

### Health Checks

```typescript
// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    services: {
      database: isDatabaseConnected(),
      redis: isRedisConnected(),
      webSocket: isWebSocketServerRunning()
    }
  });
});

app.get('/health/detailed', async (req, res) => {
  const details = await getSystemMetrics();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: getActiveConnections(),
    metrics: details
  });
});
```

## Performance Optimization

### Caching Strategy
```typescript
// Redis Caching Configuration
const cacheConfig = {
  pollResults: {
    ttl: 60 * 5, // 5 minutes
    key: (pollId: string) => `poll:${pollId}:results`
  },
  activePolls: {
    ttl: 60, // 1 minute
    key: 'active:polls'
  }
};
```

### Connection Pooling
```typescript
// MongoDB Connection Pool
const mongooseConfig = {
  poolSize: 10,
  socketTimeoutMS: 45000,
  keepAlive: true,
  keepAliveInitialDelay: 300000
};
```

## Scaling Strategy

### Horizontal Scaling
```typescript
// PM2 Process Management
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'polling-app',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### Load Balancing
```typescript
// Nginx Configuration
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Backup Strategy

### Database Backups
```bash
# Automated backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

# Create backup
mongodump --uri "$MONGODB_URI" --out "$BACKUP_DIR/$TIMESTAMP"

# Rotate old backups (keep last 7 days)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

## Monitoring Alerts

### Alert Configuration
```typescript
// Alert Thresholds
const alertThresholds = {
  errorRate: {
    warning: 0.01, // 1%
    critical: 0.05  // 5%
  },
  responseTime: {
    warning: 1000,  // 1 second
    critical: 3000  // 3 seconds
  },
  memoryUsage: {
    warning: 0.8,   // 80%
    critical: 0.9   // 90%
  }
};
```

## Recovery Procedures

### Failover Process
1. Database Failover:
   - Monitor primary node health
   - Trigger automatic failover
   - Verify data consistency
   - Update connection strings

2. Application Recovery:
   - Restart failed services
   - Verify data integrity
   - Resume WebSocket connections
   - Clear stale sessions

## Maintenance Procedures

### Regular Maintenance
1. Database Maintenance:
   - Index optimization
   - Data cleanup
   - Performance analysis
   - Backup verification

2. Application Maintenance:
   - Log rotation
   - Cache cleanup
   - Session pruning
   - Security updates