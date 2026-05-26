# Plan: Wizard de Picks — Grupos + Bracket de Playoffs

## Contexto

Actualmente la pantalla de fixture muestra los partidos con picks ya cargados (mock). El usuario necesita una experiencia de selección vacía, paso a paso: primero elige H/D/A para cada partido de cada grupo (12 grupos), y una vez completados todos los grupos, el sistema calcula quién clasifica y muestra el bracket de playoffs para seguir eligiendo hasta la Final.

Los picks se hacen **una sola vez antes del torneo** — no se pueden editar después (cada partido se bloquea al lockAt).

---

## Flujo del Wizard

```
/picks                    ← nueva ruta
  │
  ├── Paso 0: Bienvenida  ← CTA "Empezar"
  │
  ├── Pasos 1–12: Grupos A → L
  │     Para cada grupo:
  │     - Header: "Grupo A" + barra de progreso (1/12)
  │     - Lista de los 6 partidos del grupo
  │     - Cada partido: card con botones H / E / V
  │     - Botón "Siguiente grupo" habilitado solo cuando los 6 partidos tienen pick
  │
  ├── Paso 13: Cálculo automático
  │     - Simula la tabla de cada grupo con los picks del usuario
  │     - Determina los 2 clasificados por grupo (24 equipos directos)
  │     - Determina los 8 mejores terceros (32 clasificados total)
  │     - Construye el bracket de R32
  │
  ├── Paso 14: Bracket R32 (16 partidos)
  │     - Visual de bracket tipo "llaves"
  │     - Usuario hace click en el equipo ganador de cada partido
  │     - Botón "Siguiente" cuando los 16 picks están hechos
  │
  ├── Pasos 15–17: R16, Cuartos, Semis
  │     - Mismo patrón: bracket se arma con los ganadores del paso anterior
  │
  ├── Paso 18: Final + 3er Puesto
  │
  └── Paso 19: Resumen + Confirmar
        - Resumen de todos los picks
        - Botón "Confirmar predicciones"
        - POST /api/picks (bulk) → redirige a /fixture
```

---

## Archivos a crear

### Páginas y componentes nuevos
- `src/app/picks/page.tsx` — página del wizard (maneja el step actual)
- `src/components/wizard/WizardProgress.tsx` — barra de progreso con steps
- `src/components/wizard/GroupStep.tsx` — pantalla de un grupo: 6 partidos + picks
- `src/components/wizard/BracketStep.tsx` — pantalla de bracket (R32, R16, QF, SF, Final)
- `src/components/wizard/BracketMatch.tsx` — un cruce del bracket: equipo A vs equipo B, click para elegir
- `src/components/wizard/SummaryStep.tsx` — resumen final antes de confirmar

### Lógica de simulación
- `src/lib/tournament.ts` — funciones puras:
  - `simulateGroup(matches, picks)` → tabla de posiciones del grupo
  - `getBestThirds(groupTables)` → 8 mejores terceros según criterio FIFA
  - `buildR32Bracket(groupTables)` → array de 16 cruces R32
  - `advanceBracket(bracket, picks)` → siguiente ronda a partir de picks actuales

### Store del wizard
- `src/store/wizard.ts` — Zustand store:
  - `step: number`
  - `picks: Record<matchId, 'H'|'D'|'A'>` — todos los picks del wizard
  - `bracket: BracketRound[]` — rondas de playoff generadas
  - `setPick(matchId, pick)`
  - `nextStep()`
  - `prevStep()`
  - `reset()`

### Modificar existentes
- `src/components/Navbar.tsx` — agregar link "Mis Picks" que lleva a `/picks` si el usuario no completó el wizard, o a `/mis-picks` si ya lo hizo
- `src/app/mis-picks/page.tsx` — mostrar picks reales del store en lugar de mock

---

## Modelo de datos del bracket

```typescript
interface BracketMatch {
  id: string           // generado: 'r32-1', 'r16-3', etc.
  homeTeam: Team | null  // null hasta que se resuelva la ronda anterior
  awayTeam: Team | null
  pick: 'H' | 'A' | null  // no hay empate en playoffs
  stage: 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'
}

type BracketRound = BracketMatch[]
```

---

## Lógica de clasificación de grupos (FIFA WC 2026)

Cada grupo tiene 4 equipos, 6 partidos. Clasifican:
- 1° y 2° de cada grupo (24 equipos)
- 8 mejores terceros de los 12 grupos (8 equipos)
- Total: 32 equipos en R32

Criterio de desempate para tabla: puntos → diferencia de goles → goles a favor → H2H.
Para los 8 mejores terceros: puntos → diferencia de goles → goles a favor.

> **Simplificación para el wizard**: como el usuario no ingresa marcadores (solo H/D/A), los empates en tabla se resuelven con criterio de posición alfabética de equipos. Esto es suficiente para armar el bracket.

---

## UX de la pantalla de grupo

```
┌─────────────────────────────────────────────┐
│  Grupo A                          2 / 12    │
│  ████████░░░░░░░░░░░░░░░░░░░░░░  (progreso) │
├─────────────────────────────────────────────┤
│  🇺🇸 EE.UU.   vs   🇲🇽 México               │
│  [ Local ]  [ Empate ]  [ Visitante ]       │
│                                             │
│  🇨🇦 Canadá  vs   🇩🇪 Alemania               │
│  [ Local ]  [ Empate ]  [ Visitante ]  ✓   │
│  ...                                        │
├─────────────────────────────────────────────┤
│  ← Anterior          Siguiente grupo →      │
│              (habilitado cuando 6/6)        │
└─────────────────────────────────────────────┘
```

---

## UX del bracket de playoffs

```
R32          R16          QF           SF          Final
 │             │            │            │
EE.UU.─┐       │            │            │
       ├──────▶│            │            │
Marruecos      │            │            │
               ...
```

Click en un equipo lo selecciona como ganador y avanza al siguiente cruce.

---

## Pasos de implementación

1. Crear `src/lib/tournament.ts` con funciones de simulación (puras, testeables)
2. Crear `src/store/wizard.ts` con el estado del wizard
3. Crear `src/app/picks/page.tsx` con la lógica de steps
4. Crear `WizardProgress`, `GroupStep`, `BracketStep`, `BracketMatch`, `SummaryStep`
5. Conectar con los datos de partidos (mock o API según estado del proyecto)
6. Agregar link en Navbar
7. Conectar `SummaryStep` con el store de prode para guardar los picks

---

## Verificación

```
1. Ir a /picks
2. Step 0: ver pantalla de bienvenida
3. Steps 1–12: completar picks de cada grupo (6 H/D/A por grupo)
4. Ver bracket R32 con los 32 clasificados simulados
5. Elegir ganadores hasta la final
6. Ver resumen con todos los picks
7. Confirmar → redirige a /fixture o /mis-picks
8. En /mis-picks ver todos los picks guardados
```
