"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { FiUser, FiArrowLeft, FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import styles from './Profile.module.css';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      setName(session.user.user_metadata?.full_name || '');
      setEmail(session.user.email || '');
    };

    fetchUser();
  }, [router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('New password and confirmation do not match');
      setIsLoading(false);
      return;
    }

    try {
      const updates = {};
      
      if (name !== user.user_metadata?.full_name) {
        updates.data = { full_name: name };
      }
      if (password) {
        updates.password = password;
      }

      if (Object.keys(updates).length === 0) {
        setSuccess('No changes were made');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      setSuccess('Profile updated successfully!');
      setUser(data.user);

    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
      setPassword('');
      setConfirmPassword('');
    }
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <FiLoader className={styles.spinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    
    <div className={styles.container}>
       
      <div className={styles.profileCard}>
          <button onClick={() => router.back()} className={styles.backLink}>
            <FiArrowLeft className={styles.backIcon} /> Kembali
          </button>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className={styles.title}>Profile Settings</h1>
        </div>

        <div className={styles.profileContent}>
          {error && (
            <div className={styles.alertError}>
              <FiAlertCircle className={styles.alertIcon} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className={styles.alertSuccess}>
              <FiCheckCircle className={styles.alertIcon} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                <FiMail className={styles.inputIcon} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className={styles.formInput}
                value={email}
                disabled
                placeholder="Your email"
              />
              <p className={styles.inputHelpText}>Email cannot be changed</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                <FiUser className={styles.inputIcon} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
              />
            </div>

            <div className={styles.sectionDivider}>
              <span>Change Password</span>
            </div>
            <p className={styles.sectionDescription}>Leave blank to keep current password</p>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                <FiLock className={styles.inputIcon} />
                <span>New Password</span>
              </label>
              <input
                type="password"
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="6"
                placeholder="At least 6 characters"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                <FiLock className={styles.inputIcon} />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                className={styles.formInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <FiLoader className={styles.buttonSpinner} />
                    Saving...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;