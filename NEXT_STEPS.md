# Next Steps: Frontend Integration

## Phase Overview
The Docker infrastructure is ready. Now we integrate the frontend to use the real API instead of mock data.

## Priority 1: Test Backend is Running ⏱️ NOW

```bash
cd docker
docker compose up --build

# In another terminal:
curl http://localhost:4000/health
curl http://localhost:4000/matches | jq '.[0]'
```

If this works, the backend is ready.

---

## Priority 2: Update `src/store/ui.ts` (User Auth Store)

**Current state**: Uses MOCK_USER

**Changes needed**:
1. Remove the entire `MOCK_USER` object
2. Add getter for JWT from localStorage
3. Add function to set user from API response
4. Update login/logout to use JWT

**Pseudo-code**:
```typescript
// Remove:
const MOCK_USER = { uid: '...', displayName: '...', photoURL: '...' }

// Add:
export const useUiStore = create<UiState>()(...
  user: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return null
    return {
      uid: localStorage.getItem('user_id') || '',
      displayName: localStorage.getItem('user_name') || '',
      photoURL: localStorage.getItem('user_photo') || '',
    }
  },
  loginWithGoogle: async (token: string) => {
    const result = await api.googleAuth(token)
    localStorage.setItem('auth_token', result.token)
    localStorage.setItem('user_id', result.user.id)
    localStorage.setItem('user_name', result.user.displayName)
    localStorage.setItem('user_photo', result.user.photoURL || '')
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_photo')
  }
)
```

---

## Priority 3: Update `src/store/prode.ts` (Predictions Store)

**Current state**: Uses MOCK_MATCHES, MOCK_PREDICTIONS, MOCK_STANDINGS

**Changes needed**:
1. Remove mock data
2. Add `useEffect` to load matches on mount
3. Update `setPick()` to call `api.setPrediction()`
4. Load standings from API
5. Load user predictions from API

**Pseudo-code**:
```typescript
// Remove:
const MOCK_MATCHES = [...]
const MOCK_PREDICTIONS = [...]
const MOCK_STANDINGS = [...]

// Add:
export const useProdeStore = create<ProdeState>()(
  (set, get) => ({
    matches: [],
    predictions: {},
    standings: [],

    async loadMatches() {
      const matches = await api.getMatches()
      set({ matches })
    },

    async loadPredictions(userId: string) {
      const predictions = await api.getPredictions(userId)
      const preds: Record<string, Prediction> = {}
      predictions.forEach(p => {
        preds[p.match_id] = p.pick
      })
      set({ predictions: preds })
    },

    async setPick(matchId: string, pick: string) {
      await api.setPrediction(matchId, pick)
      // Update local state
      set(s => ({
        predictions: { ...s.predictions, [matchId]: pick }
      }))
    },

    async loadStandings() {
      const standings = await api.getStandings()
      set({ standings })
    },
  })
)
```

---

## Priority 4: Implement Login Page

**File**: `src/app/login/page.tsx`

**Current state**: Probably has mock/placeholder

**Changes needed**:
1. Add Google Identity Services script tag in layout or page
2. Implement `handleCredentialResponse` callback
3. Call `useUiStore().loginWithGoogle(token)`
4. Redirect to `/picks` on success

**Script to add**:
```html
<script async src="https://accounts.google.com/gsi/client"></script>

<script>
  window.onload = function () {
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
  };
</script>
```

---

## Priority 5: Update Route Handlers

**File**: `src/app/api/auth/session/route.ts`

**Current**: Uses Firebase Admin

**Update**: 
- Remove Firebase imports
- Verify JWT from cookie or Authorization header instead
- Return user info from JWT payload

**File**: `src/app/api/picks/route.ts`

**Current**: Uses Firebase to save picks

**Update**:
- Remove Firebase imports  
- Call API endpoint instead: `await api.setPrediction(matchId, pick)`

---

## Priority 6: Update Proxy (Session Guard)

**File**: `src/proxy.ts`

**Current**: Probably disabled or uses Firebase

**Update**:
- Re-enable session checking
- Verify JWT from localStorage or cookie
- Redirect to `/login` if no valid JWT

---

## Priority 7: Cleanup Firebase

**Remove**:
- All `firebase` imports from all files
- Entire `src/lib/firebase/` directory
- `firebase` and `firebase-admin` from `package.json`

**Verify**:
```bash
grep -r "firebase" src/ --include="*.ts" --include="*.tsx"
# Should return: No matches
```

---

## Order of Execution

### Session 1 (now):
1. ✅ Create backend infrastructure
2. Test backend starts without errors

### Session 2:
3. Update `ui.ts` store for Google auth
4. Update `prode.ts` store for API calls
5. Implement login page with Google Identity Services

### Session 3:
6. Update API route handlers
7. Update proxy for session verification

### Session 4:
8. Remove all Firebase code and dependencies
9. Full integration testing
10. Fix any issues

---

## Testing During Integration

After each priority, test:

```bash
# Terminal 1: Backend
cd docker
docker compose up --build

# Terminal 2: Frontend  
npm run dev

# Terminal 3: Browser
# Open http://localhost:3000
# Click login → Google popup
# Verify JWT in localStorage: 
#   open console → localStorage.getItem('auth_token')
# Check predictions load from API
# Make a pick and verify it saves
```

---

## Checklist: Ready for Step 2?

- [ ] Backend starts without errors: `docker compose up`
- [ ] API responds: `curl http://localhost:4000/health`
- [ ] Matches are seeded: `curl http://localhost:4000/matches | jq length`
- [ ] PostgreSQL is running: `docker compose ps` shows both services healthy
- [ ] No errors in `docker compose logs api`
- [ ] No errors in `docker compose logs db`

Once all checkmarks are done, proceed to updating the stores.

---

## Files Modified This Session

### Created:
- `docker/docker-compose.yml`
- `docker/api/*` (entire directory)
- `docker/db/schema.sql`
- `docker/README.md`
- `src/lib/api.ts`
- `QUICKSTART_BACKEND.md`
- `docs/BACKEND_SETUP.md`
- `IMPLEMENTATION_STATUS.md`
- `NEXT_STEPS.md` (this file)

### Modified:
- `.env.local` (updated with API config)
- `.env.local.example` (updated with API config)

### To Modify (in next sessions):
- `src/store/ui.ts`
- `src/store/prode.ts`
- `src/app/login/page.tsx`
- `src/app/api/auth/session/route.ts`
- `src/app/api/picks/route.ts`
- `src/proxy.ts`
- `package.json` (remove firebase)

---

## Key Environment Variables

Make sure these are set before proceeding:

**`docker/.env`**:
```
GOOGLE_CLIENT_ID=<from Google Cloud Console>
```

**`.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same as above>
JWT_SECRET=dev-secret-key
```

---

## Questions?

If anything is unclear:
- Check `docker/README.md` for backend details
- Check `QUICKSTART_BACKEND.md` for getting started
- Check `docs/BACKEND_SETUP.md` for architecture notes
- Check `IMPLEMENTATION_STATUS.md` for current state
