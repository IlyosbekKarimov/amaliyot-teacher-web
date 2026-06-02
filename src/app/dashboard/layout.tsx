'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { LogOut, LayoutDashboard, Users, UserCog, Menu, X } from 'lucide-react';
import styles from './layout.module.css';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_role');
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Hisobotlar', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/students', label: 'Talabalar', icon: <Users size={20} /> },
    { href: '/dashboard/profile', label: 'Profil', icon: <UserCog size={20} /> },
  ];

  return (
    <div className={styles.container}>
      {/* Mobile Header Navbar */}
      <header className={styles.mobileHeader}>
        <div className={styles.logoWrapper}>
          <img src="/logo.svg" alt="Logo" className={styles.logoImg} />
          <span className={styles.logoText}>TeacherPanel</span>
        </div>
        <div className={styles.mobileActions}>
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={styles.hamburger}
            aria-label="Menyuni ochish"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Sidebar */}
      {isMobileMenuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsMobileMenuOpen(false)}>
          <aside className={`glass-panel ${styles.drawerSidebar}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.logo}>
              <div className={styles.logoWrapper}>
                <img src="/logo.svg" alt="Logo" className={styles.logoImg} />
                <span className={styles.logoText}>TeacherPanel</span>
              </div>
            </div>
            
            <nav className={styles.nav}>
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`${styles.navItem} ${pathname === link.href ? styles.active : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className={styles.footer}>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={20} />
                <span>Chiqish</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`glass-panel ${styles.sidebar}`}>
        <div className={styles.logo}>
          <div className={styles.logoWrapper}>
            <img src="/logo.svg" alt="Logo" className={styles.logoImg} />
            <span className={styles.logoText}>TeacherPanel</span>
          </div>
        </div>
        
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`${styles.navItem} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className={styles.footer}>
          <div className={styles.themeToggleContainer}>
            <span>Mavzu:</span>
            <ThemeToggle />
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
