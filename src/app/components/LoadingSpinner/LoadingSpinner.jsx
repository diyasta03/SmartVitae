// components/LoadingSpinner/LoadingSpinner.js
import React from 'react';
import styles from './LoadingSpinner.module.css'; // Buat file CSS baru ini

const LoadingSpinner = ({ message = 'Memuat data...' }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;