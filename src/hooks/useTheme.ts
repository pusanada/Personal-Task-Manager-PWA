'use client';

import { useState, useEffect } from 'react';

type Theme = 'light';

/**
 * TaskFlow ใช้ธีมขาวเท่านั้น (ตามแนวทางการออกแบบ)
 * hook นี้ถูกเก็บไว้เพื่อความเข้ากันได้ และบังคับให้แสดงผลโหมดสว่างเสมอ
 */
export function useTheme() {
  const [theme] = useState<Theme>('light');
  const [resolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // ล้างการตั้งค่าธีมเดิม และบังคับโหมดสว่าง
    localStorage.removeItem('taskflow_theme');
    document.documentElement.classList.remove('dark');
  }, []);

  const setTheme = (_: Theme) => {
    // ธีมเดียว: สว่าง (ไม่มีตัวเลือกอื่น)
  };

  return { theme, resolvedTheme, setTheme };
}
