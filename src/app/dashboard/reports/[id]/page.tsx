'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit, FileIcon, ImageIcon } from 'lucide-react';
import styles from './report.module.css';

// Using the DRF base URL to fix relative media URLs
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://172.16.1.131:8000';

const getFullMediaUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['teacher-report', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/teacher/reports/${id}/`);
      if (data.teacher_score) setScore(data.teacher_score.toString());
      if (data.teacher_feedback) setFeedback(data.teacher_feedback);
      return data;
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async (payload: { teacher_score: number; teacher_feedback: string }) => {
      const { data } = await api.post(`/api/teacher/reports/${id}/grade/`, payload);
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-report', id] });
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!score) return;
    gradeMutation.mutate({
      teacher_score: parseInt(score, 10),
      teacher_feedback: feedback,
    });
  };

  if (isLoading) return <div className={styles.loading}>Hisobot yuklanmoqda...</div>;
  if (isError) return <div className={styles.error}>Hisobot topilmadi yoki xatolik yuz berdi.</div>;
  if (!report) return null;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <Link href="/dashboard" className={styles.backLink}>
        <ArrowLeft size={20} /> Orqaga
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{report.student.full_name} ning hisoboti</h1>
          <p className={styles.subtitle}>Sana: {report.date}</p>
        </div>
        <span className={`${styles.badge} ${report.status === 'COMPLETED' ? 'status-completed' : 'status-approved'}`}>
          {report.status === 'COMPLETED' ? 'Baholangan' : 'Tasdiqlangan'}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <div className={`glass-panel ${styles.section}`}>
            <h2 className={styles.sectionTitle}>Umumiy ish tavsifi</h2>
            <p>{report.work_description || "Kiritilmagan"}</p>
          </div>

          {report.ai_feedback && (
            <div className={styles.aiFeedback} style={{ marginTop: '24px' }}>
              <BrainCircuit className={styles.aiIcon} size={32} />
              <div className={styles.aiContent}>
                <h4>Sun'iy Intellekt tahlili</h4>
                <p>{report.ai_feedback}</p>
                <div className={styles.aiScore}>AI Ball: {report.ai_score}/100</div>
              </div>
            </div>
          )}

          <div className={`glass-panel ${styles.section}`} style={{ marginTop: '24px' }}>
            <h2 className={styles.sectionTitle}>Bajarilgan Vazifalar ({report.tasks?.length || 0})</h2>
            <div className={styles.tasksList}>
              {report.tasks?.map((task: any) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskHeader}>
                    <span className={styles.taskType}>{task.task_type}</span>
                  </div>
                  <div className={styles.taskDescription}>{task.description}</div>
                  
                  {task.value && (
                    <div className={styles.taskValue}>{task.value}</div>
                  )}

                  {task.task_type === 'img' && task.file_attachment && (
                    <img 
                      src={getFullMediaUrl(task.file_attachment) || ''} 
                      alt={task.description} 
                      className={styles.taskImage} 
                    />
                  )}

                  {task.task_type === 'file' && task.file_attachment && (
                    <a 
                      href={getFullMediaUrl(task.file_attachment) || ''} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.taskFile}
                    >
                      <FileIcon size={20} />
                      Biriktirilgan faylni yuklab olish
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={`glass-panel ${styles.section}`}>
            <h2 className={styles.sectionTitle}>Baholash</h2>
            
            {report.status === 'COMPLETED' && !success && (
              <div style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Bu hisobot allaqachon baholangan.
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.gradeForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>O'qituvchi bali (0-100)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  required
                  className={styles.scoreInput}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={gradeMutation.isPending || (report.status === 'COMPLETED' && !success)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Izoh (ixtiyoriy)</label>
                <textarea 
                  className={styles.textarea}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Talabaga o'z fikringizni yozing..."
                  disabled={gradeMutation.isPending || (report.status === 'COMPLETED' && !success)}
                />
              </div>

              {success ? (
                <div className={styles.successMessage}>
                  Baholandi! Asosiy sahifaga qaytilmoqda...
                </div>
              ) : (
                <button 
                  type="submit" 
                  className="btn-primary submitBtn"
                  disabled={gradeMutation.isPending || report.status === 'COMPLETED'}
                >
                  {gradeMutation.isPending ? 'Saqlanmoqda...' : 'Bahoni saqlash'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
