'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import styles from './login.module.css';
import ThemeToggle from '@/components/ThemeToggle';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login/', { username, password });
      const { access, refresh, role } = response.data;

      if (role !== 'TEACHER') {
        setError("Siz o'qituvchi (TEACHER) emassiz. Kirish taqiqlangan.");
        setLoading(false);
        return;
      }

      Cookies.set('access_token', access, { expires: 1 });
      Cookies.set('refresh_token', refresh, { expires: 7 });
      Cookies.set('user_role', role, { expires: 1 });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <ThemeToggle className={styles.themeToggleFloating} />
      
      <div className={`glass-panel ${styles.loginCard} animate-fade-in`}>
        <div className={styles.header}>
          <img src="/logo.svg" alt="Logo" className={styles.logoImage} />
          <h1 className={styles.title}>Teacher Panel</h1>
          <p className={styles.subtitle}>Tizimga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        {error && <div className={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="username">Username</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="username"
                type="text"
                className={`input-field ${styles.inputFieldWithIcon}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Foydalanuvchi nomi..."
                required
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Parol</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                className={`input-field ${styles.inputFieldWithIcon}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting..."
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '12px', gap: '8px' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Kirilmoqda...</span>
              </>
            ) : (
              <>
                <span>Tizimga kirish</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

