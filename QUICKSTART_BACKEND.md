# Quick Start: Running the Backend

## Prerequisites
- Docker and Docker Compose
- Google OAuth credentials (client ID)

## Steps

### 1. Configure Google OAuth

Get your Google OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/).

### 2. Set Environment Variables

Create `docker/.env`:
```
GOOGLE_CLIENT_ID=your-google-client-id-here
```

Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
JWT_SECRET=dev-secret-key-change-in-prod
```

### 3. Start Docker Services

```bash
cd docker
docker compose up --build
```

This will:
- Start PostgreSQL database on port 5432
- Start Node.js API on port 4000
- Automatically seed 72 match records
- Wait for database to be healthy before starting API

### 4. Verify It's Running

```bash
# Check services
docker compose ps

# Test API health
curl http://localhost:4000/health

# List matches
curl http://localhost:4000/matches
```

### 5. Start Frontend (separate terminal)

```bash
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### 6. Test the Flow

1. Go to http://localhost:3000
2. Click login button
3. Use Google Identity Services popup
4. After auth, check browser console for JWT in localStorage
5. Make predictions and see data persist to PostgreSQL

## Stopping Services

```bash
cd docker
docker compose down
```

To remove data:
```bash
docker compose down -v
```

## Troubleshooting

### API won't connect to database
```bash
# Check database logs
docker compose logs db

# Check if database is healthy
docker compose ps  # Look for (healthy) status
```

### Port already in use
Edit `docker/docker-compose.yml` and change port mappings:
```yaml
db:
  ports:
    - "5433:5432"  # Use 5433 instead of 5432
```

### Seed script fails
```bash
# View seed output
docker compose logs api | grep seed

# Manually re-run seed
docker compose exec api npm run seed
```

### Clear everything and start fresh
```bash
docker compose down -v
docker compose up --build
```

## Next Steps

After the backend is running:
1. Update stores to use real API instead of mocks
2. Implement Google login in frontend
3. Update predictions to save to database
4. Remove Firebase imports entirely

See `docs/BACKEND_SETUP.md` for detailed implementation plan.
