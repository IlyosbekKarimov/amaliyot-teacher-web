'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import styles from './dashboard.module.css';

interface Student {
  id: number;
  full_name: string;
  role: string;
}

interface Report {
  id: number;
  student: Student;
  date: string;
  status: 'MENTOR_APPROVED' | 'COMPLETED';
  work_description: string;
  tasks_count: number;
  updated_at: string;
}

const fetchReports = async (status: string) => {
  const { data } = await api.get(`/api/teacher/reports/?status=${status}`);
  return data as Report[];
};

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<'MENTOR_APPROVED' | 'COMPLETED'>('MENTOR_APPROVED');
  const router = useRouter();

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['teacher-reports', statusFilter],
    queryFn: () => fetchReports(statusFilter),
  });

  return (
    <div className={`animate-fade-in ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hisobotlar</h1>
          <p className={styles.subtitle}>Talabalar tomonidan yuborilgan hisobotlarni tekshiring va baholang.</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${statusFilter === 'MENTOR_APPROVED' ? styles.activeTab : ''}`}
          onClick={() => setStatusFilter('MENTOR_APPROVED')}
        >
          <Clock size={16} />
          Kutilayotgan
        </button>
        <button 
          className={`${styles.tab} ${statusFilter === 'COMPLETED' ? styles.activeTab : ''}`}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          <CheckCircle size={16} />
          Baholangan
        </button>
      </div>

      <div className={styles.content}>
        {isLoading && (
          <div className={styles.loading}>Yuklanmoqda...</div>
        )}
        
        {isError && (
          <div className={styles.error}>Xatolik yuz berdi. Iltimos qayta urinib ko'ring.</div>
        )}

        {!isLoading && !isError && reports?.length === 0 && (
          <div className={`glass-panel ${styles.emptyState}`}>
            <FileText size={48} className={styles.emptyIcon} />
            <h3>Hisobotlar yo'q</h3>
            <p>Hozircha ushbu bo'limda hisobotlar mavjud emas.</p>
          </div>
        )}

        <div className={styles.grid}>
          {reports?.map((report) => (
            <div 
              key={report.id} 
              className={`glass-panel ${styles.card}`}
              onClick={() => router.push(`/dashboard/reports/${report.id}`)}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.badge} ${report.status === 'COMPLETED' ? 'status-completed' : 'status-approved'}`}>
                  {report.status === 'COMPLETED' ? 'Baholangan' : 'Tasdiqlangan'}
                </span>
                <span className={styles.date}>{report.date}</span>
              </div>
              
              <h3 className={styles.studentName}>{report.student.full_name}</h3>
              <p className={styles.description}>
                {report.work_description || "Vazifa haqida ma'lumot kiritilmagan..."}
              </p>
              
              <div className={styles.cardFooter}>
                <span className={styles.taskCount}>
                  <FileText size={14} /> {report.tasks_count} ta vazifa
                </span>
                <span className={styles.viewLink}>
                  Ko'rish <ChevronRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
