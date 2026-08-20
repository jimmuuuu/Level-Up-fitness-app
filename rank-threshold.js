(() => {
  const REQUIRED_WORKOUTS_FOR_RANK = 5;
  const escapeRankText = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));

  function rankTextBadge(rank) {
    const label = rank?.name || 'Unranked';
    const initials = label.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'UR';
    return `<span class="rank-word-badge" aria-label="${escapeRankText(label)} rank">${escapeRankText(initials)}</span>`;
  }

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
      ${rankTextBadge(rank)}
      <div><b>${escapeRankText(map.label)}</b><small>${rank ? escapeRankText(rank.name) : 'Unranked'} &middot; ${detail}</small></div>
      ${status}
    </article>`;
  };

  try {
    if (typeof renderProfile === 'function') renderProfile();
    if (typeof renderProgress === 'function') renderProgress();
  } catch {}
})();
