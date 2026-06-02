'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Search, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import styles from './students.module.css';

interface UserBrief {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  full_name: string;
}

interface TeacherStudent {
  id: number;
  student: UserBrief;
  company_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  total_reports: number;
  completed_reports: number;
  average_score: number | null;
}

type SortField = 'NAME' | 'COMPANY' | 'REPORTS' | 'SCORE';
type SortOrder = 'asc' | 'desc';

const fetchStudents = async () => {
  const { data } = await api.get('/api/teacher/students/');
  return data as TeacherStudent[];
};

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<SortField>('NAME');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const { data: students, isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: fetchStudents,
  });

  // Calculate statistics from raw data
  const stats = useMemo(() => {
    if (!students) return { total: 0, active: 0, avgScore: 0 };
    
    const total = students.length;
    const active = students.filter(s => s.is_active).length;
    
    const scoredStudents = students.filter(s => s.average_score !== null);
    const avgScore = scoredStudents.length > 0
      ? scoredStudents.reduce((acc, s) => acc + (s.average_score || 0), 0) / scoredStudents.length
      : 0;

    return {
      total,
      active,
      avgScore: Math.round(avgScore * 10) / 10
    };
  }, [students]);

  // Handle header sorting click
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'SCORE' || field === 'REPORTS' ? 'desc' : 'asc'); // Descending default for numbers
    }
  };

  // Filter and sort students list
  const filteredAndSortedStudents = useMemo(() => {
    if (!students) return [];

    // Filter
    let result = students.filter(item => {
      const studentName = item.student.full_name.toLowerCase();
      const company = item.company_name.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = studentName.includes(search) || company.includes(search);
      
      if (statusFilter === 'ACTIVE') {
        return matchesSearch && item.is_active;
      }
      if (statusFilter === 'INACTIVE') {
        return matchesSearch && !item.is_active;
      }
      return matchesSearch;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'NAME') {
        comparison = a.student.full_name.localeCompare(b.student.full_name);
      } else if (sortBy === 'COMPANY') {
        comparison = a.company_name.localeCompare(b.company_name);
      } else if (sortBy === 'REPORTS') {
        comparison = a.completed_reports - b.completed_reports;
      } else if (sortBy === 'SCORE') {
        const scoreA = a.average_score ?? -1;
        const scoreB = b.average_score ?? -1;
        comparison = scoreA - scoreB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, searchTerm, statusFilter, sortBy, sortOrder]);

  // Helper for name initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Helper to determine score color class
  const getScoreClass = (score: number | null) => {
    if (score === null) return styles.scoreNone;
    if (score >= 86) return styles.scoreExcellent;
    if (score >= 71) return styles.scoreGood;
    if (score >= 55) return styles.scoreAverage;
    return styles.scorePoor;
  };

  // Sort Icon Render helper
  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} className="text-muted" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className={styles.activeSortIcon} /> 
      : <ArrowDown size={14} className={styles.activeSortIcon} />;
  };

  return (
    <div className={`animate-fade-in ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Talabalar reyestri</h1>
        <p className={styles.subtitle}>Sizga biriktirilgan talabalar, ularning amaliyot joylari va umumiy ko'rsatkichlari jadvali.</p>
      </div>

      {/* Stats Widgets */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>Jami Talabalar</h3>
            <span className={styles.statValue}>{isLoading ? '...' : stats.total}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <UserCheck size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>Faol Amaliyotlar</h3>
            <span className={styles.statValue}>{isLoading ? '...' : stats.active}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <GraduationCap size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>O'rtacha Ball</h3>
            <span className={styles.statValue}>{isLoading ? '...' : `${stats.avgScore} / 100`}</span>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Ism yoki kompaniya bo'yicha qidirish..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select 
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">Barcha holatlar</option>
            <option value="ACTIVE">Faol amaliyot</option>
            <option value="INACTIVE">Yakunlangan</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className={styles.tableContainer}>
        {isLoading && (
          <div className={styles.loading}>Talabalar ma'lumotlari yuklanmoqda...</div>
        )}

        {isError && (
          <div className={styles.error}>
            <AlertCircle size={40} />
            <p>Talabalar ro'yxatini yuklashda xatolik yuz berdi.</p>
            <button onClick={() => refetch()} className="btn-primary">Qayta urinish</button>
          </div>
        )}

        {!isLoading && !isError && filteredAndSortedStudents.length === 0 && (
          <div className={styles.emptyState}>
            <Users size={48} className={styles.emptyIcon} />
            <h3>Talabalar topilmadi</h3>
            <p>Kiritilgan parametrlarga mos keluvchi talabalar reyestrda mavjud emas.</p>
          </div>
        )}

        {!isLoading && !isError && filteredAndSortedStudents.length > 0 && (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th 
                    className={`${styles.th} ${styles.sortableTh}`}
                    onClick={() => handleSort('NAME')}
                  >
                    <div className={styles.thContent}>
                      <span>Talaba</span>
                      {renderSortIcon('NAME')}
                    </div>
                  </th>
                  <th 
                    className={`${styles.th} ${styles.sortableTh}`}
                    onClick={() => handleSort('COMPANY')}
                  >
                    <div className={styles.thContent}>
                      <span>Kompaniya</span>
                      {renderSortIcon('COMPANY')}
                    </div>
                  </th>
                  <th className={styles.th}>
                    <div className={styles.thContent}>
                      <span>Amaliyot muddati</span>
                    </div>
                  </th>
                  <th 
                    className={`${styles.th} ${styles.sortableTh}`}
                    onClick={() => handleSort('REPORTS')}
                  >
                    <div className={styles.thContent}>
                      <span>Hisobotlar</span>
                      {renderSortIcon('REPORTS')}
                    </div>
                  </th>
                  <th 
                    className={`${styles.th} ${styles.sortableTh}`}
                    onClick={() => handleSort('SCORE')}
                  >
                    <div className={styles.thContent}>
                      <span>O'rtacha ball</span>
                      {renderSortIcon('SCORE')}
                    </div>
                  </th>
                  <th className={styles.th}>
                    <span>Holati</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.map((item) => {
                  const progressPercent = item.total_reports > 0 
                    ? Math.round((item.completed_reports / item.total_reports) * 100)
                    : 0;

                  return (
                    <tr key={item.id} className={styles.tr}>
                      {/* Name & Initials */}
                      <td className={styles.td}>
                        <div className={styles.studentCell}>
                          <div className={styles.avatar}>
                            {getInitials(item.student.full_name)}
                          </div>
                          <div className={styles.studentMeta}>
                            <span className={styles.studentName}>{item.student.full_name}</span>
                            <span className={styles.studentEmail}>{item.student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className={styles.td}>
                        <div className={styles.company}>
                          {item.company_name}
                        </div>
                      </td>

                      {/* Period Range */}
                      <td className={styles.td}>
                        <div className={styles.periodCell}>
                          <Calendar size={14} />
                          <div className={styles.periodDates}>
                            <span>{item.start_date}</span>
                            <span>{item.end_date}</span>
                          </div>
                        </div>
                      </td>

                      {/* Report Progress Bar */}
                      <td className={styles.td}>
                        <div className={styles.progressContainer}>
                          <div className={styles.progressInfo}>
                            <span>{item.completed_reports} / {item.total_reports}</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className={styles.progressBarTrack}>
                            <div 
                              className={styles.progressBarFill}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Average Score Badge */}
                      <td className={styles.td}>
                        <span className={`${styles.scoreBadge} ${getScoreClass(item.average_score)}`}>
                          {item.average_score !== null ? `${item.average_score}` : '—'}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className={styles.td}>
                        <span className={`${styles.statusBadge} ${item.is_active ? styles.statusActive : styles.statusInactive}`}>
                          {item.is_active ? 'Faol' : 'Tugallangan'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
