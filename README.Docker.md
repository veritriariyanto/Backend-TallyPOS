# Docker Setup untuk TallyPOS Backend

## Prerequisites
- Docker Desktop installed
- Docker Compose installed

## Setup Options

### Option 1: Development dengan PostgreSQL Lokal di Docker

1. **Copy environment file**
```bash
cp .env.docker .env
```

2. **Edit .env** - Set database lokal:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=tallypos
DB_SSL=false
```

3. **Build dan jalankan**
```bash
# Build images
docker-compose build

# Start services (postgres + backend dev)
docker-compose up -d postgres backend-dev

# View logs
docker-compose logs -f backend-dev
```

4. **Run migrations**
```bash
docker-compose exec backend-dev npm run migration:run
```

5. **Akses API**
- http://localhost:3000

### Option 2: Development dengan Neon Database (Cloud)

1. **Edit .env** - Set Neon credentials:
```env
DB_HOST=ep-calm-frost-a12j77or-pooler.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=your_neon_user
DB_PASSWORD=your_neon_password
DB_DATABASE=neondb
DB_SSL=true
```

2. **Jalankan hanya backend** (karena database di cloud):
```bash
docker-compose up -d backend-dev
```

### Option 3: Production dengan Neon Database

1. **Edit .env** untuk production

2. **Build dan jalankan production**
```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Docker Commands Cheat Sheet

### Basic Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# View logs specific service
docker-compose logs -f postgres

# Execute command in container
docker-compose exec backend npm run migration:run
docker-compose exec backend sh
```

### Database Commands
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d tallypos

# Create database dump
docker-compose exec postgres pg_dump -U postgres tallypos > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres tallypos < backup.sql
```

### Cleanup Commands
```bash
# Stop and remove containers, networks
docker-compose down

# Remove volumes too (WARNING: data loss)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Prune unused containers/images/volumes
docker system prune -a --volumes
```

### Build Commands
```bash
# Rebuild without cache
docker-compose build --no-cache

# Rebuild specific service
docker-compose build backend

# Pull latest images
docker-compose pull
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Database connection issues
```bash
# Check postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Test connection
docker-compose exec backend sh
node -e "console.log(process.env.DB_HOST)"
```

### Migration errors
```bash
# Run migrations manually
docker-compose exec backend npm run migration:run

# Revert migration
docker-compose exec backend npm run migration:revert

# Generate new migration
docker-compose exec backend npm run migration:generate -- src/database/migrations/YourMigrationName
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| APP_PORT | Application port | 3000 |
| DB_HOST | Database host | postgres |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database user | postgres |
| DB_PASSWORD | Database password | - |
| DB_DATABASE | Database name | tallypos |
| DB_SSL | Enable SSL | false |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | JWT expiration | 1d |

## Production Deployment

### Using Docker Compose
```bash
# Production with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Using Docker directly
```bash
# Build image
docker build -t tallypos-backend:latest .

# Run container
docker run -d \
  --name tallypos-backend \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  tallypos-backend:latest
```

### Push to Docker Registry
```bash
# Tag image
docker tag tallypos-backend:latest your-registry/tallypos-backend:latest

# Push to registry
docker push your-registry/tallypos-backend:latest
```

## Health Check

Container includes health check pada port 3000:
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' tallypos-backend-prod
```

## Performance Tips

1. **Use multi-stage builds** (sudah implemented di Dockerfile)
2. **Minimize layers** - Combine RUN commands
3. **Use .dockerignore** - Exclude unnecessary files
4. **Volume mounting** - For logs and persistent data
5. **Resource limits** - Add to docker-compose:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```
