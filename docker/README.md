# Prode Backend Infrastructure

This directory contains the Docker Compose setup for the Prode API backend.

## Services

### PostgreSQL Database (db)
- Port: 5432
- Username: prode
- Password: prode
- Database: prode
- Volumes: Persists data in `prode_db_data`

### Node.js API (api)
- Port: 4000
- Built with Express.js and TypeScript
- Handles authentication, matches, predictions, and standings

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Google OAuth credentials (for authentication)
- Node.js 20+ (for frontend development)

### Environment Setup

1. Create a `.env` file in the `docker/` directory:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
```

2. Update `../.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
JWT_SECRET=your-secret-key
```

### Starting the Services

```bash
# From the docker/ directory
docker compose up --build

# Or with detached mode
docker compose up --build -d
```

The services will be available at:
- API: http://localhost:4000
- Database: localhost:5432

### Seeding the Database

The database is automatically seeded with match data when the API container starts.

To manually seed:
```bash
docker compose exec api npm run seed
```

### Stopping Services

```bash
docker compose down

# To remove data volumes as well
docker compose down -v
```

## API Endpoints

### Authentication
- `POST /auth/google` - Verify Google ID token and get JWT

### Matches
- `GET /matches` - List all matches
- `GET /matches?stage=group&group=A` - Filter by stage/group
- `GET /matches/:id` - Get single match

### Predictions
- `GET /predictions/:userId` - Get user predictions
- `POST /predictions` - Save a prediction (requires auth)

### Standings
- `GET /standings` - Get user rankings

### Health
- `GET /health` - Health check

## Database Schema

### users
- Google authentication mapping
- Display name, email, photo URL

### matches
- All 72 group stage matches
- Stage information
- Team data (JSON)
- Kickoff times with lock times

### predictions
- User predictions per match
- Pick (H/D/A for groups, H/A for playoffs)
- Points tracking

### standings (view)
- User rankings
- Total picks, correct picks, points
- Ordered by total_points DESC

## Development

### Building the API Image
```bash
docker compose build api
```

### Viewing Logs
```bash
# All services
docker compose logs

# API only
docker compose logs api

# With follow (tail)
docker compose logs -f api
```

### Database Access
```bash
docker compose exec db psql -U prode -d prode
```

## Troubleshooting

### Database connection refused
The API service waits 5 seconds for the database to be ready. If you see connection errors:
1. Check that the database container started: `docker compose ps`
2. View database logs: `docker compose logs db`
3. Increase the sleep duration in `api/Dockerfile`

### Seed script fails
Check the API logs for seed errors:
```bash
docker compose logs api | grep -i seed
```

### Port conflicts
If ports 5432 or 4000 are already in use, update the port mappings in `docker-compose.yml`:
```yaml
db:
  ports:
    - "5433:5432"  # Changed from 5432
api:
  ports:
    - "4001:4000"  # Changed from 4000
```

## Production Deployment

For production:
1. Change `JWT_SECRET` to a strong random value
2. Set `NODE_ENV=production`
3. Use a proper PostgreSQL backup strategy
4. Configure proper logging and monitoring
5. Use environment-specific `.env` files
