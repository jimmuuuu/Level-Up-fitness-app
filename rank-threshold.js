(() => {
  const REQUIRED_WORKOUTS_FOR_RANK = 5;

  overallRank = function () {
    const trainedMuscles = Object.keys(muscleMaps).filter(muscle => muscleTraining(muscle).sessions.length);
    const stats = trainedMuscles.map(muscleTraining);
    const score = stats.length ? stats.reduce((total, stat) => total + stat.score, 0) / stats.length : 0;
    return {
      score,
      rank: rankForScore(score, workoutHistory.length >= REQUIRED_WORKOUTS_FOR_RANK),
      workoutsRemaining: Math.max(0, REQUIRED_WORKOUTS_FOR_RANK - workoutHistory.length)
    };
  };

  muscleRankMarkup = function (muscle) {
    const training = muscleTraining(muscle);
    const rank = rankForScore(
      training.score,
      workoutHistory.length >= REQUIRED_WORKOUTS_FOR_RANK && training.sessions.length >= minimumMuscleSessions
    );
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
      ${rank ? `<img src="${rankImage(rank)}" alt="${rank.name} emblem">` : '<div class="rank-placeholder small" aria-hidden="true">—</div>'}
      <div><b>${map.label}</b><small>${rank ? rank.name : 'Unranked'} &middot; ${detail}</small></div>
      ${status}
    </article>`;
  };

  try {
    if (typeof renderProfile === 'function') renderProfile();
    if (typeof renderProgress === 'function') renderProgress();
  } catch {}
})();