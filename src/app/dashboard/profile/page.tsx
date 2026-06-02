'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  User, 
  Lock, 
  Shield, 
  Mail, 
  Phone, 
  UserCheck, 
  CheckCircle, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import styles from './profile.module.css';

interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

const fetchProfile = async () => {
  const { data } = await api.get('/api/auth/profile/');
  return data as Profile;
};

export default function ProfilePage() {
  const queryClient = useQueryClient();

  // Personal Info Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Banners
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load profile data
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
  });

  // Populate state on load
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (updatedData: Partial<Profile>) => {
      const { data } = await api.patch('/api/auth/profile/', updatedData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile'], data);
      setProfileSuccess("Profil ma'lumotlari muvaffaqiyatli saqlandi.");
      setProfileError('');
      // Auto clear alert
      setTimeout(() => setProfileSuccess(''), 5000);
    },
    onError: (error: any) => {
      const backendMessage = error.response?.data;
      if (backendMessage && typeof backendMessage === 'object') {
        const errors = Object.entries(backendMessage)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setProfileError(`Xatolik: ${errors}`);
      } else {
        setProfileError("Profil ma'lumotlarini saqlashda xatolik yuz berdi.");
      }
      setProfileSuccess('');
    }
  });

  // Password update mutation
  const passwordMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/api/auth/password/change/', payload);
      return data;
    },
    onSuccess: () => {
      setPasswordSuccess("Parolingiz muvaffaqiyatli o'zgartirildi.");
      setPasswordError('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Auto clear alert
      setTimeout(() => setPasswordSuccess(''), 5000);
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        setPasswordError("Eski parol noto'g'ri yoki yangi parol talablarga javob bermaydi.");
      } else {
        setPasswordError("Parolni o'zgartirishda kutilmagan xatolik yuz berdi.");
      }
      setPasswordSuccess('');
    }
  });

  // Submit Profile Info
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    profileMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone
    });
  };

  // Submit Password Change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!oldPassword) {
      setPasswordError("Eski parolni kiriting.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Yangi parol va tasdiqlovchi parol bir-biriga mos kelmadi.");
      return;
    }

    passwordMutation.mutate({
      old_password: oldPassword,
      new_password: newPassword
    });
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Profil ma'lumotlari yuklanmoqda...</div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <AlertCircle size={48} className={styles.errorText} />
          <h3 className={styles.errorText}>Profilni yuklashda xatolik yuz berdi</h3>
          <button onClick={() => refetch()} className="btn-primary">Qayta yuklash</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profil va Xavfsizlik</h1>
        <p className={styles.subtitle}>Shaxsiy ma'lumotlaringizni boshqaring va hisob xavfsizligini ta'minlang.</p>
      </div>

      <div className={styles.grid}>
        {/* Left Side: Personal Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                <User size={20} className="text-accent" />
                Shaxsiy ma'lumotlar
              </h2>
              <p className={styles.cardSubtitle}>
                Ismingiz, aloqa ma'lumotlaringiz va tizimdagi rolingiz haqida umumiy ma'lumot.
              </p>
            </div>
            <div className={styles.roleBadge}>
              <Shield size={14} />
              <span>{profile.role === 'TEACHER' ? 'O\'qituvchi' : profile.role}</span>
            </div>
          </div>

          {profileSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Foydalanuvchi nomi (Username)</label>
                <input 
                  type="text" 
                  value={profile.username} 
                  disabled 
                  className={styles.input} 
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Rol</label>
                <input 
                  type="text" 
                  value={profile.role === 'TEACHER' ? 'O\'qituvchi / Teacher' : profile.role} 
                  disabled 
                  className={styles.input} 
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Ism (First name)</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className={styles.input}
                  placeholder="Ismingizni kiriting"
                  maxLength={150}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Familiya (Last name)</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className={styles.input}
                  placeholder="Familiyangizni kiriting"
                  maxLength={150}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email manzil</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={styles.input}
                  placeholder="name@example.com"
                  maxLength={254}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Telefon raqami</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className={styles.input}
                  placeholder="+998901234567"
                  maxLength={20}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn-primary ${styles.submitBtn}`}
              disabled={profileMutation.isPending}
            >
              {profileMutation.isPending ? (
                <>
                  <div className={styles.spinner} />
                  <span>Yangilanmoqda...</span>
                </>
              ) : (
                <>
                  <UserCheck size={18} />
                  <span>Saqlash</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Security Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Lock size={20} className="text-accent" />
            Xavfsizlik
          </h2>
          <p className={styles.cardSubtitle}>
            Hisobingiz xavfsizligini ta'minlash uchun parolingizni yangilab turing.
          </p>

          {passwordSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <CheckCircle size={18} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <AlertCircle size={18} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Eski parol</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                className={styles.input}
                placeholder="Eski parolni kiriting"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Yangi parol</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className={styles.input}
                placeholder="Kamida 8 belgidan iborat yangi parol"
                required
                minLength={8}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Yangi parolni tasdiqlash</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className={styles.input}
                placeholder="Yangi parolni qayta kiriting"
                required
                minLength={8}
              />
            </div>

            <button 
              type="submit" 
              className={`btn-primary ${styles.submitBtn}`}
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? (
                <>
                  <div className={styles.spinner} />
                  <span>Yangilanmoqda...</span>
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>Parolni yangilash</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
