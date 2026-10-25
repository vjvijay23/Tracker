# FitPulse Mobile Application - Technical Architecture

**Platform:** React Native (Expo Managed Workflow)  
**Language:** TypeScript  
**Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)  
**AI Vision:** Google Gemini 1.5 Flash (Multimodal API)  

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Mobile Device (React Native / Expo)"
        UI["UI Layer (Screens & Components)"]
        Nav["React Navigation (Bottom Tabs + Stacks)"]
        State["State Management (Zustand + AsyncStorage)"]
        Sensors["Hardware Sensors (Pedometer & Camera)"]
        OfflineQueue["Offline Sync Queue (SQLite / MMKV)"]
    end

    subgraph "Cloud Backend (Free Tier Stack)"
        SupaAuth["Supabase Authentication (JWT)"]
        SupaDB["PostgreSQL Database (Row Level Security)"]
        SupaStore["Supabase Storage (Meal & Avatar Images)"]
        Gemini["Google Gemini 1.5 Flash API (Food Vision)"]
    end

    UI --> Nav
    UI --> State
    Sensors --> State
    State --> OfflineQueue
    OfflineQueue <--> SupaDB
    UI --> SupaStore
    UI --> Gemini
    UI <--> SupaAuth
```

---

## 2. Technology Stack Rationale

### 2.1 Why React Native + Expo?
1. **Single Codebase for Both Platforms:** 100% code reuse for Android (primary target) and iOS (future release).
2. **Instant Physical Device Testing:** Both developers can scan an Expo QR code to test on real Android devices immediately via `Expo Go`, without configuring Android Studio SDK emulators or needing macOS.
3. **Hardware Access:** Robust managed libraries:
   - `expo-sensors`: Native pedometer access without complex Android native bridging.
   - `expo-camera` / `expo-image-picker`: Fast photo capture for the AI food scanner.
   - `expo-haptics`: Tactile feedback on workout timers and likes.
4. **Zero Licensing Costs:** Open-source MIT ecosystem.

### 2.2 Why Supabase for Backend?
1. **Built-in Postgres with Row Level Security (RLS):** Allows writing secure database rules directly in SQL so the mobile client can query the database securely without having to build and host a separate custom Node/Express backend server.
2. **Generous Free Tier:**
   - 50,000 monthly active users (MAU).
   - 500 MB database storage (ample for 100k+ step and meal log records).
   - 1 GB file storage (for meal photos and avatars).
   - Realtime websocket subscriptions for live community feeds and leaderboard ranks.

### 2.3 Why Google Gemini 1.5 Flash for Food Vision?
1. **Multimodal Native:** Accepts image base64 + structured prompt in a single API call.
2. **Structured Output (JSON Schema):** Directly returns formatted JSON matching our TypeScript `FoodNutritionEstimate` type.
3. **Free Tier:** 15 requests per minute (RPM) and 1,500 requests per day at zero cost.

---

## 3. Mobile Directory Architecture

```text
src/
├── api/                       # Network clients & endpoints
│   ├── client.ts              # Fetch wrapper with interceptors
│   ├── gemini.ts              # Gemini 1.5 Flash Vision API client
│   └── supabase.ts            # Supabase JS client with AsyncStorage session persistence
├── components/                # Modular reusable UI widgets
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   └── Badge.tsx
│   ├── dashboard/
│   │   ├── StepRing.tsx       # Circular SVG progress indicator
│   │   ├── MacroBar.tsx       # Stacked Carbs/Protein/Fat bar
│   │   └── StreakBadge.tsx    # Daily streak flame indicator
│   ├── nutrition/
│   │   ├── FoodItemCard.tsx
│   │   └── PortionSlider.tsx  # Interactive weight correction
│   └── workouts/
│       ├── ExerciseCard.tsx
│       └── RestTimer.tsx      # Countdown timer with audio chime
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts             # User session, login, signup
│   ├── usePedometer.ts        # Live step subscription & historical sync
│   ├── useNutrition.ts        # Daily calorie & macro state
│   └── useWorkouts.ts         # Active workout state & timer
├── navigation/                # Navigation controllers
│   ├── RootNavigator.tsx      # Auth vs. Main App switch
│   └── BottomTabNavigator.tsx # 5 core app tabs
├── screens/                   # Full-screen view components
│   ├── DashboardScreen.tsx    # Unified health center
│   ├── ActivityTrackerScreen.tsx # Steps, distance, leaderboard
│   ├── FoodScannerScreen.tsx  # Camera & AI analysis review
│   ├── WorkoutScreen.tsx      # Home workout library & active player
│   └── CommunityScreen.tsx    # Social feed, challenges, posts
├── theme/                     # Design tokens & color palettes
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
└── types/                     # Shared TypeScript interfaces
    ├── nutrition.ts
    ├── activity.ts
    ├── workout.ts
    └── community.ts
```

---

## 4. Key Subsystem Implementation Designs

### 4.1 Step Tracking Pipeline
```mermaid
sequenceDiagram
    participant Hardware as Android Sensor (Pedometer)
    participant Hook as usePedometer Hook
    participant Storage as Local AsyncStorage
    participant DB as Supabase activity_logs

    Hardware->>Hook: OnStepCountChanged (Real-time count)
    Hook->>Storage: Cache updated daily step total
    Hook->>Storage: Compute distance & estimated kcal
    Note over Hook,DB: Debounced Sync (every 5 mins or on App State Change)
    Hook->>DB: Upsert daily record (user_id, date, steps, distance, calories)
```

### 4.2 AI Food Recognition Pipeline
```mermaid
sequenceDiagram
    participant User
    participant Camera as Expo Camera
    participant Client as FitPulse App
    participant Gemini as Gemini 1.5 Flash
    participant DB as Supabase meals table

    User->>Camera: Snaps photo of meal
    Camera->>Client: Returns compressed JPEG base64
    Client->>Gemini: POST generateContent(prompt, imageBase64, jsonSchema)
    Gemini-->>Client: Returns JSON {dish, calories, protein, carbs, fat, fiber}
    Client->>User: Displays interactive adjustment modal
    User->>Client: Confirms or tweaks portion slider
    Client->>DB: INSERT into meals (user_id, meal_name, macros, photo_url)
```

---

## 5. Security & Offline Resilience

1. **API Keys Protection:** API keys stored in `.env` and accessed via `expo-constants`. For production builds, Gemini calls can be routed through a Supabase Edge Function to avoid client-side API key exposure.
2. **Offline Mode:**
   - Step counts and completed workouts are written to `AsyncStorage` immediately.
   - When offline, network calls are appended to an `offlineQueue`.
   - On `NetInfo` connection restoration, queue is flushed with idempotent `upsert` queries.
3. **Data Protection:** All personal health records adhere to HIPAA/GDPR best practices (encrypted in transit via TLS 1.3, encrypted at rest in PostgreSQL, user deletion endpoint supported).
