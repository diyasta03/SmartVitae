"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import styles from '../login/Auth.module.css'; // Kita pakai style yang sama untuk konsistensi

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

  // Langkah 1: Ambil data pengguna dan lindungi halaman
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login'); // Jika tidak login, tendang ke halaman login
        return;
      }
      
      setUser(session.user);
      setName(session.user.user_metadata.full_name || '');
      setEmail(session.user.email);
    };

    fetchUser();
  }, [router]);

  // Langkah 2: Buat fungsi untuk handle update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess('');

    // Cek jika password baru diisi, apakah cocok
    if (password && password !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok.');
      setIsLoading(false);
      return;
    }

    try {
      // Objek untuk menampung data yang akan diupdate
      const updates = {};
      
      // Hanya tambahkan data jika ada perubahan
      if (name !== user.user_metadata.full_name) {
        updates.data = { full_name: name };
      }
      if (password) {
        updates.password = password;
      }

      // Jika tidak ada yang diubah, jangan lakukan apa-apa
      if (Object.keys(updates).length === 0) {
        setSuccess('Tidak ada perubahan yang disimpan.');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.updateUser(updates);

      if (error) {
        throw error;
      }

      setSuccess('Profil berhasil diperbarui!');
      // Refresh user data (opsional, karena onAuthStateChange di navbar akan handle)
      setUser(data.user);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      // Bersihkan field password setelah submit
      setPassword('');
      setConfirmPassword('');
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.gradientBg}></div>
        <div className={styles.formCard}>
          <h1 className={styles.title}>Profil Anda</h1>
          
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={`${styles.error}`} style={{backgroundColor: '#dcfce7', color: '#166534'}}>{success}</p>}
          
          <form onSubmit={handleUpdateProfile}>
            <div className={styles.formGroup}>
              <input id="email" type="email" className={styles.formInput} value={email} disabled placeholder="Email"/>
              <label htmlFor="email" className={styles.formLabel}>Alamat Email (tidak bisa diubah)</label>
            </div>

            <div className={styles.formGroup}>
              <input id="name" type="text" className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama Lengkap"/>
              <label htmlFor="name" className={styles.formLabel}>Nama Lengkap</label>
            </div>
            
            <p className="text-sm text-gray-500 mt-8 mb-2">Ubah Password (kosongkan jika tidak ingin mengubah)</p>
            
            <div className={styles.formGroup}>
              <input id="password" type="password" className={styles.formInput} value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" placeholder="Password Baru"/>
              <label htmlFor="password" className={styles.formLabel}>Password Baru</label>
            </div>

            <div className={styles.formGroup}>
              <input id="confirmPassword" type="password" className={styles.formInput} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi Password Baru"/>
              <label htmlFor="confirmPassword" className={styles.formLabel}>Konfirmasi Password Baru</label>
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;