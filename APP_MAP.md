# Level Up Fitness App Map

## Current Status

## What I know
- I found the project folder.
- The main app files are index.html, app.js, app.css, supabase-config.js, and sw.js.
- This is a simple web app, not a React/npm project.
- app.js is probably the most important file because it controls the app logic.

## What I am doing right now
I am learning the project structure before making new changes.

## Rule before changing code
Before I ask AI to change anything, I need to know:
- what file probably needs to change
- what I expect to happen
- what is actually happening
- whether there is an error message
- what I already tried

## Next thing to learn
Understand how app.js is organized.

## What this app is
Level Up Fitness is a fitness/workout tracking web app.

## Main files

### index.html
This controls the structure of the app — the screens, buttons, sections, login area, and layout.

### app.js
## app.js Breakdown

app.js is the main brain of the app. It is a large file with the app’s data, page rendering, workout logic, login/cloud syncing, and app startup code.

### Main sections of app.js

1. Data at the top
- Workout plans
- Exercise lists
- Rankings
- Gym names

2. Utility/helper functions
- Date formatting
- Saving/loading data
- Timestamps

3. Supabase cloud functions
- Google sign-in
- Cloud data syncing
- User profile/workout upload and download

4. State variables
- Tracks the current user
- Tracks the active workout
- Tracks what page or workout is currently selected

5. Rendering functions
- Shows different screens on the page
- Updates the UI when the user moves around the app

6. Workout interaction
- Starts workouts
- Ends workouts
- Saves exercise sets

7. Analytics and progress
- Calculates ranks
- Tracks workout volume
- Tracks records

8. App initialization
- Starts the app
- Connects buttons to functions
- Sets up event listeners

### Where workouts are stored

Workout plans are stored near the top of app.js.

Important data:
- `plans` = the 12 pre-made workout plans
- `personalProgram` = the beginner 4-day weekly program
- `exerciseCatalog` = the big exercise library

### Where button clicks are handled

Button clicks are connected near the bottom of app.js inside `initializeApp()`.

Important examples:
- Browse button uses `go('workout')`
- Start button uses `startWorkout`
- Finish button uses `finishWorkout`
- Google sign-in button uses `signInWithGoogle`

### Where Supabase/login logic is

Supabase and login logic is mostly in the middle of app.js.

Important functions:
- `supabaseConfigured()`
- `getSupabaseClient()`
- `signInWithGoogle()`
- `handleCloudSession()`
- `initializeCloudAuth()`

### 5 most important functions to understand first

1. `initializeApp()`
- Starts the app
- Loads the profile
- Connects buttons
- Shows/hides login screen

2. `go(id)`
- Switches between app pages
- Example: home, workout, progress, profile

3. `detail(planId)`
- Shows the details of one workout plan

4. `startWorkout()`
- Starts a workout
- Creates the active workout
- Saves progress locally

5. `finishWorkout()`
- Ends the workout
- Saves it to history
- Syncs it to the cloud if signed in

### app.css
This controls how the app looks — colors, spacing, fonts, buttons, and layout.

### supabase-config.js
This connects the app to Supabase for login/database features.

### sw.js
This is the service worker. It helps the app work offline and cache files.

### assets/
This stores images, icons, workout images, rank badges, and muscle diagrams.

## What I need to learn first
- HTML = structure
- CSS = design
- JavaScript = logic
- Supabase = database/login
- Service worker = offline support

## Things I do not understand yet
- How app.js is organized
- How workouts are stored
- How login works
- How data saves to Supabase
- How buttons connect to functions
