import React, { useEffect, useState } from 'react';
import styles from './ScoreCircle.module.css';

const ScoreCircle = ({ score }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easedProgress = Math.pow(progressRatio, 2); // easing in
      const current = Math.floor(easedProgress * score);
      setProgress(current);
      if (progressRatio < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.overallScore}>
      <svg width="140" height="140" className={styles.svgCircle}>
        <circle
          className={styles.bgCircle}
          cx="70"
          cy="70"
          r={radius}
          stroke="#f1f2f6"
          strokeWidth="12"
          fill="none"
        />
        <circle
          className={styles.progressCircle}
          cx="70"
          cy="70"
          r={radius}
          stroke="#00b894"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.scoreValue}>{progress}%</div>
      <div className={styles.scoreLabel}>Skor Keseluruhan</div>
    </div>
  );
};

export default ScoreCircle;
