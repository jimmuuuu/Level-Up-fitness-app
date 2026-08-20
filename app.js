const plans = [
  {
    name: 'Strong Start', type: 'Full body', time: '25 min', icon: 'kettlebell',
    exercises: [
      { name: 'Dumbbell Bench Press', muscle: 'Chest' },
      { name: 'Goblet Squat', muscle: 'Legs' },
      { name: 'Lat Pulldown', muscle: 'Back' },
      { name: 'Plank', muscle: 'Core' }
    ]
  },
  {
    name: 'Full Body Basics', type: 'Full body', time: '35 min', icon: 'functional-trainer',
    exercises: [
      { name: 'Chest Press', muscle: 'Chest' },
      { name: 'Leg Press', muscle: 'Legs' },
      { name: 'Seated Row', muscle: 'Back' },
      { name: 'Shoulder Press', muscle: 'Shoulders' }
    ]
  },
  {
    name: 'Upper Body Strength', type: 'Upper body', time: '40 min', icon: 'upper-body-tower',
    exercises: [
      { name: 'Barbell Bench Press', muscle: 'Chest' },
      { name: 'Lat Pulldown', muscle: 'Back' },
      { name: 'Shoulder Press', muscle: 'Shoulders' },
      { name: 'Biceps Curl', muscle: 'Biceps' },
      { name: 'Triceps Pushdown', muscle: 'Triceps' }
    ]
  },
  {
    name: 'Lower Body Strength', type: 'Legs & glutes', time: '40 min', icon: 'barbell',
    exercises: [
      { name: 'Barbell Back Squat', muscle: 'Legs' },
      { name: 'Romanian Deadlift', muscle: 'Hamstrings' },
      { name: 'Hip Thrust', muscle: 'Glutes' },
      { name: 'Calf Raise', muscle: 'Calves' }
    ]
  },
  {
    name: 'Push Day', type: 'Chest, shoulders & triceps', time: '40 min', icon: 'bench-press',
    exercises: [
      { name: 'Barbell Bench Press', muscle: 'Chest' },
      { name: 'Shoulder Press', muscle: 'Shoulders' },
      { name: 'Triceps Pushdown', muscle: 'Triceps' },
      { name: 'Cable Chest Fly', muscle: 'Chest' }
    ]
  },
  {
    name: 'Pull Day', type: 'Back & biceps', time: '40 min', icon: 'lat-pulldown',
    exercises: [
      { name: 'Pull-Up', muscle: 'Back' },
      { name: 'Seated Row', muscle: 'Back' },
      { name: 'Biceps Curl', muscle: 'Biceps' },
      { name: 'Face Pull', muscle: 'Shoulders' }
    ]
  },
  {
    name: 'Glutes & Legs', type: 'Lower body', time: '40 min', icon: 'hip-thrust',
    exercises: [
      { name: 'Hip Thrust', muscle: 'Glutes' },
      { name: 'Bulgarian Split Squat', muscle: 'Legs' },
      { name: 'Seated Leg Curl', muscle: 'Hamstrings' },
      { name: 'Calf Raise', muscle: 'Calves' }
    ]
  },
  {
    name: 'Core Builder', type: 'Core & stability', time: '20 min', icon: 'ab-wheel',
    exercises: [
      { name: 'Plank', muscle: 'Core' },
      { name: 'Dead Bug', muscle: 'Core' },
      { name: 'Sit-Up', muscle: 'Core' },
      { name: 'Cable Crunch', muscle: 'Core' }
    ]
  },
  {
    name: 'Dumbbell Only', type: 'At-home friendly', time: '35 min', icon: 'dumbbell',
    exercises: [
      { name: 'Dumbbell Bench Press', muscle: 'Chest' },
      { name: 'Goblet Squat', muscle: 'Legs' },
      { name: 'Single-Arm Dumbbell Row', muscle: 'Back' },
      { name: 'Lateral Raise', muscle: 'Shoulders' },
      { name: 'Hammer Curl', muscle: 'Biceps' }
    ]
  },
  {
    name: 'Machine Basics', type: 'Gym machines', time: '35 min', icon: 'machine',
    exercises: [
      { name: 'Chest Press', muscle: 'Chest' },
      { name: 'Lat Pulldown', muscle: 'Back' },
      { name: 'Leg Press', muscle: 'Legs' },
      { name: 'Shoulder Press', muscle: 'Shoulders' },
      { name: 'Seated Leg Curl', muscle: 'Hamstrings' }
    ]
  },
  {
    name: 'Cardio Starter', type: 'Low-impact cardio', time: '25 min', icon: 'treadmill',
    exercises: [
      { name: 'Treadmill Walk', muscle: 'Legs' },
      { name: 'Stationary Bike', muscle: 'Legs' },
      { name: 'Stair Climber', muscle: 'Legs' }
    ]
  },
  {
    name: 'Quick 20-Min Circuit', type: 'Full body', time: '20 min', icon: 'timer',
    exercises: [
      { name: 'Push-Up', muscle: 'Chest' },
      { name: 'Goblet Squat', muscle: 'Legs' },
      { name: 'Dumbbell Row', muscle: 'Back' },
      { name: 'Plank', muscle: 'Core' }
    ]
  },
  {
    name: 'Back & Biceps Blitz', type: 'Upper body', time: '35 min', icon: 'lat-pulldown',
    exercises: [
      { name: 'Barbell Row', muscle: 'Back' },
      { name: 'Pull-Up', muscle: 'Back' },
      { name: 'Dumbbell Curl', muscle: 'Biceps' },
      { name: 'Seated Row', muscle: 'Back' },
      { name: 'Hammer Curl', muscle: 'Biceps' },
      { name: 'Face Pull', muscle: 'Shoulders' }
    ]
  }
];

const personalProgram = {
  id: 'weekly-beginner-v1',
  ownerAccountKey: '89c029b6945267ddffbef6106a1ba4c8ffa156d0e3808730f094ce7fb15565d1',
  name: 'Weekly Beginner Workout Plan',
  instructions: [
    'For the first one or two weeks, keep the weights comfortable while learning each movement.',
    'Use slow, controlled repetitions and good technique.',
    'Stop each set before you reach the point where you physically cannot move the weight.',
    'When you comfortably reach the top of the rep range with good form, increase the weight by a small amount next time.',
    'Record the weight and repetitions for every exercise.'
  ],
  plans: [
    {
      id: 'beginner-upper-a', name: 'Upper Body A', day: 'Monday', type: 'Upper body', time: '45-55 min', icon: 'upper-body-tower', personal: true,
      exercises: [
        { name: 'Chest Press', muscle: 'Chest', sets: 3, repRange: [8, 12], note: 'Use the machine chest press.' },
        { name: 'Lat Pulldown', muscle: 'Back', sets: 3, repRange: [8, 12] },
        { name: 'Seated Row', muscle: 'Back', sets: 3, repRange: [8, 12], note: 'Use a seated cable or row machine.' },
        { name: 'Shoulder Press', muscle: 'Shoulders', sets: 2, repRange: [8, 12], note: 'Use the shoulder press machine.' },
        { name: 'Pec Deck', muscle: 'Chest', sets: 2, repRange: [10, 15], note: 'A machine chest fly is an equivalent option.' },
        { name: 'Biceps Curl', muscle: 'Biceps', sets: 2, repRange: [10, 15] },
        { name: 'Triceps Pushdown', muscle: 'Triceps', sets: 2, repRange: [10, 15] }
      ]
    },
    {
      id: 'beginner-lower-a', name: 'Lower Body A', day: 'Tuesday', type: 'Lower body', time: '40-50 min', icon: 'machine', personal: true,
      exercises: [
        { name: 'Leg Press', muscle: 'Legs', sets: 3, repRange: [8, 12] },
        { name: 'Seated Leg Curl', muscle: 'Hamstrings', sets: 3, repRange: [10, 15] },
        { name: 'Leg Extension', muscle: 'Legs', sets: 2, repRange: [10, 15] },
        { name: 'Hip Abductor Machine', muscle: 'Glutes', sets: 2, repRange: [10, 15], note: 'Targets the side glutes (gluteus medius and minimus).' },
        { name: 'Calf Raise', muscle: 'Calves', sets: 3, repRange: [10, 15] },
        { name: 'Ab Crunch Machine', muscle: 'Core', sets: 2, repRange: [10, 15] }
      ]
    },
    {
      id: 'beginner-upper-b', name: 'Upper Body B', day: 'Thursday', type: 'Upper body', time: '45-55 min', icon: 'dumbbell', personal: true,
      exercises: [
        { name: 'Incline Dumbbell Press', muscle: 'Chest', sets: 3, repRange: [8, 12] },
        { name: 'Lat Pulldown', muscle: 'Back', sets: 3, repRange: [8, 12] },
        { name: 'Seated Row', muscle: 'Back', sets: 3, repRange: [8, 12] },
        { name: 'Lateral Raise', muscle: 'Shoulders', sets: 2, repRange: [10, 15], note: 'Use dumbbells.' },
        { name: 'Reverse Pec Deck', muscle: 'Shoulders', sets: 2, repRange: [10, 15] },
        { name: 'Biceps Curl', muscle: 'Biceps', sets: 2, repRange: [10, 15], note: 'Use dumbbells or a machine, but keep the same option when comparing progress.' },
        { name: 'Triceps Pushdown', muscle: 'Triceps', sets: 2, repRange: [10, 15] }
      ]
    },
    {
      id: 'beginner-lower-b', name: 'Lower Body B', day: 'Friday', type: 'Lower body', time: '45-55 min', icon: 'barbell', personal: true,
      exercises: [
        { name: 'Leg Press', muscle: 'Legs', sets: 3, repRange: [10, 12] },
        { name: 'Dumbbell Romanian Deadlift', muscle: 'Hamstrings', sets: 3, repRange: [8, 12] },
        { name: 'Leg Extension', muscle: 'Legs', sets: 2, repRange: [10, 15] },
        { name: 'Seated Leg Curl', muscle: 'Hamstrings', sets: 2, repRange: [10, 15], note: 'A lying leg curl is an equivalent option.' },
        { name: 'Calf Raise', muscle: 'Calves', sets: 3, repRange: [10, 15] },
        { name: 'Ab Crunch Machine', muscle: 'Core', sets: 2, repRange: [10, 15] }
      ]
    }
  ],
  schedule: [
    { id: 'monday-upper-a', day: 'Monday', planId: 'beginner-upper-a' },
    { id: 'tuesday-lower-a', day: 'Tuesday', planId: 'beginner-lower-a' },
    { day: 'Wednesday', rest: 'Rest or easy walking. No lifting workout.' },
    { id: 'thursday-upper-b', day: 'Thursday', planId: 'beginner-upper-b' },
    { id: 'friday-lower-b', day: 'Friday', planId: 'beginner-lower-b' },
    { day: 'Saturday', rest: 'Rest or optional light cardio, such as easy walking.' },
    { day: 'Sunday', rest: 'Complete rest so you are recovered for Monday.' }
  ]
};

const exerciseTargets = {
  'Dumbbell Bench Press': { primary: ['Chest'], assists: ['Shoulders', 'Triceps'] },
  'Goblet Squat': { primary: ['Legs', 'Glutes'], assists: ['Hamstrings', 'Core'] },
  'Lat Pulldown': { primary: ['Back'], assists: ['Biceps'] },
  'Plank': { primary: ['Core'], assists: ['Shoulders', 'Glutes'] },
  'Chest Press': { primary: ['Chest'], assists: ['Shoulders', 'Triceps'] },
  'Leg Press': { primary: ['Legs', 'Glutes'], assists: ['Hamstrings'] },
  'Seated Row': { primary: ['Back'], assists: ['Biceps', 'Shoulders'] },
  'Shoulder Press': { primary: ['Shoulders'], assists: ['Triceps'] },
  'Barbell Bench Press': { primary: ['Chest'], assists: ['Shoulders', 'Triceps'] },
  'Biceps Curl': { primary: ['Biceps'], assists: [] },
  'Triceps Pushdown': { primary: ['Triceps'], assists: [] },
  'Barbell Back Squat': { primary: ['Legs', 'Glutes'], assists: ['Hamstrings', 'Core'] },
  'Romanian Deadlift': { primary: ['Hamstrings', 'Glutes'], assists: ['Spinal erectors', 'Core'] },
  'Hip Thrust': { primary: ['Glutes'], assists: ['Hamstrings'] },
  'Calf Raise': { primary: ['Calves'], assists: [] },
  'Cable Chest Fly': { primary: ['Chest'], assists: ['Shoulders'] },
  'Pull-Up': { primary: ['Back'], assists: ['Biceps'] },
  'Face Pull': { primary: ['Shoulders', 'Back'], assists: ['Biceps'] },
  'Bulgarian Split Squat': { primary: ['Legs', 'Glutes'], assists: ['Hamstrings', 'Core'] },
  'Seated Leg Curl': { primary: ['Hamstrings'], assists: ['Calves'] },
  'Dead Bug': { primary: ['Core'], assists: [] },
  'Sit-Up': { primary: ['Core'], assists: ['Hip flexors'] },
  'Cable Crunch': { primary: ['Core'], assists: [] },
  'Single-Arm Dumbbell Row': { primary: ['Back'], assists: ['Biceps', 'Shoulders'] },
  'Lateral Raise': { primary: ['Shoulders'], assists: [] },
  'Hammer Curl': { primary: ['Biceps'], assists: ['Forearms'] },
  'Treadmill Walk': { primary: ['Legs', 'Glutes', 'Calves'], assists: [] },
  'Stationary Bike': { primary: ['Legs', 'Glutes'], assists: ['Hamstrings', 'Calves'] },
  'Stair Climber': { primary: ['Legs', 'Glutes', 'Calves'], assists: ['Hamstrings'] },
  'Push-Up': { primary: ['Chest'], assists: ['Shoulders', 'Triceps'] },
  'Dumbbell Row': { primary: ['Back'], assists: ['Biceps', 'Shoulders'] },
  'Pec Deck': { primary: ['Chest'], assists: ['Shoulders'] },
  'Leg Extension': { primary: ['Legs'], assists: [] },
  'Hip Abductor Machine': { primary: ['Glutes'], assists: [] },
  'Ab Crunch Machine': { primary: ['Core'], assists: [] },
  'Incline Dumbbell Press': { primary: ['Chest'], assists: ['Shoulders', 'Triceps'] },
  'Reverse Pec Deck': { primary: ['Shoulders'], assists: ['Back'] },
  'Dumbbell Romanian Deadlift': { primary: ['Hamstrings', 'Glutes'], assists: ['Spinal erectors', 'Core'] }
};

const exerciseCatalog = [
  ['Barbell Bench Press', 'Chest', 'Barbell', ['Chest'], ['Shoulders', 'Triceps']],
  ['Incline Barbell Bench Press', 'Chest', 'Barbell', ['Chest'], ['Shoulders', 'Triceps']],
  ['Decline Barbell Bench Press', 'Chest', 'Barbell', ['Chest'], ['Triceps']],
  ['Smith Machine Bench Press', 'Chest', 'Smith machine', ['Chest'], ['Shoulders', 'Triceps']],
  ['Dumbbell Bench Press', 'Chest', 'Dumbbells', ['Chest'], ['Shoulders', 'Triceps']],
  ['Incline Dumbbell Press', 'Chest', 'Dumbbells', ['Chest'], ['Shoulders', 'Triceps']],
  ['Chest Press', 'Chest', 'Machine', ['Chest'], ['Shoulders', 'Triceps']],
  ['Incline Chest Press Machine', 'Chest', 'Machine', ['Chest'], ['Shoulders', 'Triceps']],
  ['Pec Deck', 'Chest', 'Machine', ['Chest'], ['Shoulders']],
  ['Cable Chest Fly', 'Chest', 'Cable', ['Chest'], ['Shoulders']],
  ['Push-Up', 'Chest', 'Bodyweight', ['Chest'], ['Shoulders', 'Triceps']],

  ['Lat Pulldown', 'Back', 'Cable / machine', ['Back'], ['Biceps']],
  ['Close-Grip Lat Pulldown', 'Back', 'Cable / machine', ['Back'], ['Biceps']],
  ['Assisted Pull-Up', 'Back', 'Machine', ['Back'], ['Biceps']],
  ['Pull-Up', 'Back', 'Bodyweight', ['Back'], ['Biceps']],
  ['Chin-Up', 'Back', 'Bodyweight', ['Back'], ['Biceps']],
  ['Seated Row', 'Back', 'Machine', ['Back'], ['Biceps', 'Shoulders']],
  ['Seated Cable Row', 'Back', 'Cable', ['Back'], ['Biceps', 'Shoulders']],
  ['Chest-Supported Row', 'Back', 'Machine / dumbbells', ['Back'], ['Biceps', 'Shoulders']],
  ['T-Bar Row', 'Back', 'Plate loaded', ['Back'], ['Biceps']],
  ['Barbell Row', 'Back', 'Barbell', ['Back'], ['Biceps', 'Core']],
  ['Single-Arm Dumbbell Row', 'Back', 'Dumbbell', ['Back'], ['Biceps', 'Shoulders']],
  ['Straight-Arm Pulldown', 'Back', 'Cable', ['Back'], ['Triceps']],
  ['Back Extension', 'Back', 'Bodyweight / machine', ['Back'], ['Hamstrings', 'Glutes']],

  ['Shoulder Press', 'Shoulders', 'Machine', ['Shoulders'], ['Triceps']],
  ['Machine Shoulder Press', 'Shoulders', 'Machine', ['Shoulders'], ['Triceps']],
  ['Dumbbell Shoulder Press', 'Shoulders', 'Dumbbells', ['Shoulders'], ['Triceps']],
  ['Arnold Press', 'Shoulders', 'Dumbbells', ['Shoulders'], ['Triceps']],
  ['Lateral Raise', 'Shoulders', 'Dumbbells', ['Shoulders'], []],
  ['Cable Lateral Raise', 'Shoulders', 'Cable', ['Shoulders'], []],
  ['Rear Delt Fly', 'Shoulders', 'Dumbbells', ['Shoulders'], ['Back']],
  ['Reverse Pec Deck', 'Shoulders', 'Machine', ['Shoulders'], ['Back']],
  ['Face Pull', 'Shoulders', 'Cable', ['Shoulders', 'Back'], ['Biceps']],
  ['Front Raise', 'Shoulders', 'Dumbbell / plate', ['Shoulders'], []],
  ['Dumbbell Shrug', 'Shoulders', 'Dumbbells', ['Shoulders', 'Back'], []],

  ['Biceps Curl', 'Arms', 'Machine', ['Biceps'], []],
  ['Dumbbell Curl', 'Arms', 'Dumbbells', ['Biceps'], []],
  ['Hammer Curl', 'Arms', 'Dumbbells', ['Biceps'], []],
  ['Preacher Curl', 'Arms', 'EZ-bar', ['Biceps'], []],
  ['Preacher Curl Machine', 'Arms', 'Machine', ['Biceps'], []],
  ['Cable Curl', 'Arms', 'Cable', ['Biceps'], []],
  ['EZ-Bar Curl', 'Arms', 'EZ-bar', ['Biceps'], []],
  ['Concentration Curl', 'Arms', 'Dumbbell', ['Biceps'], []],
  ['Triceps Pushdown', 'Arms', 'Cable', ['Triceps'], []],
  ['Rope Triceps Pushdown', 'Arms', 'Cable', ['Triceps'], []],
  ['Overhead Cable Triceps Extension', 'Arms', 'Cable', ['Triceps'], []],
  ['Dumbbell Triceps Extension', 'Arms', 'Dumbbell', ['Triceps'], []],
  ['Skull Crusher', 'Arms', 'EZ-bar / dumbbells', ['Triceps'], []],
  ['Assisted Dip', 'Arms', 'Machine', ['Triceps', 'Chest'], ['Shoulders']],
  ['Dip', 'Arms', 'Bodyweight', ['Triceps', 'Chest'], ['Shoulders']],

  ['Barbell Back Squat', 'Legs', 'Barbell', ['Legs', 'Glutes'], ['Hamstrings', 'Core']],
  ['Front Squat', 'Legs', 'Barbell', ['Legs'], ['Glutes', 'Core']],
  ['Goblet Squat', 'Legs', 'Dumbbell / kettlebell', ['Legs', 'Glutes'], ['Hamstrings', 'Core']],
  ['Smith Machine Squat', 'Legs', 'Smith machine', ['Legs', 'Glutes'], ['Hamstrings']],
  ['Hack Squat', 'Legs', 'Machine', ['Legs', 'Glutes'], ['Hamstrings']],
  ['Leg Press', 'Legs', 'Machine', ['Legs', 'Glutes'], ['Hamstrings']],
  ['Single-Leg Press', 'Legs', 'Machine', ['Legs', 'Glutes'], ['Hamstrings']],
  ['Leg Extension', 'Legs', 'Machine', ['Legs'], []],
  ['Seated Leg Curl', 'Legs', 'Machine', ['Hamstrings'], ['Calves']],
  ['Lying Leg Curl', 'Legs', 'Machine', ['Hamstrings'], ['Calves']],
  ['Romanian Deadlift', 'Legs', 'Barbell', ['Hamstrings', 'Glutes'], ['Back', 'Core']],
  ['Dumbbell Romanian Deadlift', 'Legs', 'Dumbbells', ['Hamstrings', 'Glutes'], ['Back', 'Core']],
  ['Conventional Deadlift', 'Legs', 'Barbell', ['Hamstrings', 'Glutes', 'Back'], ['Legs', 'Core']],
  ['Walking Lunge', 'Legs', 'Dumbbells / bodyweight', ['Legs', 'Glutes'], ['Hamstrings', 'Core']],
  ['Reverse Lunge', 'Legs', 'Dumbbells / bodyweight', ['Legs', 'Glutes'], ['Hamstrings', 'Core']],
  ['Bulgarian Split Squat', 'Legs', 'Dumbbells / bodyweight', ['Legs', 'Glutes'], ['Hamstrings', 'Core']],
  ['Step-Up', 'Legs', 'Dumbbells / bodyweight', ['Legs', 'Glutes'], ['Hamstrings']],
  ['Calf Raise', 'Legs', 'Machine / bodyweight', ['Calves'], []],
  ['Seated Calf Raise', 'Legs', 'Machine', ['Calves'], []],

  ['Hip Thrust', 'Glutes', 'Barbell / machine', ['Glutes'], ['Hamstrings']],
  ['Smith Machine Hip Thrust', 'Glutes', 'Smith machine', ['Glutes'], ['Hamstrings']],
  ['Glute Drive Machine', 'Glutes', 'Machine', ['Glutes'], ['Hamstrings']],
  ['Glute Bridge', 'Glutes', 'Bodyweight / barbell', ['Glutes'], ['Hamstrings', 'Core']],
  ['Hip Abductor Machine', 'Glutes', 'Machine', ['Glutes'], []],
  ['Hip Adductor Machine', 'Glutes', 'Machine', ['Legs'], ['Glutes']],
  ['Cable Kickback', 'Glutes', 'Cable', ['Glutes'], ['Hamstrings']],
  ['Sumo Deadlift', 'Glutes', 'Barbell', ['Glutes', 'Hamstrings'], ['Legs', 'Back', 'Core']],

  ['Ab Crunch Machine', 'Core', 'Machine', ['Core'], []],
  ['Cable Crunch', 'Core', 'Cable', ['Core'], []],
  ['Sit-Up', 'Core', 'Bodyweight', ['Core'], []],
  ['Hanging Knee Raise', 'Core', 'Bodyweight', ['Core'], []],
  ['Captain\'s Chair Leg Raise', 'Core', 'Machine / bodyweight', ['Core'], []],
  ['Dead Bug', 'Core', 'Bodyweight', ['Core'], []],
  ['Ab Wheel Rollout', 'Core', 'Ab wheel', ['Core'], ['Shoulders']],
  ['Russian Twist', 'Core', 'Bodyweight / medicine ball', ['Core'], []],
  ['Pallof Press', 'Core', 'Cable', ['Core'], ['Shoulders']]
].map(([name, category, equipment, primary, assists]) => ({
  id: `exercise-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
  name,
  category,
  equipment,
  primary,
  assists
}));

const muscleMaps = {
  Chest: {
    label: 'Chest', anatomy: 'Pectoralis major',
    description: 'The left and right pectoralis major are traced as two separate muscles.',
    views: [
      { side: 'Front', image: 'MaleBodyFront.png', crop: 'upper', focus: 'chest-focus', pieces: ['pec-left', 'pec-right'] }
    ]
  },
  Shoulders: {
    label: 'Shoulders', anatomy: 'Anterior, lateral & posterior deltoids',
    description: 'Front and back views show the visible deltoid heads without covering the chest or upper arms.',
    views: [
      { side: 'Front', image: 'MaleBodyFront.png', crop: 'upper', focus: 'shoulder-front-focus', pieces: ['deltoid-left', 'deltoid-right'] },
      { side: 'Back', image: 'MaleBodyBack.png', crop: 'upper', focus: 'shoulder-rear-focus', pieces: ['rear-deltoid-left', 'rear-deltoid-right'] }
    ]
  },
  Back: {
    label: 'Back', anatomy: 'Latissimus dorsi',
    description: 'The left and right lats are shown. Rows also recruit the middle trapezius and rhomboids beneath the surface.',
    views: [
      { side: 'Back', image: 'MaleBodyBack.png', crop: 'upper', focus: 'back-focus', pieces: ['lat-left', 'lat-right'] }
    ]
  },
  Legs: {
    label: 'Quadriceps', anatomy: 'Rectus femoris, vastus lateralis & vastus medialis',
    description: 'Each thigh is divided into three visible quadriceps regions instead of one broad leg shape.',
    views: [
      { side: 'Front', image: 'MaleBodyFront.png', crop: 'lower', focus: 'quad-focus', pieces: ['vl-left', 'rf-left', 'vm-left', 'vm-right', 'rf-right', 'vl-right'] }
    ]
  },
  Core: {
    label: 'Core / Abs', anatomy: 'Rectus abdominis & external obliques',
    description: 'Six visible abdominal sections and the two external obliques are separated. Deeper core stabilizers are not visible.',
    views: [
      { side: 'Front', image: 'MaleBodyFront.png', crop: 'upper', focus: 'core-focus', pieces: ['piece1', 'piece2', 'piece3', 'piece4', 'piece5', 'piece6', 'oblique-left', 'oblique-right'] }
    ]
  },
  Biceps: {
    label: 'Biceps', anatomy: 'Biceps brachii',
    description: 'The muscle belly on each upper arm is shown without extending into the elbow or forearm.',
    views: [
      { side: 'Front', image: 'MaleBodyFront.png', crop: 'upper', focus: 'biceps-focus', pieces: ['biceps-left', 'biceps-right'] }
    ]
  },
  Triceps: {
    label: 'Triceps', anatomy: 'Triceps brachii',
    description: 'The posterior upper-arm muscles are shown separately on the left and right sides.',
    views: [
      { side: 'Back', image: 'MaleBodyBack.png', crop: 'upper', focus: 'triceps-focus', pieces: ['triceps-left', 'triceps-right'] }
    ]
  },
  Glutes: {
    label: 'Glutes', anatomy: 'Gluteus maximus',
    description: 'The mask marks the anatomical location of each gluteus maximus beneath the shorts in this image.',
    views: [
      { side: 'Back', image: 'MaleBodyBack.png', crop: 'lower', focus: 'glute-focus', pieces: ['glute-left', 'glute-right'] }
    ]
  },
  Hamstrings: {
    label: 'Hamstrings', anatomy: 'Biceps femoris & medial hamstrings',
    description: 'The lateral and medial hamstring regions are separated on both thighs.',
    views: [
      { side: 'Back', image: 'MaleBodyBack.png', crop: 'lower', focus: 'hamstring-focus', pieces: ['ham-lateral-left', 'ham-medial-left', 'ham-lateral-right', 'ham-medial-right'] }
    ]
  },
  Calves: {
    label: 'Calves', anatomy: 'Gastrocnemius - lateral & medial heads',
    description: 'Both visible heads of the gastrocnemius are separated on each lower leg.',
    views: [
      { side: 'Back', image: 'MaleBodyBack.png', crop: 'calf', focus: 'calf-focus', pieces: ['calf-lateral-left', 'calf-medial-left', 'calf-lateral-right', 'calf-medial-right'] }
    ]
  }
};

const rankLadder = [
  { name: 'Foundation', band: 'Top 70–100%', minimum: 0, asset: 'foundation' },
  { name: 'Iron', band: 'Top 50–70%', minimum: 35, asset: 'iron' },
  { name: 'Bronze', band: 'Top 35–50%', minimum: 50, asset: 'bronze' },
  { name: 'Silver', band: 'Top 20–35%', minimum: 65, asset: 'silver' },
  { name: 'Gold', band: 'Top 10–20%', minimum: 78, asset: 'gold' },
  { name: 'Platinum', band: 'Top 5–10%', minimum: 88, asset: 'platinum' },
  { name: 'Diamond', band: 'Top 1–5%', minimum: 94, asset: 'diamond' },
  { name: 'Champion', band: 'Top 0.1–1%', minimum: 98, asset: 'champion' },
  { name: 'Mythic', band: 'Top 0.001–0.1%', minimum: 99.9, asset: 'mythic' },
  { name: 'Apex', band: 'Top 0.000001–0.001%', minimum: 99.999, asset: 'apex' }
];

// A free, offline-friendly gym picker with recognizable national brands and
// common local gym types. Selecting an item sets it as the person's home gym.
const popularGymCatalog = [
  'Planet Fitness', 'Anytime Fitness', 'LA Fitness', 'Esporta Fitness', 'Crunch Fitness',
  'Crunch Signature', 'Gold\'s Gym', '24 Hour Fitness', 'Life Time', 'EOS Fitness',
  'VASA Fitness', 'Chuze Fitness', 'Blink Fitness', 'YouFit Gyms', 'Fitness Connection',
  'Fitness 19', 'Genesis Health Clubs', 'XSport Fitness', 'Retro Fitness', 'City Sports Club',
  'Club Fitness', 'The Edge Fitness Clubs', 'In-Shape Family Fitness', 'California Family Fitness', 'Mountainside Fitness',
  'The Alaska Club', 'Onelife Fitness', 'Merritt Clubs', 'MUV Fitness', 'Healthworks Fitness',
  'The Bay Club', 'Equinox', 'Chelsea Piers Fitness', 'Powerhouse Gym', 'World Gym',
  'Snap Fitness', 'Workout Anytime', 'Curves', 'Burn Boot Camp', 'Orangetheory Fitness',
  'F45 Training', 'D1 Training', 'Iron Tribe Fitness', 'The Camp Transformation Center', 'UFC Gym',
  'TITLE Boxing Club', '9Round', 'iLoveKickboxing', 'HOTWORX', 'Jazzercise',
  'SoulCycle', 'CycleBar', 'Club Pilates', 'Pure Barre', 'solidcore',
  'Barry\'s', 'CrossFit affiliate', 'YMCA', 'YWCA', 'Jewish Community Center fitness center',
  'The Bar Method', 'The Dailey Method', 'Row House', 'AKT', 'Rumble Boxing',
  'StretchLab', 'BFT', 'MADabolic', 'SWEAT440', 'BASECAMP Fitness',
  'The Exercise Coach', 'TruFusion', 'VillaSport Athletic Club', 'The Sport Club', 'Local independent gym',
  'Local 24-hour gym', 'Local strength and conditioning gym', 'Local powerlifting gym', 'Local bodybuilding gym', 'Local women\'s gym',
  'Local family fitness center', 'Local athletic club', 'Local sports performance gym', 'Local CrossFit-style gym', 'Local climbing gym',
  'Local boxing gym', 'Local MMA gym', 'Local yoga studio', 'Local Pilates studio', 'Local spin studio',
  'Local bootcamp studio', 'Local personal-training studio', 'Local wellness club', 'Community recreation center', 'Parks and recreation fitness center',
  'University recreation center', 'Corporate fitness center', 'Apartment or condo gym', 'Hotel gym', 'Military fitness center'
];

const minimumRankWorkouts = 8;
const minimumMuscleSessions = 3;

function loadHistory() {
  return localStorageReadArray(historyStorageKey());
}

function saveHistory(history = workoutHistory) {
  return localStorageWriteArray(historyStorageKey(), history);
}

const ACTIVE_WORKOUT_KEY = 'levelUpFitnessActiveWorkout';
const USER_PROFILE_KEY = 'levelUpFitnessUserProfile';
const WORKOUT_HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
const CLOUD_WORKOUT_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
const CLOUD_PROFILE_CACHE_PREFIX = 'levelUpFitnessCloudProfile:';
const LAST_PAGE_KEY = 'levelUpFitnessLastPage';
const PENDING_CLOUD_SESSIONS_KEY = 'levelUpFitnessPendingCloudSessions';
const PENDING_CLOUD_SESSIONS_PREFIX = 'levelUpFitnessPendingCloudSessions:';
const LEGACY_ACCOUNT_STORAGE_MIGRATION_PREFIX = 'levelUpFitnessAccountStorageMigrated:';
const LEGACY_ACCOUNT_STORAGE_OWNER_KEY = 'levelUpFitnessLegacyStorageOwner';
const CUSTOM_WORKOUT_DRAFT_PREFIX = 'levelUpFitnessCustomWorkoutDraft:';
const MAX_CUSTOM_WORKOUTS = 12;
const MAX_CUSTOM_EXERCISES = 20;
const MINUTE_MS = 60 * 1000;
const MAX_COUNTED_WORKOUT_MINUTES = 8 * 60;
const supabaseSettings = globalThis.LEVEL_UP_SUPABASE || {};
let supabaseClient = null;
let cloudUser = null;
let cloudReady = false;
let cloudSessionHydration = null;
let cloudSessionHydrationUserId = '';
let cloudSessionUserId = '';
let cloudAuthEpoch = 0;
let cloudProfileSaveQueue = Promise.resolve();

function loadAccountHistory(userId = cloudUser?.id) {
  return userId ? localStorageReadArray(`${CLOUD_WORKOUT_HISTORY_PREFIX}${userId}`) : [];
}

function historyOwnerId() {
  return cloudUser?.id || userProfile?.cloudUserId || '';
}

function historyStorageKey(userId = historyOwnerId()) {
  return userId ? `${CLOUD_WORKOUT_HISTORY_PREFIX}${userId}` : WORKOUT_HISTORY_KEY;
}

function pendingCloudSessionsKey(userId = historyOwnerId()) {
  return userId ? `${PENDING_CLOUD_SESSIONS_PREFIX}${userId}` : PENDING_CLOUD_SESSIONS_KEY;
}

function supabaseConfigured() {
  return Boolean(globalThis.supabase?.createClient && supabaseSettings.url && supabaseSettings.publishableKey);
}

function getSupabaseClient() {
  if (!supabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = globalThis.supabase.createClient(supabaseSettings.url, supabaseSettings.publishableKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });
  }
  return supabaseClient;
}

function isoFromMs(value) {
  const time = Number(value) || Date.now();
  return new Date(time).toISOString();
}

function msFromIso(value) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : 0;
}

function validTimestamp(value) {
  const time = Number(value);
  return Number.isFinite(time) && time > 0 ? time : 0;
}

function calculatedWorkoutDurationMinutes(startedAt, completedAt) {
  const start = validTimestamp(startedAt);
  const end = validTimestamp(completedAt);
  if (!start || !end || end < start) return 0;
  return Math.max(1, Math.round((end - start) / MINUTE_MS));
}

function storedWorkoutDurationMinutes(session) {
  const stored = Number(session?.durationMinutes);
  if (Number.isFinite(stored) && stored > 0) return Math.round(stored);
  return calculatedWorkoutDurationMinutes(session?.startedAt, session?.completedAt);
}

function sessionDurationMinutes(session) {
  const minutes = storedWorkoutDurationMinutes(session);
  return minutes > 0 && minutes <= MAX_COUNTED_WORKOUT_MINUTES ? minutes : 0;
}

function gymTimeSummary(history = workoutHistory) {
  return (history || []).reduce((summary, session) => {
    const storedMinutes = storedWorkoutDurationMinutes(session);
    if (!storedMinutes) return summary;
    if (storedMinutes > MAX_COUNTED_WORKOUT_MINUTES) {
      summary.needsReview += 1;
      return summary;
    }
    summary.minutes += storedMinutes;
    summary.sessions += 1;
    return summary;
  }, { minutes: 0, sessions: 0, needsReview: 0 });
}

function formatDurationCompact(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes}m`;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatDurationLong(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0));
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${minutes} min`;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function durationAriaLabel(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const parts = [];
  if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (remainingMinutes || !parts.length) parts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`);
  return parts.join(' ');
}

function durationIso(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `PT${hours ? `${hours}H` : ''}${remainingMinutes || !hours ? `${remainingMinutes}M` : ''}`;
}

function formatElapsedClock(elapsedMilliseconds) {
  const totalSeconds = Math.max(0, Math.floor((Number(elapsedMilliseconds) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function localStorageReadArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function localStorageWriteArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function loadActiveWorkoutDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(ACTIVE_WORKOUT_KEY) || 'null');
    return draft && [1, 2, 3].includes(draft.version) && typeof draft.planId === 'string' && Array.isArray(draft.logs) ? draft : null;
  } catch {
    return null;
  }
}

function writeActiveWorkoutDraft(draft) {
  try {
    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function clearActiveWorkoutDraft() {
  try {
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
  } catch {
    // The in-memory workout can still be cleared if storage is unavailable.
  }
}

function loadUserProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_PROFILE_KEY) || 'null');
    return saved && typeof saved.name === 'string' && typeof saved.email === 'string' ? saved : null;
  } catch {
    return null;
  }
}

function profileCacheKey(userId) {
  return userId ? `${CLOUD_PROFILE_CACHE_PREFIX}${userId}` : '';
}

function loadCloudProfileCache(userId) {
  const key = profileCacheKey(userId);
  if (!key) return null;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    return saved && saved.cloudUserId === userId && typeof saved.email === 'string' ? saved : null;
  } catch {
    return null;
  }
}

function saveUserProfile() {
  try {
    if (userProfile) localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
    else localStorage.removeItem(USER_PROFILE_KEY);
    if (userProfile?.cloudUserId) {
      localStorage.setItem(profileCacheKey(userProfile.cloudUserId), JSON.stringify(userProfile));
    }
    return true;
  } catch {
    return false;
  }
}

function rememberedPage() {
  try {
    const page = sessionStorage.getItem(LAST_PAGE_KEY) || '';
    return ['home', 'workout', 'progress', 'profile', 'builder', 'active'].includes(page) ? page : 'home';
  } catch {
    return 'home';
  }
}

function rememberPage(page) {
  try {
    sessionStorage.setItem(LAST_PAGE_KEY, page);
  } catch {
    // The app still works if a browser blocks session storage.
  }
}

async function accountKeyFor(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalizedEmail);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function ensureUserAccountKey() {
  if (!userProfile || userProfile.accountKey || !globalThis.crypto?.subtle) return;
  try {
    userProfile.accountKey = await accountKeyFor(userProfile.email);
    saveUserProfile();
  } catch {
    userProfile.accountKey = '';
  }
}

let selectedPlan = null;
let activePlan = null;
let activeStartedAt = 0;
let activeSessionId = '';
let activeScheduleContext = null;
let workoutTimerInterval = null;
let restTimerInterval = null;
let restTimerEndsAt = 0;
let logs = [];
let userProfile = loadUserProfile();
let workoutHistory = loadHistory();
let pendingProfilePhoto = '';
let pendingHomeGym = null;
let gymCatalogOpen = false;
let builderName = '';
let builderExercises = [];
let builderEditingId = '';
let builderLoaded = false;
let serviceWorkerRegistration = null;
let appUpdateReloadPending = false;
let lastAppUpdateCheck = 0;
let currentPage = 'home';
let startupRememberedPage = 'home';
let startupPageResolved = false;
let userNavigatedDuringStartup = false;
const el = id => document.getElementById(id);
const muscleLabel = muscle => muscleMaps[muscle]?.label || muscle;
const profileFor = exercise => Array.isArray(exercise?.primary) && exercise.primary.length
  ? { primary: exercise.primary, assists: Array.isArray(exercise.assists) ? exercise.assists : [] }
  : exerciseTargets[exercise?.targetKey || exercise?.name] || {
      primary: exercise?.muscle ? [exercise.muscle] : [],
      assists: []
    };
const planIdFor = plan => plan.id || `library-${plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
const personalProgramForCurrentUser = () => userProfile?.accountKey === personalProgram.ownerAccountKey ? personalProgram : null;
const visiblePlans = () => [...customPlansForCurrentUser(), ...(personalProgramForCurrentUser()?.plans || []), ...plans];
const findVisiblePlan = id => visiblePlans().find(plan => planIdFor(plan) === id) || null;
const setCountFor = exercise => Number.isInteger(exercise.sets) && exercise.sets > 0 ? exercise.sets : 3;
const durationBasedExercises = new Set(['Plank', 'Treadmill Walk', 'Stationary Bike', 'Stair Climber']);
const higherRepExercises = new Set([
  'Biceps Curl', 'Triceps Pushdown', 'Cable Chest Fly', 'Calf Raise', 'Face Pull',
  'Lateral Raise', 'Hammer Curl', 'Dumbbell Curl', 'Pec Deck', 'Leg Extension',
  'Hip Abductor Machine', 'Ab Crunch Machine', 'Reverse Pec Deck', 'Sit-Up',
  'Cable Crunch', 'Dead Bug'
]);
const targetRepRangeFor = exercise => {
  if (Array.isArray(exercise?.repRange)) return sanitizeRepRange(exercise.repRange);
  if (!exercise?.name || durationBasedExercises.has(exercise.name)) return null;
  return higherRepExercises.has(exercise.name) ? [10, 15] : [8, 12];
};
const repRangeFor = exercise => {
  const range = targetRepRangeFor(exercise);
  return range ? `${range[0]}-${range[1]} reps` : 'Track a controlled effort';
};
const totalSetsFor = plan => plan.exercises.reduce((total, exercise) => total + setCountFor(exercise), 0);
const draftAccountKey = () => userProfile?.accountKey || userProfile?.email.trim().toLowerCase() || '';

function createSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `workout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function safeCustomText(value, maximumLength = 80) {
  return typeof value === 'string' ? value.trim().slice(0, maximumLength) : '';
}

function sanitizeMuscleTargets(value) {
  const targets = Array.isArray(value) ? value : [];
  return [...new Set(targets.filter(target => typeof target === 'string' && Object.prototype.hasOwnProperty.call(muscleMaps, target)))];
}

function sanitizeRepRange(value) {
  if (!Array.isArray(value) || value.length !== 2) return [8, 12];
  const minimum = Number(value[0]);
  const maximum = Number(value[1]);
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 1 || maximum > 100 || minimum > maximum) return [8, 12];
  return [minimum, maximum];
}

function catalogExerciseById(id) {
  return exerciseCatalog.find(exercise => exercise.id === id) || null;
}

function sanitizeCustomExercise(value) {
  if (!value || typeof value !== 'object') return null;
  const catalogExercise = catalogExerciseById(value.catalogId);
  const primary = catalogExercise?.primary || sanitizeMuscleTargets(value.primary);
  if (!primary.length) return null;
  const assists = catalogExercise?.assists || sanitizeMuscleTargets(value.assists).filter(target => !primary.includes(target));
  const name = catalogExercise?.name || safeCustomText(value.name, 80);
  if (!name) return null;
  const requestedSets = Number(value.sets);
  return {
    instanceId: safeCustomText(value.instanceId, 100) || `custom-exercise-${createSessionId()}`,
    catalogId: catalogExercise?.id || safeCustomText(value.catalogId, 100),
    name,
    category: catalogExercise?.category || safeCustomText(value.category, 30) || primary[0],
    equipment: catalogExercise?.equipment || safeCustomText(value.equipment, 60) || 'Gym equipment',
    muscle: primary[0],
    primary: [...primary],
    assists: [...assists],
    sets: Number.isInteger(requestedSets) ? Math.min(10, Math.max(1, requestedSets)) : 3,
    repRange: sanitizeRepRange(value.repRange)
  };
}

function estimateCustomWorkoutMinutes(exercises) {
  const totalSets = (exercises || []).reduce((total, exercise) => total + setCountFor(exercise), 0);
  return totalSets ? Math.max(10, Math.round((totalSets * 2.5) / 5) * 5) : 0;
}

function sanitizeCustomPlan(value) {
  if (!value || typeof value !== 'object') return null;
  const id = safeCustomText(value.id, 100);
  const name = safeCustomText(value.name, 50);
  const exercises = (Array.isArray(value.exercises) ? value.exercises : [])
    .slice(0, MAX_CUSTOM_EXERCISES)
    .map(sanitizeCustomExercise)
    .filter(Boolean);
  if (!id.startsWith('custom-') || !name || !exercises.length) return null;
  const estimatedMinutes = estimateCustomWorkoutMinutes(exercises);
  return {
    id,
    custom: true,
    name,
    type: 'Custom workout',
    time: `${estimatedMinutes} min`,
    estimatedMinutes,
    icon: 'dumbbell',
    revision: Math.max(1, Number(value.revision) || 1),
    createdAt: validTimestamp(value.createdAt) || Date.now(),
    updatedAt: validTimestamp(value.updatedAt) || Date.now(),
    exercises
  };
}

function sanitizeCustomPlans(value) {
  const unique = new Map();
  (Array.isArray(value) ? value : []).slice(0, MAX_CUSTOM_WORKOUTS * 2).forEach(candidate => {
    const plan = sanitizeCustomPlan(candidate);
    if (!plan) return;
    const previous = unique.get(plan.id);
    if (!previous || compareCustomPlans(plan, previous) > 0) unique.set(plan.id, plan);
  });
  return [...unique.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CUSTOM_WORKOUTS);
}

function compareCustomPlans(left, right) {
  const revisionDifference = (Number(left?.revision) || 0) - (Number(right?.revision) || 0);
  if (revisionDifference) return revisionDifference;
  const updatedDifference = (validTimestamp(left?.updatedAt) || 0) - (validTimestamp(right?.updatedAt) || 0);
  if (updatedDifference) return updatedDifference;
  return JSON.stringify(left || {}).localeCompare(JSON.stringify(right || {}));
}

function sanitizeCustomWorkoutTombstones(value) {
  const byId = new Map();
  (Array.isArray(value) ? value : []).slice(0, 500).forEach(candidate => {
    const id = safeCustomText(candidate?.id, 100);
    const deletedAt = validTimestamp(candidate?.deletedAt);
    if (!id.startsWith('custom-') || !deletedAt) return;
    const previous = byId.get(id);
    if (!previous || deletedAt > previous.deletedAt) byId.set(id, { id, deletedAt });
  });
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function mergeCustomWorkoutState(localPlans, localTombstones, remotePlans, remoteTombstones) {
  const plansById = new Map();
  [...sanitizeCustomPlans(remotePlans), ...sanitizeCustomPlans(localPlans)].forEach(plan => {
    const previous = plansById.get(plan.id);
    if (!previous || compareCustomPlans(plan, previous) > 0) plansById.set(plan.id, plan);
  });

  const tombstonesById = new Map();
  [...sanitizeCustomWorkoutTombstones(remoteTombstones), ...sanitizeCustomWorkoutTombstones(localTombstones)].forEach(tombstone => {
    const previous = tombstonesById.get(tombstone.id);
    if (!previous || tombstone.deletedAt > previous.deletedAt) tombstonesById.set(tombstone.id, tombstone);
  });

  tombstonesById.forEach((tombstone, id) => {
    const plan = plansById.get(id);
    if (plan && tombstone.deletedAt >= plan.updatedAt) plansById.delete(id);
    else if (plan) tombstonesById.delete(id);
  });

  return {
    customWorkouts: sanitizeCustomPlans([...plansById.values()]),
    customWorkoutTombstones: sanitizeCustomWorkoutTombstones([...tombstonesById.values()])
  };
}

function profileTimestamp(value) {
  const numeric = validTimestamp(value);
  if (numeric) return numeric;
  const parsed = Date.parse(typeof value === 'string' ? value : '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function nextProfileMutationTime(previous = 0) {
  return Math.max(Date.now(), profileTimestamp(previous) + 1);
}

function profileSyncState(profile) {
  const sync = profile?.profileSync && typeof profile.profileSync === 'object' ? profile.profileSync : {};
  return {
    version: 2,
    dirty: Boolean(sync.dirty),
    generation: Math.max(0, Number(sync.generation) || 0),
    homeGymUpdatedAt: profileTimestamp(sync.homeGymUpdatedAt),
    avatarUpdatedAt: profileTimestamp(sync.avatarUpdatedAt),
    customWorkoutTombstones: sanitizeCustomWorkoutTombstones(sync.customWorkoutTombstones)
  };
}

function normalizeHomeGym(value) {
  if (!value || typeof value !== 'object' || !safeCustomText(value.name, 120)) return null;
  return {
    name: safeCustomText(value.name, 120),
    address: safeCustomText(value.address, 180)
  };
}

function normalizeProfileState(source, { fallbackUpdatedAt = 0 } = {}) {
  const value = source && typeof source === 'object' ? source : {};
  const settings = value.home_gym && typeof value.home_gym === 'object' ? value.home_gym : value;
  const sync = profileSyncState(value);
  const fallback = profileTimestamp(value.updated_at) || profileTimestamp(settings.updatedAt) || profileTimestamp(fallbackUpdatedAt);
  const directGym = Object.prototype.hasOwnProperty.call(value, 'homeGym') ? value.homeGym : undefined;
  const settingsGym = Object.prototype.hasOwnProperty.call(settings, 'homeGym')
    ? settings.homeGym
    : (safeCustomText(settings.name, 120) ? { name: settings.name, address: settings.address || '' } : undefined);
  const uploadedAvatarUrl = typeof settings.uploadedAvatarUrl === 'string'
    ? settings.uploadedAvatarUrl
    : (typeof value.uploadedAvatarUrl === 'string' ? value.uploadedAvatarUrl : '');
  return {
    homeGym: normalizeHomeGym(directGym !== undefined ? directGym : settingsGym),
    homeGymUpdatedAt: profileTimestamp(settings.homeGymUpdatedAt) || sync.homeGymUpdatedAt || (normalizeHomeGym(directGym !== undefined ? directGym : settingsGym) ? fallback : 0),
    uploadedAvatarUrl,
    avatarUpdatedAt: profileTimestamp(settings.avatarUpdatedAt) || sync.avatarUpdatedAt || (uploadedAvatarUrl ? fallback : 0),
    customWorkouts: sanitizeCustomPlans(settings.customWorkouts ?? value.customWorkouts),
    customWorkoutTombstones: sanitizeCustomWorkoutTombstones(settings.customWorkoutTombstones ?? sync.customWorkoutTombstones)
  };
}

function chooseProfileField(localValue, localUpdatedAt, remoteValue, remoteUpdatedAt) {
  if (localUpdatedAt > remoteUpdatedAt) return { value: localValue, updatedAt: localUpdatedAt };
  if (remoteUpdatedAt > localUpdatedAt) return { value: remoteValue, updatedAt: remoteUpdatedAt };
  if (!localUpdatedAt && !remoteUpdatedAt) {
    if (remoteValue) return { value: remoteValue, updatedAt: 0 };
    if (localValue) return { value: localValue, updatedAt: 0 };
  }
  return { value: remoteValue, updatedAt: remoteUpdatedAt };
}

function mergeProfileState(localState, remoteState) {
  const local = normalizeProfileState(localState);
  const remote = normalizeProfileState(remoteState);
  const homeGym = chooseProfileField(local.homeGym, local.homeGymUpdatedAt, remote.homeGym, remote.homeGymUpdatedAt);
  const avatar = chooseProfileField(local.uploadedAvatarUrl, local.avatarUpdatedAt, remote.uploadedAvatarUrl, remote.avatarUpdatedAt);
  const custom = mergeCustomWorkoutState(
    local.customWorkouts,
    local.customWorkoutTombstones,
    remote.customWorkouts,
    remote.customWorkoutTombstones
  );
  return {
    homeGym: homeGym.value,
    homeGymUpdatedAt: homeGym.updatedAt,
    uploadedAvatarUrl: avatar.value || '',
    avatarUpdatedAt: avatar.updatedAt,
    ...custom
  };
}

function profileStateFingerprint(state) {
  const normalized = normalizeProfileState(state);
  return JSON.stringify({
    homeGym: normalized.homeGym,
    homeGymUpdatedAt: normalized.homeGymUpdatedAt,
    uploadedAvatarUrl: normalized.uploadedAvatarUrl,
    avatarUpdatedAt: normalized.avatarUpdatedAt,
    customWorkouts: [...normalized.customWorkouts].sort((a, b) => a.id.localeCompare(b.id)),
    customWorkoutTombstones: [...normalized.customWorkoutTombstones].sort((a, b) => a.id.localeCompare(b.id))
  });
}

function applyProfileStateToUserProfile(state, { dirty, generation } = {}) {
  if (!userProfile) return;
  const normalized = normalizeProfileState(state);
  const previousSync = profileSyncState(userProfile);
  userProfile.homeGym = normalized.homeGym;
  userProfile.uploadedAvatarUrl = normalized.uploadedAvatarUrl;
  userProfile.customWorkouts = normalized.customWorkouts;
  userProfile.profileSync = {
    version: 2,
    dirty: dirty === undefined ? previousSync.dirty : Boolean(dirty),
    generation: generation === undefined ? previousSync.generation : Math.max(0, Number(generation) || 0),
    homeGymUpdatedAt: normalized.homeGymUpdatedAt,
    avatarUpdatedAt: normalized.avatarUpdatedAt,
    customWorkoutTombstones: normalized.customWorkoutTombstones
  };
}

function markProfileDirty(field) {
  if (!userProfile) return;
  const sync = profileSyncState(userProfile);
  sync.dirty = true;
  sync.generation += 1;
  if (field === 'homeGym') sync.homeGymUpdatedAt = nextProfileMutationTime(sync.homeGymUpdatedAt);
  if (field === 'avatar') sync.avatarUpdatedAt = nextProfileMutationTime(sync.avatarUpdatedAt);
  userProfile.profileSync = sync;
}

function customPlansForCurrentUser() {
  return sanitizeCustomPlans(userProfile?.customWorkouts);
}

function planSnapshotForDraft(plan) {
  if (!plan || !Array.isArray(plan.exercises) || !plan.exercises.length) return null;
  const exercises = plan.exercises.map(exercise => ({
    instanceId: safeCustomText(exercise.instanceId, 100),
    catalogId: safeCustomText(exercise.catalogId, 100),
    name: safeCustomText(exercise.name, 80),
    muscle: safeCustomText(exercise.muscle, 30),
    primary: [...profileFor(exercise).primary],
    assists: [...profileFor(exercise).assists],
    sets: setCountFor(exercise),
    repRange: targetRepRangeFor(exercise) || undefined,
    note: safeCustomText(exercise.note, 180)
  })).filter(exercise => exercise.name && exercise.primary.length);
  if (!exercises.length) return null;
  return {
    id: planIdFor(plan),
    name: safeCustomText(plan.name, 80) || 'Workout',
    type: safeCustomText(plan.type, 80) || 'Workout',
    time: safeCustomText(plan.time, 30) || `${estimateCustomWorkoutMinutes(exercises)} min`,
    icon: safeCustomText(plan.icon, 40) || 'dumbbell',
    personal: Boolean(plan.personal),
    custom: Boolean(plan.custom),
    day: safeCustomText(plan.day, 20),
    exercises
  };
}

function planFromDraft(draft, fallbackPlan = null) {
  if (draft?.version >= 2 && draft.planSnapshot) {
    const snapshot = draft.planSnapshot;
    if (snapshot && typeof snapshot === 'object' && Array.isArray(snapshot.exercises) && snapshot.exercises.length) {
      const exercises = snapshot.exercises.map(exercise => ({
        ...exercise,
        name: safeCustomText(exercise.name, 80),
        primary: sanitizeMuscleTargets(exercise.primary),
        assists: sanitizeMuscleTargets(exercise.assists),
        sets: Math.min(10, Math.max(1, Number(exercise.sets) || 3)),
        repRange: Array.isArray(exercise.repRange) ? sanitizeRepRange(exercise.repRange) : undefined
      })).filter(exercise => exercise.name && exercise.primary.length);
      if (exercises.length) {
        return {
          id: safeCustomText(snapshot.id, 100) || draft.planId,
          name: safeCustomText(snapshot.name, 80) || 'Workout',
          type: safeCustomText(snapshot.type, 80) || 'Workout',
          time: safeCustomText(snapshot.time, 30) || `${estimateCustomWorkoutMinutes(exercises)} min`,
          icon: safeCustomText(snapshot.icon, 40) || 'dumbbell',
          personal: Boolean(snapshot.personal),
          custom: Boolean(snapshot.custom),
          day: safeCustomText(snapshot.day, 20),
          exercises
        };
      }
    }
  }
  return fallbackPlan;
}

function sanitizeSetType(value) {
  return ['Warmup', 'Normal', 'Failure'].includes(value) ? value : 'Normal';
}

function sanitizeScheduleContext(value) {
  if (!value || typeof value !== 'object') return null;
  const scheduleId = safeCustomText(value.scheduleId, 100);
  const scheduleSlotId = safeCustomText(value.scheduleSlotId, 100);
  const scheduledFor = /^\d{4}-\d{2}-\d{2}$/.test(value.scheduledFor || '') ? value.scheduledFor : '';
  if (!scheduleId || !scheduleSlotId || !scheduledFor) return null;
  return { scheduleId, scheduleSlotId, scheduledFor };
}

function validDraftLogs(draft, plan) {
  const unique = new Map();
  draft.logs.forEach(log => {
    const exerciseIndex = Number(log.exerciseIndex);
    const set = Number(log.set);
    const weight = Number(log.weight);
    const reps = Number(log.reps);
    const exercise = plan.exercises[exerciseIndex];
    if (!exercise || !Number.isInteger(exerciseIndex) || exerciseIndex < 0 || !Number.isInteger(set) || set < 1 || set > setCountFor(exercise)) return;
    if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 1) return;
    unique.set(`${exerciseIndex}-${set}`, {
      exerciseIndex,
      set,
      weight,
      reps,
      setType: sanitizeSetType(log.setType),
      exerciseId: safeCustomText(log.exerciseId, 100) || safeCustomText(exercise.catalogId || exercise.targetKey || exercise.instanceId, 100),
      exercise: exercise.name,
      muscleTargets: profileFor(exercise).primary,
      savedAt: Number(log.savedAt) || Date.now()
    });
  });
  return [...unique.values()];
}

function persistActiveWorkout() {
  if (!activePlan || !activeSessionId || !draftAccountKey()) return false;
  return writeActiveWorkoutDraft({
    version: 3,
    accountKey: draftAccountKey(),
    sessionId: activeSessionId,
    planId: planIdFor(activePlan),
    startedAt: activeStartedAt,
    updatedAt: Date.now(),
    planSnapshot: planSnapshotForDraft(activePlan),
    scheduleContext: activeScheduleContext,
    logs
  });
}

function clampGradeScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0;
}

function workoutLetterForPercentage(value) {
  const percentage = clampGradeScore(value);
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

function workoutGradeLabel(letter) {
  return ({
    A: 'Excellent workout',
    B: 'Strong workout',
    C: 'Solid effort',
    D: 'Building consistency',
    F: 'A starting point'
  })[letter] || 'Workout recorded';
}

function gradeExerciseKey(exercise, log = null) {
  const stableId = safeCustomText(
    log?.exerciseId || exercise?.catalogId || exercise?.targetKey || exercise?.instanceId,
    100
  );
  if (stableId) return `id:${stableId.toLowerCase()}`;
  return `name:${safeCustomText(log?.exercise || exercise?.name, 100).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function workingGradeLogs(plan, sourceLogs) {
  return (Array.isArray(sourceLogs) ? sourceLogs : []).filter(log => {
    const exerciseIndex = Number(log?.exerciseIndex);
    const set = Number(log?.set);
    const exercise = plan?.exercises?.[exerciseIndex];
    return Boolean(
      exercise
      && Number.isInteger(exerciseIndex)
      && Number.isInteger(set)
      && set >= 1
      && set <= setCountFor(exercise)
      && sanitizeSetType(log.setType) !== 'Warmup'
      && Number.isFinite(Number(log.weight))
      && Number(log.weight) >= 0
      && Number.isInteger(Number(log.reps))
      && Number(log.reps) >= 1
    );
  });
}

function median(values) {
  const ordered = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (!ordered.length) return 0;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function exercisePerformance(logsForExercise, targetMaximum = 0) {
  const weighted = logsForExercise.filter(log => Number(log.weight) > 0);
  if (weighted.length) return Math.max(...weighted.map(estimatedOneRepMax));
  return logsForExercise.length
    ? Math.max(...logsForExercise.map(log => Math.min(Number(log.reps) || 0, targetMaximum > 0 ? targetMaximum + 2 : 30)))
    : 0;
}

function priorExercisePerformanceIndex(history, currentPlan) {
  const relevantKeys = new Set(currentPlan.exercises.map(exercise => gradeExerciseKey(exercise)));
  const index = new Map();
  [...(Array.isArray(history) ? history : [])]
    .sort((left, right) => (left.completedAt || 0) - (right.completedAt || 0))
    .forEach(session => {
      const byExercise = new Map();
      (session.logs || []).forEach(log => {
        if (sanitizeSetType(log.setType) === 'Warmup') return;
        const key = gradeExerciseKey(null, log);
        if (!relevantKeys.has(key)) return;
        if (!byExercise.has(key)) byExercise.set(key, []);
        byExercise.get(key).push(log);
      });
      byExercise.forEach((exerciseLogs, key) => {
        if (!index.has(key)) index.set(key, []);
        index.get(key).push({
          completedAt: validTimestamp(session.completedAt),
          logs: exerciseLogs
        });
      });
    });
  return index;
}

function calculateWorkoutGrade(plan, sourceLogs, priorHistory = workoutHistory) {
  const snapshot = planSnapshotForDraft(plan) || plan;
  const exercises = Array.isArray(snapshot?.exercises) ? snapshot.exercises : [];
  const workingLogs = workingGradeLogs(snapshot, sourceLogs);
  const plannedExercises = exercises.length;
  const plannedSets = exercises.reduce((total, exercise) => total + setCountFor(exercise), 0);
  const completedExerciseIndexes = new Set(workingLogs.map(log => Number(log.exerciseIndex)));
  const completedSetKeys = new Set(workingLogs.map(log => `${Number(log.exerciseIndex)}-${Number(log.set)}`));
  const completedExercises = completedExerciseIndexes.size;
  const completedSets = completedSetKeys.size;
  const exerciseScore = plannedExercises ? (completedExercises / plannedExercises) * 100 : 0;
  const setScore = plannedSets ? Math.min(100, (completedSets / plannedSets) * 100) : 0;

  let repScoreTotal = 0;
  let gradedSets = 0;
  let inRangeSets = 0;
  let neutralRepSets = 0;
  workingLogs.forEach(log => {
    const exercise = exercises[Number(log.exerciseIndex)];
    const range = targetRepRangeFor(exercise);
    if (!range) {
      repScoreTotal += 100;
      neutralRepSets += 1;
      return;
    }
    gradedSets += 1;
    const reps = Number(log.reps);
    const distance = reps < range[0] ? range[0] - reps : reps > range[1] ? reps - range[1] : 0;
    if (!distance) inRangeSets += 1;
    repScoreTotal += Math.max(50, 100 - 8 * distance);
  });
  const repScore = workingLogs.length ? repScoreTotal / workingLogs.length : 0;

  const priorIndex = priorExercisePerformanceIndex(priorHistory, snapshot);
  let progressScoreTotal = 0;
  let comparedExercises = 0;
  let improvedExercises = 0;
  let matchedExercises = 0;
  let neutralExercises = 0;
  completedExerciseIndexes.forEach(exerciseIndex => {
    const exercise = exercises[exerciseIndex];
    const currentLogs = workingLogs.filter(log => Number(log.exerciseIndex) === exerciseIndex);
    const range = targetRepRangeFor(exercise);
    const targetMaximum = range?.[1] || 0;
    const currentPerformance = exercisePerformance(currentLogs, targetMaximum);
    const previous = (priorIndex.get(gradeExerciseKey(exercise)) || []).slice(-3);
    const baselines = previous.map(entry => exercisePerformance(entry.logs, targetMaximum)).filter(value => value > 0);
    const baseline = median(baselines);
    if (!baseline) {
      progressScoreTotal += 85;
      neutralExercises += 1;
      return;
    }
    comparedExercises += 1;
    const ratio = currentPerformance / baseline;
    let score = ratio >= 1.02 ? 100 : ratio >= .95 ? 92 : ratio >= .85 ? 78 : 60;
    const currentSetRatio = Math.min(1, completedSetKeys.size
      ? currentLogs.length / setCountFor(exercise)
      : 0);
    const previousSetRatio = median(previous.map(entry => Math.min(1, entry.logs.length / setCountFor(exercise))));
    if (currentSetRatio - previousSetRatio >= .1) score = Math.min(100, score + 5);
    if (ratio >= 1.02) improvedExercises += 1;
    else if (ratio >= .95) matchedExercises += 1;
    progressScoreTotal += score;
  });
  const progressScore = completedExercises ? progressScoreTotal / completedExercises : 0;
  const percentage = clampGradeScore(
    exerciseScore * .30
    + setScore * .30
    + repScore * .25
    + progressScore * .15
  );
  const letter = workoutLetterForPercentage(percentage);
  const repSentence = gradedSets
    ? `${inRangeSets} of ${gradedSets} targeted sets landed in their rep ranges.`
    : workingLogs.length
      ? 'Sets without a rep target received a neutral accuracy score.'
      : 'No working sets were saved for rep accuracy.';
  const progressSentence = comparedExercises
    ? `${improvedExercises} exercise${improvedExercises === 1 ? '' : 's'} improved and ${matchedExercises} matched recent performance.`
    : completedExercises
      ? 'New exercises received a neutral progress score.'
      : 'Personal progress starts after a working set is saved.';

  return {
    version: 1,
    percentage,
    letter,
    label: workoutGradeLabel(letter),
    calculatedAt: Date.now(),
    components: {
      exerciseCompletion: { score: clampGradeScore(exerciseScore), planned: plannedExercises, completed: completedExercises },
      setCompletion: { score: clampGradeScore(setScore), planned: plannedSets, completed: completedSets },
      repAccuracy: { score: clampGradeScore(repScore), gradedSets, inRangeSets, neutralSets: neutralRepSets },
      personalProgress: { score: clampGradeScore(progressScore), comparedExercises, improvedExercises, matchedExercises, neutralExercises }
    },
    explanation: `You completed ${completedExercises} of ${plannedExercises} planned exercises and ${completedSets} of ${plannedSets} working sets. ${repSentence} ${progressSentence}`
  };
}

function sanitizeGradeComponent(value, countFields) {
  const component = value && typeof value === 'object' ? value : {};
  const result = { score: clampGradeScore(component.score) };
  countFields.forEach(field => {
    result[field] = Math.max(0, Math.round(Number(component[field]) || 0));
  });
  return result;
}

function sanitizeWorkoutGrade(value) {
  if (!value || typeof value !== 'object' || Number(value.version) !== 1 || !Number.isFinite(Number(value.percentage))) return null;
  const percentage = clampGradeScore(value.percentage);
  const letter = workoutLetterForPercentage(percentage);
  const components = value.components && typeof value.components === 'object' ? value.components : {};
  return {
    version: 1,
    percentage,
    letter,
    label: workoutGradeLabel(letter),
    calculatedAt: validTimestamp(value.calculatedAt),
    components: {
      exerciseCompletion: sanitizeGradeComponent(components.exerciseCompletion, ['planned', 'completed']),
      setCompletion: sanitizeGradeComponent(components.setCompletion, ['planned', 'completed']),
      repAccuracy: sanitizeGradeComponent(components.repAccuracy, ['gradedSets', 'inRangeSets', 'neutralSets']),
      personalProgress: sanitizeGradeComponent(components.personalProgress, ['comparedExercises', 'improvedExercises', 'matchedExercises', 'neutralExercises'])
    },
    explanation: safeCustomText(value.explanation, 600)
  };
}

function cloudProfileFromUser(user) {
  const metadata = user.user_metadata || {};
  const trainingProfile = metadata.level_up_fitness_profile || {};
  const name = metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Your profile';
  const metadataUpdatedAt = profileTimestamp(trainingProfile.updatedAt);
  return {
    name,
    email: user.email || '',
    accountKey: '',
    provider: 'google',
    cloudUserId: user.id,
    avatarUrl: metadata.avatar_url || metadata.picture || '',
    uploadedAvatarUrl: typeof trainingProfile.uploadedAvatarUrl === 'string' ? trainingProfile.uploadedAvatarUrl : '',
    customWorkouts: [],
    homeGym: trainingProfile.homeGym && typeof trainingProfile.homeGym.name === 'string'
      ? { name: trainingProfile.homeGym.name, address: trainingProfile.homeGym.address || '' }
      : null,
    profileSync: {
      version: 2,
      dirty: false,
      generation: 0,
      homeGymUpdatedAt: Object.prototype.hasOwnProperty.call(trainingProfile, 'homeGym') ? metadataUpdatedAt : 0,
      avatarUpdatedAt: Object.prototype.hasOwnProperty.call(trainingProfile, 'uploadedAvatarUrl') ? metadataUpdatedAt : 0,
      customWorkoutTombstones: []
    }
  };
}

function assertCloudIdentity(userId, authEpoch = cloudAuthEpoch) {
  if (!userId || !cloudReady || cloudUser?.id !== userId || cloudAuthEpoch !== authEpoch) {
    throw new Error('The signed-in account changed while cloud data was syncing.');
  }
}

function invalidateCloudSession() {
  cloudAuthEpoch += 1;
  cloudUser = null;
  cloudReady = false;
  cloudSessionUserId = '';
  cloudSessionHydration = null;
  cloudSessionHydrationUserId = '';
}

async function loadCloudProfile(userId = cloudUser?.id) {
  const client = getSupabaseClient();
  if (!client || !userId) return null;
  const { data, error } = await client.from('profiles')
    .select('display_name, email, home_gym, updated_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function cloudProfilePayload(state) {
  const normalized = normalizeProfileState(state);
  return {
    version: 2,
    homeGym: normalized.homeGym,
    name: normalized.homeGym?.name || '',
    address: normalized.homeGym?.address || '',
    homeGymUpdatedAt: normalized.homeGymUpdatedAt,
    uploadedAvatarUrl: normalized.uploadedAvatarUrl,
    avatarUpdatedAt: normalized.avatarUpdatedAt,
    customWorkouts: normalized.customWorkouts,
    customWorkoutTombstones: normalized.customWorkoutTombstones
  };
}

async function saveCloudProfileNow() {
  const client = getSupabaseClient();
  if (!client || !cloudUser || !userProfile) return;
  const userId = cloudUser.id;
  const authEpoch = cloudAuthEpoch;
  const capturedGeneration = profileSyncState(userProfile).generation;
  let committedState = null;
  let committedAt = '';
  let didCommit = false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const remoteRow = await loadCloudProfile(userId);
    assertCloudIdentity(userId, authEpoch);
    if (!userProfile || userProfile.cloudUserId !== userId) throw new Error('The signed-in account changed during profile sync.');
    const localState = normalizeProfileState(userProfile);
    const googleFallback = normalizeProfileState(cloudProfileFromUser(cloudUser));
    const remoteState = remoteRow
      ? mergeProfileState(googleFallback, normalizeProfileState(remoteRow, { fallbackUpdatedAt: remoteRow.updated_at }))
      : googleFallback;
    committedState = mergeProfileState(localState, remoteState);
    const previousUpdatedAt = profileTimestamp(remoteRow?.updated_at);
    committedAt = new Date(Math.max(Date.now(), previousUpdatedAt + 1)).toISOString();
    const payload = {
      id: userId,
      display_name: userProfile.name,
      email: userProfile.email,
      home_gym: cloudProfilePayload(committedState),
      updated_at: committedAt
    };

    if (remoteRow?.updated_at) {
      const { data, error } = await client.from('profiles')
        .update(payload)
        .eq('id', userId)
        .eq('updated_at', remoteRow.updated_at)
        .select('updated_at')
        .maybeSingle();
      assertCloudIdentity(userId, authEpoch);
      if (error) throw error;
      if (!data) continue;
    } else {
      const { error } = await client.from('profiles').insert(payload);
      assertCloudIdentity(userId, authEpoch);
      if (error?.code === '23505') continue;
      if (error) throw error;
    }
    didCommit = true;
    break;
  }

  if (!didCommit || !committedState || !committedAt) throw new Error('Profile changed on another device. Sync will retry.');
  assertCloudIdentity(userId, authEpoch);
  if (!userProfile || userProfile.cloudUserId !== userId) throw new Error('The signed-in account changed during profile sync.');
  const latestState = mergeProfileState(committedState, normalizeProfileState(userProfile));
  const latestSync = profileSyncState(userProfile);
  const fullyCommitted = latestSync.generation === capturedGeneration
    && profileStateFingerprint(latestState) === profileStateFingerprint(committedState);
  applyProfileStateToUserProfile(latestState, {
    dirty: !fullyCommitted,
    generation: latestSync.generation
  });
  saveUserProfile();
  renderSyncStatus();
  return true;
}

function saveCloudProfile() {
  const request = cloudProfileSaveQueue.then(() => saveCloudProfileNow());
  cloudProfileSaveQueue = request.catch(() => undefined);
  return request;
}

async function retryPendingProfileSync() {
  if (!cloudReady || !cloudUser || !userProfile || !profileSyncState(userProfile).dirty) return;
  try {
    await saveCloudProfile();
  } catch {
    renderSyncStatus();
  }
}

function cloudSetId(sessionId, log) {
  return `${sessionId}-${log.exerciseIndex}-${log.set}`;
}

function sessionRowForCloud(session, status = 'completed', userId = cloudUser?.id) {
  if (!userId) throw new Error('A signed-in account is required to save a workout.');
  return {
    id: session.id,
    user_id: userId,
    status,
    plan_id: session.planId || '',
    plan_name: session.plan || '',
    program: session.program || null,
    scheduled_day: session.scheduledDay || null,
    muscles: session.muscles || [],
    started_at: isoFromMs(session.startedAt),
    completed_at: status === 'completed' ? isoFromMs(session.completedAt) : null,
    duration_minutes: storedWorkoutDurationMinutes(session),
    plan_snapshot: session.planSnapshot || null,
    grade: sanitizeWorkoutGrade(session.grade),
    schedule_id: session.scheduleId || null,
    schedule_slot_id: session.scheduleSlotId || null,
    scheduled_for: session.scheduledFor || null,
    updated_at: new Date().toISOString()
  };
}

function setRowsForCloud(session, userId = cloudUser?.id) {
  if (!userId) throw new Error('A signed-in account is required to save workout sets.');
  return (session.logs || []).map(log => ({
    id: cloudSetId(session.id, log),
    user_id: userId,
    session_id: session.id,
    exercise_index: Number(log.exerciseIndex) || 0,
    set_number: Number(log.set) || 1,
    set_type: sanitizeSetType(log.setType),
    exercise_id: safeCustomText(log.exerciseId, 100),
    exercise_name: log.exercise || '',
    weight_lbs: Number(log.weight) || 0,
    reps: Number(log.reps) || 0,
    muscle_targets: log.muscleTargets || [],
    saved_at: isoFromMs(log.savedAt),
    updated_at: new Date().toISOString()
  }));
}

function sessionFromCloud(row, setRows) {
  const startedAt = msFromIso(row.started_at);
  const completedAt = msFromIso(row.completed_at || row.updated_at);
  const logsForSession = setRows
    .filter(log => log.session_id === row.id)
    .sort((a, b) => a.exercise_index - b.exercise_index || a.set_number - b.set_number)
    .map(log => ({
      exerciseIndex: Number(log.exercise_index) || 0,
      weight: Number(log.weight_lbs) || 0,
      reps: Number(log.reps) || 0,
      set: Number(log.set_number) || 1,
      setType: sanitizeSetType(log.set_type),
      exerciseId: safeCustomText(log.exercise_id, 100),
      exercise: log.exercise_name || '',
      muscleTargets: log.muscle_targets || [],
      savedAt: msFromIso(log.saved_at)
    }));
  const session = {
    id: row.id,
    startedAt,
    completedAt,
    durationMinutes: Number(row.duration_minutes) || 0,
    planSnapshot: row.plan_snapshot && typeof row.plan_snapshot === 'object' ? row.plan_snapshot : null,
    grade: sanitizeWorkoutGrade(row.grade),
    planId: row.plan_id || '',
    plan: row.plan_name || 'Workout',
    program: row.program || null,
    scheduledDay: row.scheduled_day || null,
    scheduleId: row.schedule_id || null,
    scheduleSlotId: row.schedule_slot_id || null,
    scheduledFor: /^\d{4}-\d{2}-\d{2}$/.test(row.scheduled_for || '') ? row.scheduled_for : null,
    muscles: row.muscles || [],
    logs: logsForSession
  };
  session.durationMinutes = storedWorkoutDurationMinutes(session);
  return session;
}

async function fetchCloudWorkoutHistory(userId = cloudUser?.id, authEpoch = cloudAuthEpoch) {
  const client = getSupabaseClient();
  if (!client || !userId) return [];
  assertCloudIdentity(userId, authEpoch);
  const sessions = [];
  const sessionPageSize = 500;
  for (let offset = 0; ; offset += sessionPageSize) {
    const { data, error } = await client
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: true })
      .order('id', { ascending: true })
      .range(offset, offset + sessionPageSize - 1);
    assertCloudIdentity(userId, authEpoch);
    if (error) throw error;
    sessions.push(...(data || []));
    if (!data || data.length < sessionPageSize) break;
  }
  if (!sessions.length) return [];
  const sessionIds = sessions.map(session => session.id);
  const setRows = [];
  const batchSize = 50;
  const setPageSize = 1000;
  for (let offset = 0; offset < sessionIds.length; offset += batchSize) {
    const batch = sessionIds.slice(offset, offset + batchSize);
    for (let setOffset = 0; ; setOffset += setPageSize) {
      const { data, error } = await client
        .from('workout_sets')
        .select('*')
        .eq('user_id', userId)
        .in('session_id', batch)
        .order('session_id', { ascending: true })
        .order('exercise_index', { ascending: true })
        .order('set_number', { ascending: true })
        .range(setOffset, setOffset + setPageSize - 1);
      assertCloudIdentity(userId, authEpoch);
      if (error) throw error;
      setRows.push(...(data || []));
      if (!data || data.length < setPageSize) break;
    }
  }
  return sessions.map(session => sessionFromCloud(session, setRows));
}

async function uploadCloudWorkoutSession(session, status = 'completed', userId = cloudUser?.id, authEpoch = cloudAuthEpoch) {
  const client = getSupabaseClient();
  if (!client || !userId) return false;
  assertCloudIdentity(userId, authEpoch);
  const setRows = setRowsForCloud(session, userId);
  const stagingStatus = status === 'completed' && setRows.length ? 'active' : status;
  const { error: sessionError } = await client
    .from('workout_sessions')
    .upsert(sessionRowForCloud(session, stagingStatus, userId), { onConflict: 'id' });
  assertCloudIdentity(userId, authEpoch);
  if (sessionError) throw sessionError;
  if (setRows.length) {
    const { error: setsError } = await client
      .from('workout_sets')
      .upsert(setRows, { onConflict: 'session_id,exercise_index,set_number' });
    assertCloudIdentity(userId, authEpoch);
    if (setsError) throw setsError;
  }
  if (stagingStatus !== status) {
    const { error: completionError } = await client
      .from('workout_sessions')
      .upsert(sessionRowForCloud(session, status, userId), { onConflict: 'id' });
    assertCloudIdentity(userId, authEpoch);
    if (completionError) throw completionError;
  }
  return true;
}

function queuePendingCloudSession(session, ownerUserId = historyOwnerId()) {
  if (!ownerUserId) return false;
  const key = pendingCloudSessionsKey(ownerUserId);
  const pending = localStorageReadArray(key);
  const ownedSession = { ...session, ownerUserId };
  const next = pending.some(item => item.id === session.id)
    ? pending.map(item => item.id === session.id ? ownedSession : item)
    : [...pending, ownedSession];
  return localStorageWriteArray(key, next);
}

function removePendingCloudSession(sessionId, ownerUserId = historyOwnerId()) {
  if (!ownerUserId) return false;
  const key = pendingCloudSessionsKey(ownerUserId);
  const pending = localStorageReadArray(key);
  return localStorageWriteArray(key, pending.filter(item => item.id !== sessionId));
}

async function syncPendingCloudSessions(userId = cloudUser?.id, authEpoch = cloudAuthEpoch) {
  if (!cloudReady || !userId) return;
  assertCloudIdentity(userId, authEpoch);
  const key = pendingCloudSessionsKey(userId);
  const pending = localStorageReadArray(key)
    .filter(session => !session.ownerUserId || session.ownerUserId === userId);
  if (!pending.length) return;
  const remaining = [];
  for (const session of pending) {
    try {
      const uploaded = await uploadCloudWorkoutSession(session, 'completed', userId, authEpoch);
      if (!uploaded) throw new Error('Workout upload did not start.');
    } catch {
      remaining.push(session);
    }
  }
  localStorageWriteArray(key, remaining);
}

function migrateLegacyAccountStorage(userId, deviceProfile) {
  if (!userId || deviceProfile?.cloudUserId !== userId) return false;
  const markerKey = `${LEGACY_ACCOUNT_STORAGE_MIGRATION_PREFIX}${userId}`;
  try {
    const claimedOwner = localStorage.getItem(LEGACY_ACCOUNT_STORAGE_OWNER_KEY);
    if (claimedOwner && claimedOwner !== userId) return false;
    if (localStorage.getItem(markerKey) === '1') return true;
    const accountHistoryKey = historyStorageKey(userId);
    const accountHistory = localStorageReadArray(accountHistoryKey);
    const legacyHistory = localStorageReadArray(WORKOUT_HISTORY_KEY);
    const historySaved = localStorageWriteArray(accountHistoryKey, mergeHistory(accountHistory, legacyHistory));

    const accountPendingKey = pendingCloudSessionsKey(userId);
    const accountPending = localStorageReadArray(accountPendingKey);
    const legacyPending = localStorageReadArray(PENDING_CLOUD_SESSIONS_KEY)
      .filter(session => !session.ownerUserId || session.ownerUserId === userId)
      .map(session => ({ ...session, ownerUserId: userId }));
    const pendingById = new Map([...accountPending, ...legacyPending].filter(item => item?.id).map(item => [item.id, item]));
    const pendingSaved = localStorageWriteArray(accountPendingKey, [...pendingById.values()]);
    if (!historySaved || !pendingSaved) return false;
    localStorage.setItem(LEGACY_ACCOUNT_STORAGE_OWNER_KEY, userId);
    localStorage.removeItem(WORKOUT_HISTORY_KEY);
    localStorage.removeItem(PENDING_CLOUD_SESSIONS_KEY);
    localStorage.setItem(markerKey, '1');
    return true;
  } catch {
    // Existing account-scoped data remains safe if a browser blocks migration storage.
    return false;
  }
}

function mergeHistory(localHistory, cloudHistory) {
  const byId = new Map();
  [...cloudHistory, ...localHistory].forEach(session => {
    if (!session?.id) return;
    const previous = byId.get(session.id);
    if (!previous) {
      byId.set(session.id, session);
      return;
    }
    const previousDuration = storedWorkoutDurationMinutes(previous);
    const sessionDuration = storedWorkoutDurationMinutes(session);
    byId.set(session.id, {
      ...previous,
      ...session,
      startedAt: validTimestamp(session.startedAt) || validTimestamp(previous.startedAt),
      completedAt: validTimestamp(session.completedAt) || validTimestamp(previous.completedAt),
      durationMinutes: sessionDuration || previousDuration,
      planSnapshot: session.planSnapshot || previous.planSnapshot || null,
      grade: sanitizeWorkoutGrade(session.grade) || sanitizeWorkoutGrade(previous.grade),
      scheduleId: session.scheduleId || previous.scheduleId || null,
      scheduleSlotId: session.scheduleSlotId || previous.scheduleSlotId || null,
      scheduledFor: session.scheduledFor || previous.scheduledFor || null,
      logs: session.logs?.length ? session.logs : (previous.logs || [])
    });
  });
  return [...byId.values()].sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));
}

async function importLocalHistoryIfNeeded(cloudHistory, userId = cloudUser?.id, authEpoch = cloudAuthEpoch) {
  if (!cloudReady || !userId) return cloudHistory;
  assertCloudIdentity(userId, authEpoch);
  const localHistory = localStorageReadArray(historyStorageKey(userId));
  const unsyncedLocal = localHistory.filter(localSession =>
    localSession?.id && !cloudHistory.some(cloudSession => cloudSession.id === localSession.id)
  );
  if (!unsyncedLocal.length) return mergeHistory(localHistory, cloudHistory);

  for (const session of unsyncedLocal) {
    try {
      const uploaded = await uploadCloudWorkoutSession(session, 'completed', userId, authEpoch);
      if (!uploaded) throw new Error('Workout upload did not start.');
    } catch {
      queuePendingCloudSession(session, userId);
    }
  }
  // Keep every local record while uploads retry. A temporary cloud error must
  // never make previously logged progress disappear from the app.
  return mergeHistory(localHistory, cloudHistory);
}

async function refreshCloudHistory(userId = cloudUser?.id, authEpoch = cloudAuthEpoch) {
  if (!cloudReady || !userId) return;
  try {
    let cloudHistory = await fetchCloudWorkoutHistory(userId, authEpoch);
    assertCloudIdentity(userId, authEpoch);
    const deviceHistory = localStorageReadArray(historyStorageKey(userId));
    let mergedHistory = mergeHistory(deviceHistory, cloudHistory);
    localStorageWriteArray(historyStorageKey(userId), mergedHistory);
    cloudHistory = await importLocalHistoryIfNeeded(cloudHistory, userId, authEpoch);
    await syncPendingCloudSessions(userId, authEpoch);
    try {
      cloudHistory = await fetchCloudWorkoutHistory(userId, authEpoch);
    } catch {
      // The merged device copy remains available until the next cloud refresh.
    }
    assertCloudIdentity(userId, authEpoch);
    mergedHistory = mergeHistory(mergedHistory, cloudHistory);
    localStorageWriteArray(historyStorageKey(userId), mergedHistory);
    workoutHistory = mergedHistory;
    renderHome();
    renderProgress();
    renderProfile();
  } catch {
    if (cloudUser?.id === userId && cloudAuthEpoch === authEpoch) {
      el('authNotice').textContent = 'Signed in, but cloud workouts could not load yet. Your device data is still here.';
    }
  }
}

async function handleCloudSession(session) {
  if (!session?.user) return false;
  const userId = session.user.id;
  if (cloudSessionHydration && cloudSessionHydrationUserId === userId) return cloudSessionHydration;
  if (cloudReady && cloudSessionUserId === userId) {
    cloudUser = session.user;
    return true;
  }

  const authEpoch = ++cloudAuthEpoch;
  cloudUser = session.user;
  cloudSessionUserId = '';
  const hydration = (async () => {
    cloudReady = true;
    const accountProfile = cloudProfileFromUser(session.user);
    const deviceProfile = loadUserProfile();
    migrateLegacyAccountStorage(userId, deviceProfile);
    assertCloudIdentity(userId, authEpoch);
    workoutHistory = localStorageReadArray(historyStorageKey(userId));
    const cachedProfile = loadCloudProfileCache(userId)
      || (deviceProfile?.cloudUserId === userId ? deviceProfile : null);
    let savedProfile = null;
    try {
      savedProfile = await loadCloudProfile(userId);
    } catch {
      // A profile can still work locally if cloud profile data is temporarily unavailable.
    }
    assertCloudIdentity(userId, authEpoch);

    let mergedState = mergeProfileState(
      normalizeProfileState(accountProfile),
      normalizeProfileState(cachedProfile)
    );
    const remoteState = savedProfile
      ? normalizeProfileState(savedProfile, { fallbackUpdatedAt: savedProfile.updated_at })
      : normalizeProfileState(null);
    mergedState = mergeProfileState(mergedState, remoteState);
    const cachedSync = profileSyncState(cachedProfile);
    const needsCloudRepair = !savedProfile
      || Number(savedProfile?.home_gym?.version) < 2
      || cachedSync.dirty
      || profileStateFingerprint(mergedState) !== profileStateFingerprint(remoteState);

    accountProfile.name = savedProfile?.display_name || accountProfile.name;
    accountProfile.email = savedProfile?.email || accountProfile.email;
    userProfile = accountProfile;
    applyProfileStateToUserProfile(mergedState, {
      dirty: needsCloudRepair,
      generation: cachedSync.generation
    });
    await ensureUserAccountKey();
    assertCloudIdentity(userId, authEpoch);
    if (userProfile?.cloudUserId !== userId) throw new Error('The signed-in account changed during profile hydration.');
    saveUserProfile();
    if (needsCloudRepair) {
      try {
        await saveCloudProfile();
      } catch {
        // The account-specific dirty snapshot retries after reconnecting.
      }
    }
    assertCloudIdentity(userId, authEpoch);
    initializeProfile();
    renderPlans();
    await refreshCloudHistory(userId, authEpoch);
    assertCloudIdentity(userId, authEpoch);
    // A token refresh must never change the page a person is looking at.
    // Restore a saved workout silently; Start workout still opens it explicitly.
    restoreActiveWorkout(false);
    cloudSessionUserId = userId;
    return true;
  })();
  cloudSessionHydration = hydration;
  cloudSessionHydrationUserId = userId;
  try {
    return await hydration;
  } finally {
    if (cloudSessionHydration === hydration) {
      cloudSessionHydration = null;
      cloudSessionHydrationUserId = '';
    }
  }
}

async function initializeCloudAuth() {
  const client = getSupabaseClient();
  if (!client) return false;
  client.auth.onAuthStateChange((event, session) => {
    if (session?.user && ['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED'].includes(event)) {
      // Supabase dispatches this callback while it holds its auth lock. Starting
      // database work inside it can stall app startup, so defer hydration until
      // the callback has returned.
      setTimeout(() => {
        void handleCloudSession(session).catch(error => {
          console.warn('Cloud session hydration failed; the device app remains available.', error);
        });
      }, 0);
    }
    else if (event === 'SIGNED_OUT') {
      const signedOutGoogleProfile = userProfile?.provider === 'google';
      invalidateCloudSession();
      resetActiveWorkoutState();
      workoutHistory = [];
      if (signedOutGoogleProfile) {
        clearActiveWorkoutDraft();
        userProfile = null;
        saveUserProfile();
      }
      initializeProfile();
    }
  });
  try {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data?.session ? await handleCloudSession(data.session) : false;
  } catch (error) {
    console.warn('Cloud auth check failed; the device app remains available.', error);
    return false;
  }
}

async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) {
    el('authNotice').textContent = 'Google sign-in is almost ready. Add the Supabase project URL and publishable key first.';
    return;
  }
  el('authNotice').textContent = 'Opening Google sign-in...';
  await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/` }
  });
}

function renderSyncStatus() {
  const container = el('syncStatus');
  if (!container) return;
  container.innerHTML = '';
  container.className = 'sync-status hidden';
  if (!userProfile) return;
  const pendingCount = localStorageReadArray(pendingCloudSessionsKey()).length;
  const profilePending = profileSyncState(userProfile).dirty;
  if (userProfile.provider === 'google') {
    if (pendingCount || profilePending) {
      container.className = 'sync-status';
      const pendingParts = [];
      if (pendingCount) pendingParts.push(`${pendingCount} workout${pendingCount === 1 ? '' : 's'}`);
      if (profilePending) pendingParts.push('profile or custom-workout changes');
      container.innerHTML = `<div><strong>Sync pending</strong><small>${pendingParts.join(' and ')} saved on this device and waiting to sync.</small></div>`;
    }
    return;
  }
  container.className = 'sync-status local';
  container.innerHTML = `<div><strong>Local test profile</strong><small>This profile is only saved on this device. Use Google to sync your workouts to your phone.</small></div><button id="switchToGoogle" type="button">Switch to Google sync</button>`;
  el('switchToGoogle').onclick = () => { void signInWithGoogle(); };
}

async function signOutOfAccount() {
  const client = getSupabaseClient();
  try {
    if (client) await client.auth.signOut();
  } finally {
    invalidateCloudSession();
  }
}

function targetCountsFor(plan) {
  const counts = new Map();
  plan.exercises.forEach(exercise => {
    profileFor(exercise).primary.forEach(muscle => {
      counts.set(muscle, (counts.get(muscle) || 0) + 1);
    });
  });
  return counts;
}

function bindPlanButtons(root = document) {
  root.querySelectorAll('[data-plan-id]').forEach(button => {
    button.onclick = () => detail(button.dataset.planId);
  });
}

function programInstructionsMarkup(program) {
  return `<details class="program-instructions">
    <summary>How to follow this plan</summary>
    <ul>${program.instructions.map(instruction => `<li>${instruction}</li>`).join('')}</ul>
  </details>`;
}

function programScheduleMarkup(program) {
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  return program.schedule.map(item => {
    const isToday = item.day === today;
    const todayBadge = isToday ? '<span class="today-badge">Today</span>' : '';
    if (item.rest) {
      return `<article class="program-day rest-day ${isToday ? 'today' : ''}">
        <span class="day-badge">${item.day.slice(0, 3).toUpperCase()}</span>
        <span class="program-day-copy"><small>${item.day}${todayBadge}</small><b>Rest day</b><em>${item.rest}</em></span>
        <span class="rest-label">REST</span>
      </article>`;
    }
    const plan = program.plans.find(candidate => candidate.id === item.planId);
    if (!plan) return '';
    return `<button class="program-day workout-day ${isToday ? 'today' : ''}" data-plan-id="${plan.id}">
      <span class="day-badge">${item.day.slice(0, 3).toUpperCase()}</span>
      <span class="program-day-copy"><small>${item.day}${todayBadge}</small><b>${plan.name}</b><em>${plan.exercises.length} exercises &middot; ${totalSetsFor(plan)} work sets &middot; ${plan.time}</em></span>
      <span class="program-action">View</span>
    </button>`;
  }).join('');
}

function programHomeSummaryMarkup(program) {
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayIndex = Math.max(0, program.schedule.findIndex(item => item.day === today));
  const todayItem = program.schedule[todayIndex];
  const todayPlan = todayItem?.planId ? program.plans.find(plan => plan.id === todayItem.planId) : null;
  let nextItem = null;
  for (let offset = 1; offset <= program.schedule.length; offset += 1) {
    const candidate = program.schedule[(todayIndex + offset) % program.schedule.length];
    if (candidate.planId) {
      nextItem = candidate;
      break;
    }
  }
  const nextPlan = nextItem ? program.plans.find(plan => plan.id === nextItem.planId) : null;
  const todayMarkup = todayPlan
    ? `<button class="program-today-card workout-day" data-plan-id="${todayPlan.id}">
        <span><small>TODAY &middot; ${todayItem.day}</small><b>${todayPlan.name}</b><em>${todayPlan.exercises.length} exercises &middot; ${totalSetsFor(todayPlan)} work sets &middot; ${todayPlan.time}</em></span>
        <span class="program-action">Start</span>
      </button>`
    : `<article class="program-today-card rest-day">
        <span><small>TODAY &middot; ${todayItem.day}</small><b>Rest day</b><em>${todayItem.rest}</em></span>
        <span class="rest-label">REST</span>
      </article>`;
  const nextMarkup = nextPlan
    ? `<button class="program-next-card" data-plan-id="${nextPlan.id}">
        <span><small>NEXT WORKOUT &middot; ${nextItem.day}</small><b>${nextPlan.name}</b></span>
        <span class="program-action">Preview</span>
      </button>`
    : '';
  return `<div class="program-home-summary">${todayMarkup}${nextMarkup}</div>`;
}

function renderPersonalProgramHome() {
  const program = personalProgramForCurrentUser();
  const section = el('accountProgramHome');
  if (!program) {
    section.classList.add('hidden');
    el('programWeek').innerHTML = '';
    return;
  }
  section.classList.remove('hidden');
  el('programWeek').innerHTML = programHomeSummaryMarkup(program);
  bindPlanButtons(section);
}

function go(id, { startup = false } = {}) {
  if (!startup && !startupPageResolved) userNavigatedDuringStartup = true;
  if (!el(id)) id = 'home';
  currentPage = id;
  rememberPage(id);
  document.body.classList.toggle('summary-open', id === 'summary');
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  el(id).classList.remove('hidden');
  document.documentElement.removeAttribute('data-restoring-page');
  document.querySelectorAll('.tabs button').forEach(button => {
    button.classList.toggle('active', button.dataset.page === id);
  });
  if (id === 'workout') renderPlans();
  if (id === 'progress') renderProgress();
  if (id === 'profile') renderProfile();
  if (id === 'home') renderHome();
  if (id === 'builder') renderBuilder();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function firstName() {
  return userProfile?.name.trim().split(/\s+/)[0] || '';
}

function initials() {
  if (!userProfile?.name) return 'ME';
  return userProfile.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function renderIdentity() {
  const name = userProfile?.name || 'Your profile';
  el('homeGreeting').textContent = firstName() ? `Hey, ${firstName()}` : 'Ready to train?';
  const navAvatar = el('profileAvatar');
  const navPhoto = userProfile?.uploadedAvatarUrl || userProfile?.avatarUrl;
  navAvatar.textContent = navPhoto ? '' : initials();
  navAvatar.style.backgroundImage = navPhoto ? `url("${navPhoto.replace(/"/g, '%22')}")` : '';
  navAvatar.classList.toggle('has-photo', Boolean(navPhoto));
  el('profileName').textContent = name;
  el('profileEmail').textContent = userProfile?.email || '';
  renderSyncStatus();
}

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

function rankBadgeMarkup(rank, variant = '') {
  const label = rank?.name || 'Unranked';
  const initialsText = label.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'UR';
  const classes = ['rank-text-badge', variant].filter(Boolean).join(' ');
  return `<span class="${classes}" aria-label="${escapeHtml(label)} rank">${escapeHtml(initialsText)}</span>`;
}

function avatarMarkup(size = 'large', elementId = '') {
  const photo = pendingProfilePhoto || userProfile?.uploadedAvatarUrl || userProfile?.avatarUrl;
  const id = elementId ? ` id="${elementId}"` : '';
  if (photo) return `<img${id} class="profile-photo ${size}" src="${escapeHtml(photo)}" alt="${escapeHtml(userProfile?.name || 'Profile')} profile photo">`;
  return `<div${id} class="profile-photo ${size} initials-photo" aria-label="${escapeHtml(userProfile?.name || 'Your')} initials">${initials()}</div>`;
}

function resizeProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Photo could not be read'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Photo could not be loaded'));
      image.onload = () => {
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const sourceSize = Math.min(image.width, image.height);
        const sx = Math.max(0, (image.width - sourceSize) / 2);
        const sy = Math.max(0, (image.height - sourceSize) / 2);
        context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleProfilePhotoUpload(input) {
  const file = input.files?.[0];
  input.value = '';
  if (!file || !userProfile) return;
  if (!file.type.startsWith('image/')) {
    el('photoStatus').textContent = 'Choose an image file for your profile photo.';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    el('photoStatus').textContent = 'Choose an image smaller than 10 MB.';
    return;
  }
  el('photoStatus').textContent = 'Preparing photo preview...';
  try {
    pendingProfilePhoto = await resizeProfilePhoto(file);
    renderProfile();
    el('photoStatus').textContent = 'Preview ready. Tap Save photo to keep it.';
  } catch {
    pendingProfilePhoto = '';
    el('photoStatus').textContent = 'That photo could not be saved. Try a different image.';
  }
}

function cancelProfilePhoto() {
  pendingProfilePhoto = '';
  renderProfile();
  el('photoStatus').textContent = 'Photo change canceled.';
}

async function confirmProfilePhoto() {
  if (!pendingProfilePhoto || !userProfile) return;
  const previousPhoto = userProfile.uploadedAvatarUrl || '';
  const previousSync = profileSyncState(userProfile);
  userProfile.uploadedAvatarUrl = pendingProfilePhoto;
  markProfileDirty('avatar');
  if (!saveUserProfile()) {
    userProfile.uploadedAvatarUrl = previousPhoto;
    userProfile.profileSync = previousSync;
    el('photoStatus').textContent = 'Your photo could not be saved on this device. Try a smaller image.';
    return;
  }
  pendingProfilePhoto = '';
  renderIdentity();
  renderProfile();
  if (cloudReady) {
    try {
      await saveCloudProfile();
      el('photoStatus').textContent = 'Profile photo saved to your account.';
    } catch {
      el('photoStatus').textContent = 'Photo saved on this device. It will be added to your account when the connection works.';
    }
  } else {
    el('photoStatus').textContent = 'Profile photo saved.';
  }
}

function renderHomeGym() {
  const container = el('homeGym');
  if (!container) return;
  const gym = userProfile?.homeGym;
  container.innerHTML = gym
    ? `<div class="gym-pin" aria-hidden="true"></div><div><strong>${escapeHtml(gym.name)}</strong><small>${escapeHtml(gym.address || 'Selected home gym')}</small></div><button id="clearHomeGym" type="button" aria-label="Clear home gym">Change</button>`
    : `<div class="gym-pin muted" aria-hidden="true"></div><div><strong>No home gym selected</strong><small>Pick a gym to personalize your training profile.</small></div>`;
  const clear = el('clearHomeGym');
  if (clear) clear.onclick = () => void setHomeGym(null);
}

function renderGymCatalog() {
  const search = el('gymCatalogSearch');
  const query = search?.value.trim().toLowerCase() || '';
  const choices = popularGymCatalog.filter(name => name.toLowerCase().includes(query));
  const count = el('gymCatalogCount');
  const catalog = el('gymCatalog');
  if (!catalog || !count) return;

  if (!query || !gymCatalogOpen) {
    catalog.classList.add('hidden');
    catalog.innerHTML = '';
    count.textContent = pendingHomeGym
      ? `${pendingHomeGym.name} selected. Confirm it below to save it.`
      : 'Start typing to search the 100 popular gym choices.';
    return;
  }

  catalog.classList.remove('hidden');
  count.textContent = `${choices.length} matching gym choice${choices.length === 1 ? '' : 's'}.`;
  catalog.innerHTML = choices.length
    ? choices.map(name => `<button type="button" class="gym-choice" data-gym-brand="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('')
    : '<p class="gym-catalog-empty">No matching gym. Try a shorter or different search.</p>';
  catalog.querySelectorAll('[data-gym-brand]').forEach(button => {
    button.onmousedown = event => event.preventDefault();
    button.onclick = () => {
      const name = button.dataset.gymBrand || '';
      if (!name) return;
      pendingHomeGym = { name, address: 'Selected from the popular gym list' };
      gymCatalogOpen = false;
      search.value = name;
      renderGymCatalog();
      renderGymConfirmation();
    };
  });
}

function renderGymConfirmation() {
  const confirmation = el('gymConfirm');
  if (!confirmation) return;
  if (!pendingHomeGym) {
    confirmation.classList.add('hidden');
    confirmation.innerHTML = '';
    return;
  }
  confirmation.classList.remove('hidden');
  confirmation.innerHTML = `<p><strong>${escapeHtml(pendingHomeGym.name)}</strong> is ready to be your home gym.</p>
    <div><button id="confirmHomeGym" type="button" class="primary">Confirm home gym</button><button id="cancelHomeGym" type="button" class="secondary-button">Cancel</button></div>`;
  el('confirmHomeGym').onclick = async () => {
    const chosenGym = pendingHomeGym;
    pendingHomeGym = null;
    gymCatalogOpen = false;
    el('gymCatalogSearch').value = '';
    await setHomeGym(chosenGym);
    renderGymCatalog();
    renderGymConfirmation();
  };
  el('cancelHomeGym').onclick = () => {
    pendingHomeGym = null;
    gymCatalogOpen = false;
    el('gymCatalogSearch').value = '';
    renderGymCatalog();
    renderGymConfirmation();
    el('gymPickerStatus').textContent = 'Home gym selection canceled.';
  };
}

async function saveManualGym(event) {
  event.preventDefault();
  const name = el('manualGymName').value.trim();
  if (!name) return el('manualGymName').focus();
  await setHomeGym({ name, address: 'Custom home gym' });
  el('manualGymForm').reset();
  renderGymCatalog();
}

async function setHomeGym(gym) {
  if (!userProfile) return;
  const previousGym = userProfile.homeGym || null;
  const previousSync = profileSyncState(userProfile);
  userProfile.homeGym = gym ? { name: gym.name, address: gym.address || '' } : null;
  markProfileDirty('homeGym');
  if (!saveUserProfile()) {
    userProfile.homeGym = previousGym;
    userProfile.profileSync = previousSync;
    renderHomeGym();
    el('gymPickerStatus').textContent = 'Your home gym could not be saved on this device. Please try again.';
    return false;
  }
  renderHomeGym();
  if (gym) {
    el('gymPickerStatus').textContent = `${gym.name} is now your home gym.`;
  } else {
    pendingHomeGym = null;
    gymCatalogOpen = false;
    const search = el('gymCatalogSearch');
    if (search) search.value = '';
    el('gymPickerStatus').textContent = 'Home gym removed. Start typing to choose another gym.';
    renderGymCatalog();
    renderGymConfirmation();
  }
  if (cloudReady) {
    try {
      await saveCloudProfile();
      if (gym) el('gymPickerStatus').textContent = `${gym.name} is saved to your account.`;
    } catch {
      el('gymPickerStatus').textContent = 'Saved on this device. It will sync to your account when the connection works.';
    }
  }
  return true;
}

function builderDraftKey() {
  const account = draftAccountKey();
  return account ? `${CUSTOM_WORKOUT_DRAFT_PREFIX}${account}` : '';
}

function clearBuilderDraft() {
  const key = builderDraftKey();
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // A finished plan can still remain in memory if temporary storage is blocked.
  }
}

function persistBuilderDraft() {
  const key = builderDraftKey();
  if (!key) return false;
  try {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      accountKey: draftAccountKey(),
      name: builderName,
      editingId: builderEditingId,
      exercises: builderExercises,
      updatedAt: Date.now()
    }));
    return true;
  } catch {
    return false;
  }
}

function resetBuilderState(clearDraft = false) {
  builderName = '';
  builderExercises = [];
  builderEditingId = '';
  builderLoaded = true;
  if (clearDraft) clearBuilderDraft();
}

function loadBuilderDraft() {
  if (builderLoaded) return;
  resetBuilderState(false);
  const key = builderDraftKey();
  if (!key) return;
  try {
    const draft = JSON.parse(localStorage.getItem(key) || 'null');
    if (!draft || draft.version !== 1 || draft.accountKey !== draftAccountKey()) return;
    builderName = safeCustomText(draft.name, 50);
    builderEditingId = safeCustomText(draft.editingId, 100);
    builderExercises = (Array.isArray(draft.exercises) ? draft.exercises : [])
      .slice(0, MAX_CUSTOM_EXERCISES)
      .map(sanitizeCustomExercise)
      .filter(Boolean);
    if (builderEditingId && !customPlansForCurrentUser().some(plan => plan.id === builderEditingId)) {
      builderEditingId = '';
    }
  } catch {
    clearBuilderDraft();
  }
}

function builderExerciseFromCatalog(catalogExercise) {
  return sanitizeCustomExercise({
    instanceId: `custom-exercise-${createSessionId()}`,
    catalogId: catalogExercise.id,
    sets: 3,
    repRange: [8, 12]
  });
}

function equipmentMatches(exercise, selectedEquipment) {
  if (selectedEquipment === 'All') return true;
  const equipment = exercise.equipment.toLowerCase();
  const groups = {
    Machine: ['machine', 'plate loaded'],
    Cable: ['cable'],
    Dumbbells: ['dumbbell'],
    Barbell: ['barbell'],
    'Smith machine': ['smith machine'],
    Bodyweight: ['bodyweight']
  };
  if (selectedEquipment === 'Other') {
    return !Object.values(groups).flat().some(token => equipment.includes(token));
  }
  return (groups[selectedEquipment] || []).some(token => equipment.includes(token));
}

function builderRepOptions(selectedRange) {
  const selected = sanitizeRepRange(selectedRange).join('-');
  return [
    [[5, 8], '5-8 reps'],
    [[6, 10], '6-10 reps'],
    [[8, 12], '8-12 reps (recommended)'],
    [[10, 15], '10-15 reps'],
    [[15, 20], '15-20 reps']
  ].map(([range, label]) => `<option value="${range.join('-')}"${range.join('-') === selected ? ' selected' : ''}>${label}</option>`).join('');
}

function updateBuilderSummary() {
  const totalExercises = builderExercises.length;
  const totalSets = builderExercises.reduce((total, exercise) => total + setCountFor(exercise), 0);
  const estimatedMinutes = estimateCustomWorkoutMinutes(builderExercises);
  const summary = totalExercises
    ? `${totalExercises} ${totalExercises === 1 ? 'exercise' : 'exercises'} · ${totalSets} working sets · About ${estimatedMinutes} min`
    : '0 exercises selected';
  el('builderSummary').textContent = summary;
  const nameReady = Boolean(builderName.trim());
  const exercisesReady = totalExercises > 0;
  el('saveCustomWorkout').disabled = !nameReady || !exercisesReady;
  if (!exercisesReady) el('builderStatus').textContent = 'Add at least one exercise to continue.';
  else if (!nameReady) el('builderStatus').textContent = 'Give your workout a name before saving.';
  else el('builderStatus').textContent = `${summary}. Ready to save.`;
}

function renderBuilderExerciseList() {
  const container = el('customExerciseList');
  if (!builderExercises.length) {
    container.innerHTML = `<div class="builder-empty"><strong>No exercises yet</strong><p>Search the library below and add the machines or movements you want to train.</p></div>`;
    updateBuilderSummary();
    return;
  }

  container.innerHTML = builderExercises.map((exercise, index) => {
    const instanceId = escapeHtml(exercise.instanceId);
    const targets = profileFor(exercise).primary.map(muscleLabel).join(', ');
    return `<article class="builder-selected-card" draggable="true" data-exercise-id="${instanceId}">
      <div class="builder-drag-handle" aria-hidden="true">⋮⋮</div>
      <div class="builder-selected-header">
        <span class="builder-order" aria-hidden="true">${index + 1}</span>
        <div><h3>${escapeHtml(exercise.name)}</h3><p class="builder-meta">${escapeHtml(exercise.category)} · ${escapeHtml(exercise.equipment)}</p></div>
      </div>
      <p class="builder-targets"><b>Primary:</b> ${escapeHtml(targets)}</p>
      <div class="builder-control-grid">
        <label class="builder-control">Sets
          <select data-builder-control="sets" data-instance-id="${instanceId}" aria-label="Sets for ${escapeHtml(exercise.name)}">
            ${Array.from({ length: 10 }, (_, optionIndex) => optionIndex + 1).map(value => `<option value="${value}"${value === exercise.sets ? ' selected' : ''}>${value}</option>`).join('')}
          </select>
        </label>
        <label class="builder-control">Rep target
          <select data-builder-control="reps" data-instance-id="${instanceId}" aria-label="Rep target for ${escapeHtml(exercise.name)}">${builderRepOptions(exercise.repRange)}</select>
        </label>
      </div>
      <div class="builder-row-actions">
        <button type="button" data-remove-exercise data-instance-id="${instanceId}" aria-label="Remove ${escapeHtml(exercise.name)}">Remove</button>
      </div>
    </article>`;
  }).join('');

  container.querySelectorAll('[data-builder-control]').forEach(control => {
    control.onchange = () => {
      const exercise = builderExercises.find(candidate => candidate.instanceId === control.dataset.instanceId);
      if (!exercise) return;
      if (control.dataset.builderControl === 'sets') exercise.sets = Math.min(10, Math.max(1, Number(control.value) || 3));
      if (control.dataset.builderControl === 'reps') exercise.repRange = sanitizeRepRange(control.value.split('-').map(Number));
      persistBuilderDraft();
      updateBuilderSummary();
    };
  });

  let draggedItem = null;
  container.querySelectorAll('.builder-selected-card').forEach(card => {
    card.ondragstart = (e) => {
      draggedItem = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    };
    card.ondragend = () => {
      draggedItem = null;
      container.querySelectorAll('.builder-selected-card').forEach(c => c.classList.remove('dragging', 'drag-over'));
    };
    card.ondragover = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedItem && draggedItem !== card) {
        card.classList.add('drag-over');
      }
    };
    card.ondragleave = (e) => {
      if (e.target === card) {
        card.classList.remove('drag-over');
      }
    };
    card.ondrop = (e) => {
      e.preventDefault();
      if (draggedItem && draggedItem !== card) {
        const draggedIndex = builderExercises.findIndex(ex => ex.instanceId === draggedItem.dataset.exerciseId);
        const targetIndex = builderExercises.findIndex(ex => ex.instanceId === card.dataset.exerciseId);
        if (draggedIndex >= 0 && targetIndex >= 0) {
          [builderExercises[draggedIndex], builderExercises[targetIndex]] = [builderExercises[targetIndex], builderExercises[draggedIndex]];
          persistBuilderDraft();
          renderBuilder();
        }
      }
      card.classList.remove('drag-over');
    };
  });

  container.querySelectorAll('[data-remove-exercise]').forEach(button => {
    button.onclick = () => {
      builderExercises = builderExercises.filter(exercise => exercise.instanceId !== button.dataset.instanceId);
      persistBuilderDraft();
      renderBuilder();
    };
  });
  updateBuilderSummary();
}

const commonExerciseIds = new Set([
  'exercise-barbell-bench-press',
  'exercise-dumbbell-bench-press',
  'exercise-chest-press',
  'exercise-lat-pulldown',
  'exercise-seated-row',
  'exercise-shoulder-press',
  'exercise-biceps-curl',
  'exercise-triceps-pushdown',
  'exercise-barbell-back-squat',
  'exercise-leg-press',
  'exercise-leg-extension',
  'exercise-seated-leg-curl',
  'exercise-hip-thrust',
  'exercise-pull-up',
  'exercise-goblet-squat',
  'exercise-calf-raise',
  'exercise-push-up',
  'exercise-dumbbell-curl',
  'exercise-hammer-curl',
  'exercise-face-pull',
  'exercise-romanian-deadlift',
  'exercise-walking-lunge',
  'exercise-reverse-lunge',
  'exercise-lateral-raise',
  'exercise-cable-crunch',
  'exercise-dead-bug',
  'exercise-pec-deck'
]);

function renderBuilderCatalog() {
  const query = el('exerciseSearch').value.trim().toLowerCase();
  const category = el('exerciseCategory').value || 'All';
  const equipment = el('exerciseEquipment').value || 'All';
  const selectedCatalogIds = new Set(builderExercises.map(exercise => exercise.catalogId));

  let results = exerciseCatalog.filter(exercise => {
    const searchable = [exercise.name, exercise.category, exercise.equipment, ...exercise.primary, ...exercise.assists].join(' ').toLowerCase();
    return (!query || searchable.includes(query))
      && (category === 'All' || exercise.category === category)
      && equipmentMatches(exercise, equipment);
  });

  const isDefaultView = !query && category === 'All' && equipment === 'All';
  if (isDefaultView) {
    results = results.filter(exercise => commonExerciseIds.has(exercise.id));
  }

  el('exerciseCatalogCount').textContent = `${results.length} ${query || category !== 'All' || equipment !== 'All' ? 'matching ' : 'popular '}${results.length === 1 ? 'exercise' : 'exercises'}`;
  el('customExerciseCatalog').innerHTML = results.length ? results.map(exercise => {
    const alreadyAdded = selectedCatalogIds.has(exercise.id);
    const primary = exercise.primary.map(muscleLabel).join(', ');
    return `<article class="builder-catalog-card">
      <div class="builder-catalog-copy"><h3>${escapeHtml(exercise.name)}</h3><p>${escapeHtml(primary)} · ${escapeHtml(exercise.equipment)}</p></div>
      <button class="builder-add-button${alreadyAdded ? ' added' : ''}" type="button" data-add-exercise="${escapeHtml(exercise.id)}"${alreadyAdded || builderExercises.length >= MAX_CUSTOM_EXERCISES ? ' disabled' : ''} aria-label="${alreadyAdded ? 'Added' : 'Add'} ${escapeHtml(exercise.name)}">${alreadyAdded ? 'Added' : 'Add'}</button>
    </article>`;
  }).join('') : `<div class="builder-empty"><strong>No exercises found</strong><p>Try a different exercise name, muscle group, or equipment filter.</p></div>`;

  el('customExerciseCatalog').querySelectorAll('[data-add-exercise]').forEach(button => {
    button.onclick = () => {
      const catalogExercise = catalogExerciseById(button.dataset.addExercise);
      if (!catalogExercise || selectedCatalogIds.has(catalogExercise.id) || builderExercises.length >= MAX_CUSTOM_EXERCISES) return;
      const exercise = builderExerciseFromCatalog(catalogExercise);
      if (!exercise) return;
      builderExercises.push(exercise);
      persistBuilderDraft();
      renderBuilder();
    };
  });
}

function renderBuilder() {
  loadBuilderDraft();
  el('builderTitle').textContent = builderEditingId ? 'Edit your workout' : 'Build your workout';
  el('customWorkoutName').value = builderName;
  el('customWorkoutName').oninput = event => {
    builderName = event.currentTarget.value.slice(0, 50);
    persistBuilderDraft();
    updateBuilderSummary();
  };
  el('exerciseSearch').oninput = renderBuilderCatalog;
  el('exerciseCategory').onchange = renderBuilderCatalog;
  el('exerciseEquipment').onchange = renderBuilderCatalog;
  renderBuilderExerciseList();
  renderBuilderCatalog();
}

function openWorkoutBuilder(planId = '', fresh = false) {
  if (planId) {
    const plan = customPlansForCurrentUser().find(candidate => candidate.id === planId);
    if (!plan) return go('workout');
    builderName = plan.name;
    builderExercises = plan.exercises.map(exercise => sanitizeCustomExercise({ ...exercise })).filter(Boolean);
    builderEditingId = plan.id;
    builderLoaded = true;
    persistBuilderDraft();
  } else if (fresh) {
    resetBuilderState(true);
  } else {
    builderLoaded = false;
  }
  go('builder');
}

async function saveCustomWorkout() {
  if (!userProfile) return;
  builderName = safeCustomText(el('customWorkoutName').value, 50);
  builderExercises = builderExercises.map(sanitizeCustomExercise).filter(Boolean).slice(0, MAX_CUSTOM_EXERCISES);
  if (!builderName) {
    el('builderStatus').textContent = 'Enter a workout name before saving.';
    el('customWorkoutName').focus();
    return;
  }
  if (!builderExercises.length) {
    el('builderStatus').textContent = 'Add at least one exercise before saving.';
    return;
  }

  const existingPlans = customPlansForCurrentUser();
  const existing = existingPlans.find(plan => plan.id === builderEditingId);
  if (!existing && existingPlans.length >= MAX_CUSTOM_WORKOUTS) {
    el('builderStatus').textContent = `You can save up to ${MAX_CUSTOM_WORKOUTS} custom workouts. Delete one before adding another.`;
    return;
  }
  const now = Date.now();
  const plan = sanitizeCustomPlan({
    id: existing?.id || `custom-${createSessionId()}`,
    name: builderName,
    revision: (existing?.revision || 0) + 1,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    exercises: builderExercises
  });
  if (!plan) {
    el('builderStatus').textContent = 'This workout could not be prepared. Review the name and exercises, then try again.';
    return;
  }

  const previousPlans = userProfile.customWorkouts;
  const previousSync = profileSyncState(userProfile);
  const nextPlans = existing
    ? existingPlans.map(candidate => candidate.id === existing.id ? plan : candidate)
    : [plan, ...existingPlans];
  userProfile.customWorkouts = sanitizeCustomPlans(nextPlans);
  userProfile.profileSync = {
    ...previousSync,
    customWorkoutTombstones: previousSync.customWorkoutTombstones.filter(tombstone => tombstone.id !== plan.id)
  };
  markProfileDirty('customWorkout');
  if (!saveUserProfile()) {
    userProfile.customWorkouts = previousPlans;
    userProfile.profileSync = previousSync;
    el('builderStatus').textContent = 'Your workout could not be saved on this device. Check browser storage and try again.';
    return;
  }

  el('saveCustomWorkout').disabled = true;
  el('builderStatus').textContent = 'Workout saved. Updating your account...';
  if (cloudReady) {
    try {
      await saveCloudProfile();
    } catch {
      renderSyncStatus();
      alert('Workout saved on this device. Account sync is pending and will retry when the connection works.');
    }
  }
  resetBuilderState(true);
  renderPlans();
  detail(plan.id);
}

async function deleteCustomWorkout(planId) {
  if (!userProfile) return;
  const existingPlans = customPlansForCurrentUser();
  const plan = existingPlans.find(candidate => candidate.id === planId);
  if (!plan || !confirm(`Delete ${plan.name}? Completed workout history will stay saved.`)) return;
  const previousPlans = userProfile.customWorkouts;
  const previousSync = profileSyncState(userProfile);
  const deletedAt = nextProfileMutationTime(plan.updatedAt);
  userProfile.customWorkouts = existingPlans.filter(candidate => candidate.id !== planId);
  userProfile.profileSync = {
    ...previousSync,
    customWorkoutTombstones: sanitizeCustomWorkoutTombstones([
      ...previousSync.customWorkoutTombstones,
      { id: planId, deletedAt }
    ])
  };
  markProfileDirty('customWorkout');
  if (!saveUserProfile()) {
    userProfile.customWorkouts = previousPlans;
    userProfile.profileSync = previousSync;
    return alert('That workout could not be deleted from this device. Please try again.');
  }
  if (builderEditingId === planId) resetBuilderState(true);
  if (selectedPlan && planIdFor(selectedPlan) === planId) selectedPlan = null;
  renderPlans();
  if (cloudReady) {
    try {
      await saveCloudProfile();
    } catch {
      renderSyncStatus();
      alert('Workout deleted on this device. Account sync is pending and will retry when the connection works.');
    }
  }
}

function showAuthGate() {
  el('authGate').classList.remove('hidden');
  el('appShell').setAttribute('aria-hidden', 'true');
  document.body.classList.add('auth-open');
}

function hideAuthGate() {
  el('authGate').classList.add('hidden');
  el('appShell').removeAttribute('aria-hidden');
  document.body.classList.remove('auth-open');
}

function providerUnavailable(provider) {
  el('authNotice').textContent = `${provider} sign-in is not connected yet. Google sync is the secure account option for this build.`;
}

function initializeProfile() {
  renderIdentity();
  if (userProfile) hideAuthGate();
  else showAuthGate();
}

function renderHome() {
  const grade = overallGrade();
  const schedule = scheduledWorkoutStats();
  const allLogs = workoutHistory.flatMap(session => session.logs || []);
  const gymTime = gymTimeSummary();

  el('homeRank').innerHTML = overallGradeMarkup(grade, { compact: true, action: true });
  el('homeStats').innerHTML = `
    <article><strong>${workoutHistory.length}</strong><small>Workouts</small></article>
    <article><strong aria-label="${durationAriaLabel(gymTime.minutes)}">${formatDurationCompact(gymTime.minutes)}</strong><small>Time in gym</small></article>
    <article><strong>${allLogs.length}</strong><small>Logged sets</small></article>
    <article><strong>${schedule.streak}</strong><small>Workout streak</small></article>`;
  el('homePlanList').innerHTML = [plans[2], plans[3]].map(plan => {
    return `<button class="home-plan" data-plan-id="${planIdFor(plan)}">
      <span class="home-plan-icon" aria-hidden="true"><img src="assets/workouts/${plan.icon}.png" alt=""></span>
      <span><b>${plan.name}</b><small>${plan.exercises.length} exercises &middot; ${plan.time}</small></span>
      <i aria-hidden="true">&rarr;</i>
    </button>`;
  }).join('');
  renderPersonalProgramHome();
  bindPlanButtons(el('home'));
  const gradeAction = el('homeRank').querySelector('[data-page="profile"]');
  if (gradeAction) gradeAction.onclick = () => go('profile');
}

function renderPlans() {
  const program = personalProgramForCurrentUser();
  const customPlans = customPlansForCurrentUser();
  const programSection = el('accountProgramLibrary');
  if (program) {
    programSection.classList.remove('hidden');
    el('personalPlanList').innerHTML = `
      <details class="library-details" open>
        <summary>My weekly plan</summary>
        <div class="library-details-body">
          ${programScheduleMarkup(program)}${programInstructionsMarkup(program)}
        </div>
      </details>
    `;
    el('libraryTitle').textContent = 'Other premade workouts';
  } else {
    programSection.classList.add('hidden');
    el('personalPlanList').innerHTML = '';
    el('libraryTitle').textContent = 'Premade workouts';
  }
  const customSection = el('customWorkoutLibrary');
  if (customPlans.length) {
    customSection.classList.remove('hidden');
    el('customPlanList').innerHTML = customPlans.map(plan => `
      <article class="custom-plan-card">
        <span class="plan-icon" aria-hidden="true"><img src="assets/workouts/${escapeHtml(plan.icon)}.png" alt=""></span>
        <div><b>${escapeHtml(plan.name)}</b><small>${plan.exercises.length} exercises · ${totalSetsFor(plan)} work sets · About ${escapeHtml(plan.time)}</small></div>
        <div class="custom-plan-actions">
          <button type="button" data-plan-id="${escapeHtml(plan.id)}" aria-label="View ${escapeHtml(plan.name)}">View</button>
          <button type="button" data-edit-custom-id="${escapeHtml(plan.id)}" aria-label="Edit ${escapeHtml(plan.name)}">Edit</button>
          <button type="button" data-delete-custom-id="${escapeHtml(plan.id)}" aria-label="Delete ${escapeHtml(plan.name)}">Delete</button>
        </div>
      </article>`).join('');
  } else {
    customSection.classList.add('hidden');
    el('customPlanList').innerHTML = '';
  }
  el('planList').innerHTML = plans.map((plan, index) => `
    <article class="card plan-card">
      <span class="plan-icon" aria-hidden="true"><img src="assets/workouts/${plan.icon}.png" alt=""></span>
      <div><b>${plan.name}</b><small>${plan.type} - Estimated ${plan.time}</small></div>
      <button class="edit" data-plan-id="${planIdFor(plan)}" aria-label="View ${plan.name}">View</button>
    </article>`).join('');
  bindPlanButtons(el('workout'));
  el('customPlanList').querySelectorAll('[data-edit-custom-id]').forEach(button => {
    button.onclick = () => openWorkoutBuilder(button.dataset.editCustomId);
  });
  el('customPlanList').querySelectorAll('[data-delete-custom-id]').forEach(button => {
    button.onclick = () => { void deleteCustomWorkout(button.dataset.deleteCustomId); };
  });
}

function anatomyView(view, map) {
  const pieces = view.pieces.map(piece => `<i class="focus-piece ${piece}" aria-hidden="true"></i>`).join('');
  const ariaLabel = `${view.side} anatomy view highlighting ${map.anatomy}`;
  return `<div class="anatomy-view">
    <div class="anatomy-viewport crop-${view.crop}" role="img" aria-label="${ariaLabel}">
      <div class="anatomy-stage ${view.focus}">
        <img src="assets/${view.image}" alt="" aria-hidden="true">
        ${pieces}
      </div>
      <span class="view-label">${view.side} view</span>
    </div>
  </div>`;
}

function muscleCard(muscle, exerciseCount) {
  const map = muscleMaps[muscle];
  if (!map) return '';
  const countLabel = `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  return `<article class="focus-card">
    <header class="focus-card-header">
      <div>
        <span class="target-type">PRIMARY TARGET</span>
        <h3>${map.label}</h3>
        <p>${map.anatomy}</p>
      </div>
      <span class="target-count">${countLabel}</span>
    </header>
    <div class="focus-views ${map.views.length > 1 ? 'paired' : ''}">
      ${map.views.map(view => anatomyView(view, map)).join('')}
    </div>
    <p class="focus-note">${map.description}</p>
  </article>`;
}

function populatePlanDetail(plan) {
  if (!plan) return false;
  selectedPlan = plan;
  const targetCounts = targetCountsFor(plan);
  el('detailTitle').textContent = plan.name;
  el('detailText').textContent = `${plan.day ? `${plan.day} - ` : ''}${plan.type} - Estimated ${plan.time} - ${plan.exercises.length} exercises - ${totalSetsFor(plan)} work sets`;
  if (plan.personal) {
    el('planGuidance').classList.remove('hidden');
    el('planGuidance').innerHTML = `<span>YOUR WEEKLY PLAN</span><b>${plan.day}'s session</b><p>Follow each prescribed rep range and save the weight and reps after every set.</p>`;
  } else {
    el('planGuidance').classList.add('hidden');
    el('planGuidance').innerHTML = '';
  }
  const draft = loadActiveWorkoutDraft();
  const canResume = draft && draft.accountKey === draftAccountKey() && draft.planId === planIdFor(plan);
  el('start').textContent = canResume ? 'Resume workout' : 'Start workout';
  el('focusMap').innerHTML = [...targetCounts].map(([muscle, count]) => muscleCard(muscle, count)).join('');
  return true;
}

function detail(planId) {
  const plan = findVisiblePlan(planId);
  if (!populatePlanDetail(plan)) return go('workout');
  go('detail');
}

function showActiveWorkoutDetail() {
  if (!populatePlanDetail(activePlan)) return go('workout');
  go('detail');
}

function exerciseSetCard(exercise, index) {
  const profile = profileFor(exercise);
  const setCount = setCountFor(exercise);
  const repRange = repRangeFor(exercise);
  const primaryTargets = profile.primary
    .map(muscle => `<span class="muscle-label">${muscleLabel(muscle)}</span>`)
    .join('');
  const assistingTargets = profile.assists.length
    ? `<p class="assist-label"><b>Also works:</b> ${escapeHtml(profile.assists.map(muscleLabel).join(', '))}</p>`
    : '';
  return `
    <section class="set-row">
      <div class="exercise-heading"><h3>${escapeHtml(exercise.name)}</h3><span>${setCount} sets &middot; ${escapeHtml(repRange)}</span></div>
      ${exercise.note ? `<p class="exercise-note">${escapeHtml(exercise.note)}</p>` : ''}
      <div class="exercise-targets"><span class="target-prefix">Primary</span>${primaryTargets}</div>
      ${assistingTargets}
      <div class="set-grid">
        <b>Set</b><b>Weight</b><b>Reps</b><b>Type</b><b>Save</b>
        ${Array.from({ length: setCount }, (_, setIndex) => setIndex + 1).map(set => `
          <span>${set}</span>
          <input id="w-${index}-${set}" type="number" min="0" inputmode="decimal" placeholder="lb" aria-label="${escapeHtml(exercise.name)} set ${set} weight">
          <input id="r-${index}-${set}" type="number" min="1" inputmode="numeric" placeholder="${exercise.repRange ? `${exercise.repRange[0]}-${exercise.repRange[1]}` : 'reps'}" aria-label="${escapeHtml(exercise.name)} set ${set} reps; target ${escapeHtml(repRange)}">
          <select class="set-type-select" data-type-log="${index}-${set}" aria-label="Set type for ${escapeHtml(exercise.name)} set ${set}">
            <option value="Warmup">Warmup</option>
            <option value="Normal" selected>Normal</option>
            <option value="Failure">Failure</option>
          </select>
          <button class="complete" type="button" data-log="${index}-${set}" aria-label="Save ${escapeHtml(exercise.name)} set ${set}">Save</button>`).join('')}
      </div>
    </section>`;
}

function setSaveMessage(message, tone = '') {
  const notice = el('setSaveNotice');
  notice.textContent = message;
  notice.classList.toggle('success', tone === 'success');
  notice.classList.toggle('error', tone === 'error');
}

function updateWorkoutFinishState() {
  const total = activePlan ? totalSetsFor(activePlan) : 0;
  const saved = logs.length;
  el('savedSetCount').textContent = `${saved} of ${total} sets saved`;
  el('workoutProgress').max = Math.max(total, 1);
  el('workoutProgress').value = saved;
  el('finish').disabled = false;
  if (saved === 0) {
    el('finishHint').textContent = 'End anytime. An empty workout is recorded as incomplete and receives a very low grade.';
  } else if (saved >= total) {
    el('finishHint').textContent = 'Workout complete ✅';
  } else {
    const remaining = total - saved;
    el('finishHint').textContent = `${remaining} ${remaining === 1 ? 'set is' : 'sets are'} still unsaved. You can finish a partial workout.`;
  }
}

function updateRestTimer() {
  const timer = el('restTimer');
  if (!timer) return;
  if (!restTimerEndsAt) {
    timer.classList.add('hidden');
    timer.textContent = 'Rest timer';
    return;
  }
  const remainingSeconds = Math.max(0, Math.ceil((restTimerEndsAt - Date.now()) / 1000));
  if (remainingSeconds <= 0) {
    timer.classList.add('hidden');
    timer.textContent = 'Rest timer';
    restTimerEndsAt = 0;
    if (restTimerInterval) clearInterval(restTimerInterval);
    restTimerInterval = null;
    return;
  }
  timer.classList.remove('hidden');
  timer.textContent = `Rest ${remainingSeconds}s`;
}

function startRestTimer(seconds = 90) {
  restTimerEndsAt = Date.now() + seconds * 1000;
  if (restTimerInterval) clearInterval(restTimerInterval);
  updateRestTimer();
  restTimerInterval = setInterval(updateRestTimer, 1000);
}

function applySavedSetToControls(log) {
  const weightInput = el(`w-${log.exerciseIndex}-${log.set}`);
  const repsInput = el(`r-${log.exerciseIndex}-${log.set}`);
  const typeSelect = el('setList').querySelector(`[data-type-log="${log.exerciseIndex}-${log.set}"]`);
  const button = el('setList').querySelector(`[data-log="${log.exerciseIndex}-${log.set}"]`);
  if (!weightInput || !repsInput || !typeSelect || !button) return;
  weightInput.value = String(log.weight);
  repsInput.value = String(log.reps);
  typeSelect.value = log.setType || 'Normal';
  weightInput.readOnly = true;
  repsInput.readOnly = true;
  typeSelect.disabled = true;
  weightInput.classList.add('saved-input');
  repsInput.classList.add('saved-input');
  button.textContent = 'Edit';
  button.classList.add('done');
  button.setAttribute('aria-label', `Edit saved ${log.exercise} set ${log.set}`);
}

function updateActiveElapsed() {
  const display = el('activeElapsed');
  if (!display || !activeStartedAt) return;
  const elapsedMilliseconds = Math.max(0, Date.now() - activeStartedAt);
  display.textContent = formatElapsedClock(elapsedMilliseconds);
  display.setAttribute('aria-label', durationAriaLabel(Math.floor(elapsedMilliseconds / MINUTE_MS)));
}

function stopActiveWorkoutTimer() {
  if (workoutTimerInterval !== null) clearInterval(workoutTimerInterval);
  workoutTimerInterval = null;
}

function startActiveWorkoutTimer() {
  stopActiveWorkoutTimer();
  updateActiveElapsed();
  workoutTimerInterval = setInterval(updateActiveElapsed, 1000);
}

function renderActiveWorkout() {
  if (!activePlan) return;
  el('start').textContent = 'Resume workout';
  el('activeTitle').textContent = activePlan.name;
  el('setList').innerHTML = activePlan.exercises.map(exerciseSetCard).join('');
  el('setList').querySelectorAll('[data-log]').forEach(button => {
    button.onclick = () => button.classList.contains('done') ? editSavedSet(button) : saveSet(button);
  });
  el('setList').querySelectorAll('.set-type-select').forEach(select => {
    select.onchange = () => {
      const savedButton = el('setList').querySelector(`[data-log="${select.dataset.typeLog}"]`);
      if (savedButton && savedButton.classList.contains('done')) {
        savedButton.click();
      }
    };
  });
  logs.forEach(applySavedSetToControls);
  updateWorkoutFinishState();
  updateRestTimer();
  startActiveWorkoutTimer();
  setSaveMessage(logs.length
    ? `${logs.length} saved ${logs.length === 1 ? 'set was' : 'sets were'} restored on this device.`
    : 'Enter your weight and reps, then save each set.', logs.length ? 'success' : '');
}

function applyActiveDraft(draft, plan) {
  selectedPlan = plan;
  activePlan = plan;
  const restoredStart = validTimestamp(draft.startedAt);
  activeStartedAt = restoredStart && restoredStart <= Date.now() ? restoredStart : Date.now();
  activeSessionId = typeof draft.sessionId === 'string' && draft.sessionId ? draft.sessionId : createSessionId();
  activeScheduleContext = sanitizeScheduleContext(draft.scheduleContext);
  logs = validDraftLogs(draft, plan);
  renderActiveWorkout();
  persistActiveWorkout();
}

function restoreActiveWorkout(navigate = true) {
  const draft = loadActiveWorkoutDraft();
  if (!draft || !userProfile) return false;
  if (!draftAccountKey() || draft.accountKey !== draftAccountKey()) {
    clearActiveWorkoutDraft();
    return false;
  }
  if (draft.sessionId && workoutHistory.some(session => session.id === draft.sessionId)) {
    clearActiveWorkoutDraft();
    return false;
  }
  const plan = planFromDraft(draft, findVisiblePlan(draft.planId));
  if (!plan) {
    clearActiveWorkoutDraft();
    return false;
  }
  applyActiveDraft(draft, plan);
  if (navigate) go('active');
  return true;
}

function startWorkout() {
  if (!selectedPlan) return go('workout');
  let existingDraft = loadActiveWorkoutDraft();
  if (existingDraft?.sessionId && workoutHistory.some(session => session.id === existingDraft.sessionId)) {
    clearActiveWorkoutDraft();
    existingDraft = null;
  }
  if (existingDraft && existingDraft.accountKey === draftAccountKey()) {
    if (existingDraft.planId === planIdFor(selectedPlan)) {
      applyActiveDraft(existingDraft, planFromDraft(existingDraft, selectedPlan));
      go('active');
      return;
    }
    const existingPlan = findVisiblePlan(existingDraft.planId);
    const description = existingPlan?.name || 'another workout';
    if (!confirm(`You have an unfinished ${description}. Starting this workout will discard that draft. Continue?`)) return;
    clearActiveWorkoutDraft();
  } else if (existingDraft) {
    clearActiveWorkoutDraft();
  }

  logs = [];
  activePlan = selectedPlan;
  activeStartedAt = Date.now();
  activeSessionId = createSessionId();
  activeScheduleContext = scheduleContextForPlan(selectedPlan, activeStartedAt);
  if (!persistActiveWorkout()) {
    activePlan = null;
    activeStartedAt = 0;
    activeSessionId = '';
    activeScheduleContext = null;
    return alert('This workout could not be saved on this device. Check that Safari storage is available, then try again.');
  }
  renderActiveWorkout();
  go('active');
}

function saveSet(button) {
  const [exerciseIndex, set] = button.dataset.log.split('-').map(Number);
  const weightInput = el(`w-${exerciseIndex}-${set}`);
  const repsInput = el(`r-${exerciseIndex}-${set}`);
  const typeSelect = el('setList').querySelector(`[data-type-log="${exerciseIndex}-${set}"]`);
  const weight = Number(weightInput.value);
  const reps = Number(repsInput.value);
  const setType = typeSelect ? typeSelect.value : 'Normal';
  if (!weightInput.value.trim() || !repsInput.value.trim() || !Number.isFinite(weight) || weight < 0 || !Number.isInteger(reps) || reps < 1) {
    setSaveMessage('Enter a valid weight and at least 1 whole rep. Use 0 lb for bodyweight exercises.', 'error');
    (!weightInput.value.trim() || !Number.isFinite(weight) || weight < 0 ? weightInput : repsInput).focus();
    return;
  }
  if (!activePlan) return setSaveMessage('Start a workout before saving a set.', 'error');
  const exercise = activePlan.exercises[exerciseIndex];
  if (!exercise) return setSaveMessage('This set could not be matched to an exercise.', 'error');
  const nextLog = {
    exerciseIndex,
    weight,
    reps,
    set,
    setType,
    exerciseId: safeCustomText(exercise.catalogId || exercise.targetKey || exercise.instanceId, 100),
    exercise: exercise.name,
    muscleTargets: profileFor(exercise).primary,
    savedAt: Date.now()
  };
  const existingIndex = logs.findIndex(log => log.exerciseIndex === exerciseIndex && log.set === set);
  const previousLog = existingIndex >= 0 ? logs[existingIndex] : null;
  if (existingIndex >= 0) logs[existingIndex] = nextLog;
  else logs.push(nextLog);
  if (!persistActiveWorkout()) {
    if (existingIndex >= 0) logs[existingIndex] = previousLog;
    else logs.pop();
    setSaveMessage('This set could not be stored. Your inputs are still here—please try Save again.', 'error');
    return;
  }
  applySavedSetToControls(nextLog);
  updateWorkoutFinishState();
  startRestTimer(90);
  setSaveMessage(`Saved ${exercise.name}, set ${set}: ${weight} lb x ${reps} reps (${setType}). Tap Edit if you need to change it.`, 'success');
}

function editSavedSet(button) {
  const [exerciseIndex, set] = button.dataset.log.split('-').map(Number);
  const logIndex = logs.findIndex(log => log.exerciseIndex === exerciseIndex && log.set === set);
  if (logIndex < 0) return;
  const previousLog = logs[logIndex];
  logs.splice(logIndex, 1);
  if (!persistActiveWorkout()) {
    logs.splice(logIndex, 0, previousLog);
    setSaveMessage('This saved set could not be opened for editing. Please try again.', 'error');
    return;
  }
  const weightInput = el(`w-${exerciseIndex}-${set}`);
  const repsInput = el(`r-${exerciseIndex}-${set}`);
  const typeSelect = el('setList').querySelector(`[data-type-log="${exerciseIndex}-${set}"]`);
  weightInput.readOnly = false;
  repsInput.readOnly = false;
  typeSelect.disabled = false;
  weightInput.classList.remove('saved-input');
  repsInput.classList.remove('saved-input');
  button.textContent = 'Save';
  button.classList.remove('done');
  button.setAttribute('aria-label', `Save ${previousLog.exercise} set ${set}`);
  updateWorkoutFinishState();
  setSaveMessage(`${previousLog.exercise}, set ${set} is ready to edit. Save it again to keep the changes.`);
  weightInput.focus();
}

function dayKey(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromDayKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '')) return null;
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return Number.isFinite(date.getTime()) ? date : null;
}

function weekdayForDayKey(key) {
  const date = dateFromDayKey(key);
  return date ? new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date) : '';
}

function scheduledOccurrenceId(program, slot, scheduledFor) {
  return `${program.id}:${slot.id}:${scheduledFor}`;
}

function sessionHasWorkingSets(session) {
  return (session?.logs || []).some(log => sanitizeSetType(log.setType) !== 'Warmup');
}

function sessionScheduledFor(session, program, slots) {
  if (!sessionHasWorkingSets(session)) return null;
  const explicitDate = /^\d{4}-\d{2}-\d{2}$/.test(session.scheduledFor || '') ? session.scheduledFor : '';
  if (explicitDate && session.scheduleId === program.id && slots.some(slot => slot.id === session.scheduleSlotId)) {
    return { scheduledFor: explicitDate, slotId: session.scheduleSlotId };
  }
  if (session.program !== program.name || !session.planId || !validTimestamp(session.completedAt)) return null;
  const legacyDate = dayKey(session.completedAt);
  const weekday = weekdayForDayKey(legacyDate);
  const slot = slots.find(candidate => candidate.planId === session.planId && candidate.day === weekday);
  return slot ? { scheduledFor: legacyDate, slotId: slot.id } : null;
}

function scheduleContextForPlan(plan, startedAt, history = workoutHistory) {
  const program = personalProgramForCurrentUser();
  if (!program || !plan?.personal) return null;
  const scheduledFor = dayKey(startedAt);
  const weekday = weekdayForDayKey(scheduledFor);
  const slot = program.schedule.find(entry => entry.planId === planIdFor(plan) && entry.day === weekday);
  if (!slot?.id) return null;
  const occurrenceId = scheduledOccurrenceId(program, slot, scheduledFor);
  const alreadyCompleted = history.some(session => {
    const match = sessionScheduledFor(session, program, program.schedule.filter(entry => entry.planId && entry.id));
    return match && scheduledOccurrenceId(program, { id: match.slotId }, match.scheduledFor) === occurrenceId;
  });
  return alreadyCompleted ? null : {
    scheduleId: program.id,
    scheduleSlotId: slot.id,
    scheduledFor
  };
}

function scheduledWorkoutStats({
  program = personalProgramForCurrentUser(),
  history = workoutHistory,
  now = Date.now()
} = {}) {
  if (!program?.schedule?.length) {
    return { hasSchedule: false, streak: 0, consistencyPercent: null, completedSlots: 0, resolvedSlots: 0, milestone: 0, restDayToday: false };
  }
  const slots = program.schedule.filter(entry => entry.planId && entry.id);
  const completions = new Set();
  (Array.isArray(history) ? history : []).forEach(session => {
    const match = sessionScheduledFor(session, program, slots);
    if (!match) return;
    completions.add(scheduledOccurrenceId(program, { id: match.slotId }, match.scheduledFor));
  });
  const completedDates = [...completions].map(id => id.slice(id.lastIndexOf(':') + 1)).filter(Boolean);
  if (!completedDates.length) {
    const weekday = weekdayForDayKey(dayKey(now));
    return {
      hasSchedule: true,
      streak: 0,
      consistencyPercent: null,
      completedSlots: 0,
      resolvedSlots: 0,
      milestone: 0,
      restDayToday: Boolean(program.schedule.find(entry => entry.day === weekday)?.rest)
    };
  }
  const today = dayKey(now);
  const startKey = completedDates.sort()[0];
  const cursor = dateFromDayKey(startKey);
  const end = dateFromDayKey(today);
  const occurrences = [];
  while (cursor && end && cursor <= end) {
    const scheduledFor = dayKey(cursor);
    const weekday = weekdayForDayKey(scheduledFor);
    slots.filter(slot => slot.day === weekday).forEach((slot, sequence) => {
      occurrences.push({
        id: scheduledOccurrenceId(program, slot, scheduledFor),
        scheduledFor,
        slotId: slot.id,
        sequence
      });
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  const resolved = [];
  let streak = 0;
  occurrences.forEach(occurrence => {
    const complete = completions.has(occurrence.id);
    if (occurrence.scheduledFor === today && !complete) return;
    resolved.push({ ...occurrence, complete });
    streak = complete ? streak + 1 : 0;
  });
  const recent = resolved.slice(-10);
  const completedSlots = recent.filter(item => item.complete).length;
  const consistencyPercent = recent.length ? (completedSlots / recent.length) * 100 : null;
  const milestone = [50, 25, 10, 5].find(value => streak >= value) || 0;
  const todayEntry = program.schedule.find(entry => entry.day === weekdayForDayKey(today));
  return {
    hasSchedule: true,
    streak,
    consistencyPercent,
    completedSlots,
    resolvedSlots: recent.length,
    milestone,
    restDayToday: Boolean(todayEntry?.rest)
  };
}

function sessionScore(session, muscle) {
  return (session.logs || [])
    .filter(log => (log.muscleTargets || []).includes(muscle))
    .reduce((total, log) => total + log.reps * (1 + Math.min(log.weight, 400) / 100), 0);
}

function muscleTraining(muscle) {
  const sessions = workoutHistory.filter(session => (session.muscles || []).includes(muscle));
  const now = Date.now();
  const recentDays = new Set(sessions
    .filter(session => now - session.completedAt <= 28 * 24 * 60 * 60 * 1000)
    .map(session => dayKey(session.completedAt)));
  const totalScore = sessions.reduce((total, session) => total + sessionScore(session, muscle), 0);
  const performance = Math.min(45, totalScore / 30);
  const consistency = Math.min(30, (recentDays.size / 12) * 30);
  let progress = 0;
  if (sessions.length >= 4) {
    const splitAt = Math.floor(sessions.length / 2);
    const early = sessions.slice(0, splitAt);
    const recent = sessions.slice(splitAt);
    const earlyAverage = early.reduce((total, session) => total + sessionScore(session, muscle), 0) / early.length;
    const recentAverage = recent.reduce((total, session) => total + sessionScore(session, muscle), 0) / recent.length;
    progress = earlyAverage ? Math.max(0, Math.min(25, ((recentAverage - earlyAverage) / earlyAverage) * 50 + 8)) : 0;
  }
  return {
    sessions,
    score: Math.min(100, performance + consistency + progress),
    totalSets: sessions.reduce((total, session) => total + (session.logs || []).filter(log => (log.muscleTargets || []).includes(muscle)).length, 0),
    trainingDays: recentDays.size
  };
}

function rankForScore(score, eligible) {
  if (!eligible) return null;
  return [...rankLadder].reverse().find(rank => score >= rank.minimum) || rankLadder[0];
}

function overallGrade(history = workoutHistory, schedule = scheduledWorkoutStats({ history })) {
  const graded = (Array.isArray(history) ? history : [])
    .map(session => ({ session, grade: sanitizeWorkoutGrade(session.grade) }))
    .filter(item => item.grade)
    .sort((left, right) => (left.session.completedAt || 0) - (right.session.completedAt || 0));
  const recent = graded.slice(-10);
  if (!recent.length) {
    return {
      percentage: null,
      letter: '',
      label: 'Not graded yet',
      gradedWorkouts: 0,
      recentAverage: null,
      consistencyPercent: schedule.consistencyPercent,
      trend: null
    };
  }
  const recentAverage = recent.reduce((total, item) => total + item.grade.percentage, 0) / recent.length;
  const consistencyPercent = Number.isFinite(schedule.consistencyPercent)
    ? schedule.consistencyPercent
    : recentAverage;
  const percentage = clampGradeScore(recentAverage * .80 + consistencyPercent * .20);
  const letter = workoutLetterForPercentage(percentage);
  const latestFive = graded.slice(-5).map(item => item.grade.percentage);
  const priorFive = graded.slice(-10, -5).map(item => item.grade.percentage);
  const latestAverage = latestFive.reduce((total, value) => total + value, 0) / latestFive.length;
  const priorAverage = priorFive.length
    ? priorFive.reduce((total, value) => total + value, 0) / priorFive.length
    : null;
  return {
    percentage,
    letter,
    label: workoutGradeLabel(letter),
    gradedWorkouts: recent.length,
    recentAverage,
    consistencyPercent,
    trend: priorAverage === null ? null : Math.round(latestAverage - priorAverage)
  };
}

function gradeClass(letter) {
  return `grade-${String(letter || 'f').toLowerCase()}`;
}

function overallGradeMarkup(result, { compact = false, action = false } = {}) {
  if (result.percentage === null) {
    return `<article class="overall-grade-card ungraded ${compact ? 'compact' : ''}">
      <div class="overall-grade-score"><strong>—</strong><span>NO GRADE</span></div>
      <div class="overall-grade-copy"><span class="rank-kicker">OVERALL GRADE</span><h2>Build your baseline</h2><p>Complete a workout to earn your first grade.</p></div>
      ${action ? '<button type="button" data-page="profile">View profile</button>' : ''}
    </article>`;
  }
  const trend = result.trend === null
    ? 'Baseline forming'
    : result.trend > 0
      ? `Up ${result.trend} points`
      : result.trend < 0
        ? `Down ${Math.abs(result.trend)} points`
        : 'Holding steady';
  return `<article class="overall-grade-card ${gradeClass(result.letter)} ${compact ? 'compact' : ''}">
    <div class="overall-grade-score"><strong>${result.letter}</strong><span>${result.percentage}%</span></div>
    <div class="overall-grade-copy"><span class="rank-kicker">OVERALL GRADE</span><h2>${escapeHtml(result.label)}</h2><p>${result.gradedWorkouts} recent graded workout${result.gradedWorkouts === 1 ? '' : 's'} &middot; ${escapeHtml(trend)}</p></div>
    ${action ? '<button type="button" data-page="profile">View profile</button>' : ''}
  </article>`;
}

function workoutStreakMarkup(stats, compact = false) {
  const streakText = stats.streak === 1 ? '1 workout' : `${stats.streak} workouts`;
  const detail = !stats.hasSchedule
    ? 'Connect a weekly schedule to build a protected streak.'
    : stats.restDayToday
      ? 'Rest day today. Your streak is protected.'
      : stats.resolvedSlots
        ? `${stats.completedSlots} of ${stats.resolvedSlots} recent scheduled workouts completed.`
        : 'Complete your next scheduled workout to begin.';
  return `<article class="workout-streak-card ${compact ? 'compact' : ''}" data-milestone="${stats.milestone || 0}">
    <span class="streak-flame" aria-hidden="true"></span>
    <div><span class="rank-kicker">SCHEDULE STREAK</span><strong>${stats.hasSchedule ? streakText : 'No streak yet'}</strong><small>${escapeHtml(detail)}</small></div>
  </article>`;
}

function overallRank() {
  const trainedMuscles = Object.keys(muscleMaps).filter(muscle => muscleTraining(muscle).sessions.length);
  const stats = trainedMuscles.map(muscleTraining);
  const score = stats.length ? stats.reduce((total, stat) => total + stat.score, 0) / stats.length : 0;
  return {
    score,
    rank: rankForScore(score, workoutHistory.length >= minimumRankWorkouts),
    workoutsRemaining: Math.max(0, minimumRankWorkouts - workoutHistory.length)
  };
}

function rankSummaryMarkup(result, compact = false) {
  if (!result.rank) {
    const completeText = result.workoutsRemaining === 1 ? '1 more completed workout' : `${result.workoutsRemaining} more completed workouts`;
    return `<article class="rank-summary unranked ${compact ? 'compact' : ''}">
      ${rankBadgeMarkup(null, 'summary')}
      <div>
        <span class="rank-kicker">TRAINING RANK</span>
        <h2>Unranked</h2>
        <p>Log ${completeText} to unlock ranks. Your score uses saved performance, consistency, and progress—not appearance.</p>
      </div>
    </article>`;
  }
  return `<article class="rank-summary ${compact ? 'compact' : ''}">
    ${rankBadgeMarkup(result.rank, 'summary')}
    <div>
      <span class="rank-kicker">TRAINING RANK</span>
      <h2>${result.rank.name}</h2>
      <p>${result.rank.band} &middot; Earned from your logged training performance, consistency, and progress.</p>
    </div>
  </article>`;
}

function gradeBreakdownRow(label, component, weight) {
  const score = clampGradeScore(component?.score);
  return `<div class="grade-breakdown-row">
    <div><span>${escapeHtml(label)}</span><small>${weight}% of grade</small><strong>${score}%</strong></div>
    <progress max="100" value="${score}" aria-label="${escapeHtml(label)}, ${score} percent">${score}%</progress>
  </div>`;
}

function renderWorkoutSummary(session, { reveal = true, navigate = true } = {}) {
  const grade = sanitizeWorkoutGrade(session?.grade);
  if (!session || !grade) return false;
  const card = el('workoutGradeCard');
  const gradeClassName = gradeClass(grade.letter);
  el('summary').dataset.grade = grade.letter;
  card.className = `workout-grade-card ${gradeClassName}`;
  card.setAttribute('aria-label', `Workout grade ${grade.letter}, ${grade.percentage} percent. ${grade.label}.`);
  el('workoutSummaryTitle').textContent = session.plan || 'Workout summary';
  const duration = sessionDurationMinutes(session);
  el('workoutSummaryMeta').textContent = [
    duration ? formatDurationLong(duration) : '',
    `${(session.logs || []).length} saved ${(session.logs || []).length === 1 ? 'set' : 'sets'}`,
    `${formatNumber(workoutVolume(session))} lb volume`
  ].filter(Boolean).join(' · ');
  el('workoutGradeLetter').textContent = grade.letter;
  el('workoutGradeLabel').textContent = grade.label;
  el('workoutGradeExplanation').textContent = grade.explanation;
  el('workoutGradeBreakdown').innerHTML = [
    gradeBreakdownRow('Exercise completion', grade.components.exerciseCompletion, 30),
    gradeBreakdownRow('Set completion', grade.components.setCompletion, 30),
    gradeBreakdownRow('Rep target accuracy', grade.components.repAccuracy, 25),
    gradeBreakdownRow('Personal progress', grade.components.personalProgress, 15)
  ].join('');
  const completedExercises = grade.components.exerciseCompletion.completed;
  el('workoutSummaryStats').innerHTML = `
    <article><span>Exercises</span><strong>${completedExercises}/${grade.components.exerciseCompletion.planned}</strong></article>
    <article><span>Working sets</span><strong>${grade.components.setCompletion.completed}/${grade.components.setCompletion.planned}</strong></article>
    <article><span>Time</span><strong>${escapeHtml(duration ? formatDurationCompact(duration) : '—')}</strong></article>`;
  el('workoutGradeAnnouncement').textContent = '';
  const percentElement = el('workoutGradePercent');
  const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canAnimate = reveal && !reduceMotion && typeof requestAnimationFrame === 'function';
  card.classList.toggle('is-revealing', canAnimate);
  if (!canAnimate) {
    percentElement.textContent = `${grade.percentage}%`;
    el('workoutGradeAnnouncement').textContent = `Workout complete. Grade ${grade.letter}, ${grade.percentage} percent.`;
  } else {
    const started = performance.now();
    const animate = now => {
      const progress = Math.min(1, (now - started) / 450);
      percentElement.textContent = `${Math.round(grade.percentage * progress)}%`;
      if (progress < 1) requestAnimationFrame(animate);
      else {
        card.classList.remove('is-revealing');
        el('workoutGradeAnnouncement').textContent = `Workout complete. Grade ${grade.letter}, ${grade.percentage} percent.`;
      }
    };
    requestAnimationFrame(animate);
  }
  if (navigate) {
    go('summary');
    el('workoutSummaryTitle').focus();
  }
  return true;
}

function openWorkoutSummary(sessionId) {
  const session = workoutHistory.find(item => item.id === sessionId);
  if (session) renderWorkoutSummary(session, { reveal: false, navigate: true });
}

function muscleRankMarkup(muscle) {
  const training = muscleTraining(muscle);
  const rank = rankForScore(training.score, workoutHistory.length >= minimumRankWorkouts && training.sessions.length >= minimumMuscleSessions);
  const map = muscleMaps[muscle];
  const status = rank
    ? `<span class="muscle-rank-band">${rank.band}</span>`
    : `<span class="muscle-rank-band">Unranked</span>`;
  const detail = rank
    ? `${training.totalSets} logged sets &middot; ${training.trainingDays} training days in the last 28 days`
    : training.sessions.length
      ? `${training.sessions.length} of ${minimumMuscleSessions} muscle sessions recorded`
      : 'Record a workout that targets this muscle group';
  return `<article class="muscle-rank">
    ${rankBadgeMarkup(rank, 'small')}
    <div><b>${map.label}</b><small>${rank ? rank.name : 'Unranked'} &middot; ${detail}</small></div>
    ${status}
  </article>`;
}

function renderProfile() {
  renderIdentity();
  const grade = overallGrade();
  const schedule = scheduledWorkoutStats();
  const records = exerciseRecordData().slice(0, 3);
  el('profileOverview').innerHTML = `<article class="profile-account-card">
    <div class="profile-photo-wrap">
      ${avatarMarkup('large', 'profilePhotoPreview')}
      <label class="profile-photo-button" for="profilePhotoInput">Choose photo</label>
      <input id="profilePhotoInput" class="sr-only" type="file" accept="image/*">
      <div id="profilePhotoActions" class="profile-photo-actions${pendingProfilePhoto ? '' : ' hidden'}">
        <button id="confirmProfilePhoto" type="button" class="profile-photo-confirm">Save photo</button>
        <button id="cancelProfilePhoto" type="button" class="profile-photo-cancel">Cancel</button>
      </div>
      <small id="photoStatus" class="photo-status" aria-live="polite"></small>
    </div>
    <div><span class="rank-kicker">YOUR ACCOUNT</span><strong>${escapeHtml(userProfile?.name || 'Your profile')}</strong><small>${escapeHtml(userProfile?.email || 'Local profile')}</small></div>
    <div class="profile-rank-mini profile-grade-mini">${grade.percentage === null ? '<span>NO GRADE</span>' : `<strong>${grade.letter}</strong><b>${grade.percentage}% overall</b>`}</div>
  </article>`;
  el('profilePhotoInput').onchange = event => void handleProfilePhotoUpload(event.currentTarget);
  el('confirmProfilePhoto').onclick = confirmProfilePhoto;
  el('cancelProfilePhoto').onclick = cancelProfilePhoto;
  el('profileMaxes').innerHTML = records.length ? records.map(record => {
    const value = record.isBodyweight ? `${record.bestReps.reps} reps` : `${Math.round(record.estimatedMax)} lb`;
    return `<article><small>${escapeHtml(record.exercise)}</small><strong>${value}</strong><em>${record.isBodyweight ? 'Best set' : 'Est. 1RM'}</em></article>`;
  }).join('') : '<div class="profile-empty">Log a weighted set to start building your maxes.</div>';
  el('overallGradeCard').innerHTML = overallGradeMarkup(grade);
  el('workoutStreakCard').innerHTML = workoutStreakMarkup(schedule);
  el('accountStorageNote').textContent = userProfile?.provider === 'google'
    ? 'Completed workouts and profile changes sync across your signed-in devices.'
    : 'This local test profile is stored only on this device.';
  renderHomeGym();
  renderGymCatalog();
  renderGymConfirmation();
  const gymSearch = el('gymCatalogSearch');
  gymSearch.oninput = () => {
    pendingHomeGym = null;
    gymCatalogOpen = Boolean(gymSearch.value.trim());
    renderGymCatalog();
    renderGymConfirmation();
  };
  gymSearch.onfocus = () => {
    gymCatalogOpen = Boolean(gymSearch.value.trim());
    renderGymCatalog();
  };
  gymSearch.onblur = () => {
    window.setTimeout(() => {
      if (!pendingHomeGym) {
        gymCatalogOpen = false;
        renderGymCatalog();
      }
    }, 120);
  };
  el('rankSummary').innerHTML = rankSummaryMarkup(overallRank());
  el('muscleRanks').innerHTML = Object.keys(muscleMaps).map(muscleRankMarkup).join('');
  el('rankLadder').innerHTML = rankLadder.map(rank => `<article class="rank-tier">
    ${rankBadgeMarkup(rank, 'ladder')}
    <b>${rank.name}</b><small>${rank.band}</small>
  </article>`).join('');
}

function resetActiveWorkoutState() {
  stopActiveWorkoutTimer();
  selectedPlan = null;
  activePlan = null;
  activeStartedAt = 0;
  activeSessionId = '';
  activeScheduleContext = null;
  logs = [];
}

function applyPendingAppUpdate() {
  // Do not reload a live app automatically. iPhone can resume a page at any
  // screen, and an automatic reload makes it look as if navigation happened
  // without the user touching anything. New files load on the next normal
  // reopen or refresh instead.
  return false;
}

async function finishWorkout() {
  if (!activePlan) return go('workout');
  const plan = activePlan;
  const totalSets = totalSetsFor(plan);
  if (!logs.length && !confirm('No sets are saved. End this workout and record it as incomplete? It will receive a very low grade.')) return;
  if (logs.length && logs.length < totalSets && !confirm(`You saved ${logs.length} of ${totalSets} sets. Unsaved sets will not be included. End and grade this partial workout?`)) return;
  const finishButton = el('finish');
  if (finishButton.dataset.saving === 'true') return;
  finishButton.dataset.saving = 'true';
  finishButton.disabled = true;
  finishButton.textContent = 'Saving workout...';

  const muscles = [...new Set(logs.flatMap(log => log.muscleTargets || []))];
  const completedAt = Date.now();
  const planSnapshot = planSnapshotForDraft(plan);
  const grade = calculateWorkoutGrade(planSnapshot || plan, logs, workoutHistory);
  const scheduleContext = sanitizeScheduleContext(activeScheduleContext);
  const session = {
    id: activeSessionId,
    startedAt: activeStartedAt,
    completedAt,
    durationMinutes: calculatedWorkoutDurationMinutes(activeStartedAt, completedAt),
    planSnapshot,
    grade,
    planId: planIdFor(plan),
    plan: plan.name,
    program: plan.personal ? personalProgram.name : null,
    scheduledDay: plan.day || null,
    scheduleId: scheduleContext?.scheduleId || null,
    scheduleSlotId: scheduleContext?.scheduleSlotId || null,
    scheduledFor: scheduleContext?.scheduledFor || null,
    muscles,
    logs: logs.map(log => ({ ...log, muscleTargets: [...(log.muscleTargets || [])] }))
  };
  const nextHistory = workoutHistory.some(existing => existing.id && existing.id === session.id)
    ? workoutHistory
    : [...workoutHistory, session];
  if (!saveHistory(nextHistory)) {
    finishButton.dataset.saving = 'false';
    finishButton.textContent = 'End workout & save';
    updateWorkoutFinishState();
    return setSaveMessage('The workout could not be added to Progress. Your saved sets are still safe—please try again.', 'error');
  }
  workoutHistory = nextHistory;
  const syncOwnerUserId = historyOwnerId();
  const syncAuthEpoch = cloudAuthEpoch;
  if (cloudReady) {
    queuePendingCloudSession(session, syncOwnerUserId);
    void uploadCloudWorkoutSession(session, 'completed', syncOwnerUserId, syncAuthEpoch)
      .then(uploaded => {
        if (uploaded) removePendingCloudSession(session.id, syncOwnerUserId);
      })
      .catch(() => renderSyncStatus());
  } else if (userProfile?.provider === 'google') {
    queuePendingCloudSession(session, syncOwnerUserId);
  }
  clearActiveWorkoutDraft();
  resetActiveWorkoutState();
  finishButton.dataset.saving = 'false';
  finishButton.textContent = 'End workout & save';
  renderWorkoutSummary(session, { reveal: true, navigate: true });
  applyPendingAppUpdate();
}

function discardWorkout() {
  if (!activePlan) return go('workout');
  if (!confirm('Discard this workout? Saved sets from this unfinished session will be removed and will not appear in Progress.')) return;
  clearActiveWorkoutDraft();
  resetActiveWorkoutState();
  el('setList').innerHTML = '';
  go('workout');
  applyPendingAppUpdate();
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value, short = false) {
  return new Intl.DateTimeFormat('en-US', short
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function estimatedOneRepMax(log) {
  if (!log || log.weight <= 0) return 0;
  return log.weight * (1 + Math.min(log.reps, 12) / 30);
}

function workoutVolume(session) {
  return (session.logs || []).reduce((total, log) => total + log.weight * log.reps, 0);
}

function allLoggedSets() {
  return workoutHistory.flatMap((session, sessionIndex) => (session.logs || []).map(log => ({
    ...log,
    completedAt: session.completedAt,
    plan: session.plan,
    sessionIndex
  })));
}

function weekStartKey(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return dayKey(date);
}

function dailyWorkoutStreak() {
  if (!workoutHistory.length) return 0;
  const trainedDays = new Set(workoutHistory.map(session => dayKey(session.completedAt)));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!trainedDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (trainedDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function exerciseRecordData() {
  const grouped = new Map();
  allLoggedSets().forEach(log => {
    if (!grouped.has(log.exercise)) grouped.set(log.exercise, []);
    grouped.get(log.exercise).push(log);
  });
  const latestSessionIndex = workoutHistory.length - 1;
  return [...grouped].map(([exercise, sets]) => {
    const weightedSets = sets.filter(set => set.weight > 0);
    const heaviest = weightedSets.reduce((best, set) => !best || set.weight > best.weight ? set : best, null);
    const maxSet = weightedSets.reduce((best, set) => !best || estimatedOneRepMax(set) > estimatedOneRepMax(best) ? set : best, null);
    const bestReps = sets.reduce((best, set) => !best || set.reps > best.reps ? set : best, null);
    const firstWeighted = weightedSets[0];
    const estimatedMax = estimatedOneRepMax(maxSet);
    const firstMax = estimatedOneRepMax(firstWeighted);
    const previousSets = weightedSets.filter(set => set.sessionIndex < latestSessionIndex);
    const previousMax = previousSets.reduce((best, set) => Math.max(best, estimatedOneRepMax(set)), 0);
    const newPr = Boolean(maxSet && maxSet.sessionIndex === latestSessionIndex && previousMax > 0 && estimatedMax > previousMax);
    return {
      exercise,
      sets,
      heaviest,
      maxSet,
      bestReps,
      estimatedMax,
      isBodyweight: !weightedSets.length,
      improvement: firstMax > 0 ? Math.max(0, ((estimatedMax - firstMax) / firstMax) * 100) : 0,
      lastTrained: Math.max(...sets.map(set => set.completedAt)),
      newPr
    };
  }).sort((a, b) => (b.estimatedMax || b.bestReps.reps) - (a.estimatedMax || a.bestReps.reps));
}

function progressMetric(label, value, detail, tone = '', valueAriaLabel = '') {
  const safeTone = /^[a-z0-9 -]*$/i.test(tone) ? tone : '';
  const aria = valueAriaLabel ? ` aria-label="${escapeHtml(valueAriaLabel)}"` : '';
  return `<article class="progress-metric ${safeTone}"><span>${escapeHtml(label)}</span><strong${aria}>${escapeHtml(value)}</strong><small>${escapeHtml(detail)}</small></article>`;
}

function renderVolumeChart() {
  const recent = workoutHistory.slice(-6);
  if (!recent.length) {
    el('volumeChart').innerHTML = '<div class="progress-empty">Complete a workout to start your volume chart.</div>';
    return;
  }
  const volumes = recent.map(workoutVolume);
  const maximum = Math.max(...volumes, 1);
  el('volumeChart').innerHTML = `<article class="volume-card">
    <div class="volume-total"><span>Last ${recent.length} workout${recent.length === 1 ? '' : 's'}</span><b>${formatNumber(volumes.reduce((total, value) => total + value, 0))} lb</b></div>
    <div class="volume-bars" style="--bar-count:${recent.length}">${recent.map((session, index) => {
      const volume = volumes[index];
      const height = volume ? Math.max(10, Math.round((volume / maximum) * 100)) : 4;
      return `<div class="volume-column" title="${escapeHtml(session.plan || 'Workout')}: ${formatNumber(volume)} lb">
        <span>${formatNumber(volume)}</span><i style="--bar-height:${height}%"></i><small>${formatDate(session.completedAt, true)}</small>
      </div>`;
    }).join('')}</div>
  </article>`;
}

function renderExerciseRecords() {
  const records = exerciseRecordData();
  if (!records.length) {
    el('exerciseRecords').innerHTML = '<div class="progress-empty">Your maxes will appear here after you log your first sets.</div>';
    return;
  }
  el('exerciseRecords').innerHTML = records.map(record => {
    const mainValue = record.isBodyweight ? `${record.bestReps.reps} reps` : `${Math.round(record.estimatedMax)} lb`;
    const mainLabel = record.isBodyweight ? 'Best set' : 'Estimated 1RM';
    const secondary = record.isBodyweight
      ? `${record.sets.length} sets logged`
      : `Heaviest ${formatNumber(record.heaviest.weight)} lb · Best set ${formatNumber(record.maxSet.weight)} lb x ${record.maxSet.reps}`;
    const progress = !record.isBodyweight && record.improvement > 0
      ? `<span class="record-gain">+${Math.round(record.improvement)}% from first max</span>`
      : `<span>${formatDate(record.lastTrained, true)}</span>`;
    return `<article class="exercise-record">
      <div class="record-top"><div><h3>${escapeHtml(record.exercise)}</h3><p>${escapeHtml(secondary)}</p></div>${record.newPr ? '<b class="pr-badge">NEW PR</b>' : ''}</div>
      <div class="record-stats"><div><span>${mainLabel}</span><strong>${mainValue}</strong></div>${progress}</div>
    </article>`;
  }).join('');
}

function renderRecentWorkouts() {
  const recent = [...workoutHistory].reverse().slice(0, 5);
  if (!recent.length) {
    el('recentWorkouts').innerHTML = '<div class="progress-empty">Completed workouts will be saved here.</div>';
    return;
  }
  el('recentWorkouts').innerHTML = recent.map(session => {
    const grade = sanitizeWorkoutGrade(session.grade);
    const rawDuration = storedWorkoutDurationMinutes(session);
    const duration = sessionDurationMinutes(session);
    const durationMarkup = duration
      ? ` &middot; <time datetime="${durationIso(duration)}">${formatDurationLong(duration)}</time>`
      : rawDuration > MAX_COUNTED_WORKOUT_MINUTES ? ' &middot; Time needs review' : '';
    const gradeMarkup = grade
      ? `<span class="grade-chip ${gradeClass(grade.letter)}" aria-label="Grade ${grade.letter}, ${grade.percentage} percent">${grade.letter} · ${grade.percentage}%</span>
         <button class="history-summary-button" type="button" data-summary-session="${escapeHtml(session.id)}" aria-label="Open ${escapeHtml(session.plan || 'workout')} summary, grade ${grade.letter}, ${grade.percentage} percent">Summary</button>`
      : '<span class="grade-chip ungraded">Not graded</span>';
    return `<article class="history-row" role="listitem">
      <div class="history-mark" aria-hidden="true"></div>
      <div><b>${escapeHtml(session.plan || 'Workout')}</b><small>${formatDate(session.completedAt)} &middot; ${(session.logs || []).length} sets${durationMarkup}</small></div>
      <div class="history-actions"><strong>${formatNumber(workoutVolume(session))}<small>lb vol.</small></strong>${gradeMarkup}</div>
    </article>`;
  }).join('');
  el('recentWorkouts').querySelectorAll?.('[data-summary-session]').forEach(button => {
    button.onclick = () => openWorkoutSummary(button.dataset.summarySession);
  });
}

function renderProgress() {
  const allLogs = allLoggedSets();
  const weightedLogs = allLogs.filter(log => log.weight > 0);
  const heaviest = weightedLogs.reduce((best, log) => !best || log.weight > best.weight ? log : best, null);
  const maxEstimate = weightedLogs.reduce((best, log) => !best || estimatedOneRepMax(log) > estimatedOneRepMax(best) ? log : best, null);
  const recentCutoff = Date.now() - 28 * 24 * 60 * 60 * 1000;
  const activeDays = new Set(workoutHistory.filter(session => session.completedAt >= recentCutoff).map(session => dayKey(session.completedAt))).size;
  const totalVolume = workoutHistory.reduce((total, session) => total + workoutVolume(session), 0);
  const gymTime = gymTimeSummary();
  const schedule = scheduledWorkoutStats();
  const timedWorkoutDetail = gymTime.sessions
    ? `Across ${gymTime.sessions} timed workout${gymTime.sessions === 1 ? '' : 's'}${gymTime.needsReview ? ` · ${gymTime.needsReview} needs review` : ''}`
    : gymTime.needsReview ? `${gymTime.needsReview} workout time needs review` : 'Finish a workout to start tracking';

  el('progressOverview').innerHTML = [
    progressMetric('TIME IN GYM', formatDurationCompact(gymTime.minutes), timedWorkoutDetail, 'time-wide', durationAriaLabel(gymTime.minutes)),
    progressMetric('BEST EST. 1RM', maxEstimate ? `${Math.round(estimatedOneRepMax(maxEstimate))} lb` : '—', maxEstimate?.exercise || 'No weighted sets', 'highlight'),
    progressMetric('HEAVIEST WEIGHT', heaviest ? `${formatNumber(heaviest.weight)} lb` : '—', heaviest?.exercise || 'No weighted sets'),
    progressMetric('TOTAL VOLUME', `${formatNumber(totalVolume)} lb`, `${allLogs.length} logged sets`),
    progressMetric('WORKOUT STREAK', `${schedule.streak}`, schedule.hasSchedule ? 'Consecutive scheduled workouts completed' : 'No weekly schedule connected'),
    progressMetric('WORKOUTS', workoutHistory.length, 'Completed sessions'),
    progressMetric('ACTIVE DAYS', activeDays, 'Last 28 days')
  ].join('');
  el('progressRank').innerHTML = overallGradeMarkup(overallGrade(workoutHistory, schedule), { compact: true });
  renderVolumeChart();
  renderExerciseRecords();
  const trainedMuscles = Object.keys(muscleMaps)
    .filter(muscle => muscleTraining(muscle).sessions.length)
    .sort((a, b) => muscleTraining(b).score - muscleTraining(a).score)
    .slice(0, 4);
  el('progressMuscleRanks').innerHTML = trainedMuscles.length
    ? trainedMuscles.map(muscleRankMarkup).join('')
    : '<div class="progress-empty">Muscle group ranks appear after you complete targeted workouts.</div>';
  renderRecentWorkouts();
}

async function checkForAppUpdate(force = false) {
  if (!serviceWorkerRegistration) return;
  const now = Date.now();
  if (!force && now - lastAppUpdateCheck < 60000) return;
  lastAppUpdateCheck = now;
  try {
    await serviceWorkerRegistration.update();
  } catch {
    // Updates are retried the next time the app opens or returns to the foreground.
  }
}

async function initializeAppUpdates() {
  const allowedOrigin = location.protocol === 'https:' || location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  if (!('serviceWorker' in navigator) || !allowedOrigin) return;

  let controllerHasLoadedThisApp = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controllerHasLoadedThisApp) {
      controllerHasLoadedThisApp = true;
      return;
    }
    appUpdateReloadPending = true;
  });

  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    await checkForAppUpdate(true);
  } catch {
    return;
  }

  window.addEventListener('pageshow', () => { void checkForAppUpdate(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkForAppUpdate();
  });
}

function bindAppControls() {
  void ensureUserAccountKey();
  document.querySelectorAll('[data-page]').forEach(button => {
    button.onclick = () => go(button.dataset.page);
  });
  el('browse').onclick = () => go('workout');
  el('create').onclick = () => openWorkoutBuilder();
  el('newCustomWorkout').onclick = () => openWorkoutBuilder('', true);
  el('saveCustomWorkout').onclick = () => { void saveCustomWorkout(); };
  el('backToWorkouts').onclick = () => go('workout');
  el('activeBackToDetails').onclick = showActiveWorkoutDetail;
  el('start').onclick = startWorkout;
  el('finish').onclick = finishWorkout;
  el('discardWorkout').onclick = discardWorkout;
  el('summaryToProgress').onclick = () => go('progress');
  el('summaryToWorkouts').onclick = () => go('workout');
  const googleSignInButton = el('googleSignIn');
  if (googleSignInButton) googleSignInButton.onclick = () => { void signInWithGoogle(); };
  const appleSignInButton = el('appleSignIn');
  if (appleSignInButton) appleSignInButton.onclick = () => providerUnavailable('Apple');
  const showEmailFormButton = el('showEmailForm');
  if (showEmailFormButton) showEmailFormButton.onclick = () => {
    el('emailProfileForm').classList.remove('hidden');
    el('authNotice').textContent = '';
    el('signupName').focus();
  };
  el('emailProfileForm').onsubmit = async event => {
    event.preventDefault();
    const name = el('signupName').value.trim();
    const email = el('signupEmail').value.trim();
    if (!name || !el('signupEmail').checkValidity()) return el('emailProfileForm').reportValidity();
    const accountKey = globalThis.crypto?.subtle ? await accountKeyFor(email) : '';
    userProfile = { name, email, accountKey, provider: 'email-test' };
    saveUserProfile();
    workoutHistory = localStorageReadArray(WORKOUT_HISTORY_KEY);
    initializeProfile();
    renderHome();
    renderProfile();
    if (!restoreActiveWorkout()) go('home');
  };
  el('signOut').onclick = async () => {
    if (loadActiveWorkoutDraft() && !confirm('Signing out will discard your unfinished workout. Continue?')) return;
    resetBuilderState(true);
    await signOutOfAccount();
    clearActiveWorkoutDraft();
    userProfile = null;
    resetActiveWorkoutState();
    saveUserProfile();
    workoutHistory = loadHistory();
    el('emailProfileForm').reset();
    el('emailProfileForm').classList.add('hidden');
    el('authNotice').textContent = '';
    initializeProfile();
  };
  window.addEventListener('online', () => { void retryPendingProfileSync(); });
}

function renderStartupShell() {
  renderPlans();
  renderProfile();
  renderHome();
  initializeProfile();
  if (userProfile) {
    const restoredDraft = restoreActiveWorkout(false);
    go(startupRememberedPage === 'active' && !restoredDraft ? 'home' : startupRememberedPage, { startup: true });
    startupPageResolved = true;
  }
}

async function initializeApp() {
  // Render and bind the complete device experience first. A delayed, failed, or
  // temporarily unavailable cloud request must never leave a signed-in person
  // staring at only the tab bar.
  startupRememberedPage = rememberedPage();
  bindAppControls();
  renderStartupShell();
  void initializeAppUpdates();

  const signedIn = await initializeCloudAuth();
  if (!signedIn || startupPageResolved || userNavigatedDuringStartup) return;
  const restoredDraft = restoreActiveWorkout(false);
  go(startupRememberedPage === 'active' && !restoredDraft ? 'home' : startupRememberedPage, { startup: true });
  startupPageResolved = true;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void initializeApp(); });
else void initializeApp();
