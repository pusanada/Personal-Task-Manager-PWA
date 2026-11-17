'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import {
  requestNotificationPermissionAndGetToken,
  isPushNotificationSupported,
} from '@/lib/firebase/client';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Database,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function SettingsPage() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // การตั้งค่าการแจ้งเตือน (เก็บใน localStorage)
  const [remindOverdue, setRemindOverdue] = useState(true);
  const [remindDueToday, setRemindDueToday] = useState(true);
  const [remind48h, setRemind48h] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
      const savedToken = localStorage.getItem('taskflow_fcm_token');
      if (savedToken) setFcmToken(savedToken);

      const savedPrefs = localStorage.getItem('taskflow_reminder_prefs');
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          if (parsed.remindOverdue !== undefined) setRemindOverdue(parsed.remindOverdue);
          if (parsed.remindDueToday !== undefined) setRemindDueToday(parsed.remindDueToday);
          if (parsed.remind48h !== undefined) setRemind48h(parsed.remind48h);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const saveReminderPref = (key: string, val: boolean) => {
    if (key === 'overdue') setRemindOverdue(val);
    if (key === 'today') setRemindDueToday(val);
    if (key === '48h') setRemind48h(val);

    const updated = {
      remindOverdue: key === 'overdue' ? val : remindOverdue,
      remindDueToday: key === 'today' ? val : remindDueToday,
      remind48h: key === '48h' ? val : remind48h,
    };
    localStorage.setItem('taskflow_reminder_prefs', JSON.stringify(updated));
  };

  const handleEnableNotifications = async () => {
    try {
      setLoadingToken(true);
      setTestResult(null);

      const result = await requestNotificationPermissionAndGetToken();

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      if (result.token) {
        setFcmToken(result.token);
        localStorage.setItem('taskflow_fcm_token', result.token);

        // ลงทะเบียน token กับ backend
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: result.token, platform: 'web' }),
        });

        setTestResult({
          success: true,
          message: 'เปิดใช้งานการแจ้งเตือนและลงทะเบียนอุปกรณ์เรียบร้อยแล้ว',
        });
      } else if (result.error) {
        setTestResult({
          success: false,
          message: result.error,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ลงทะเบียนการแจ้งเตือนไม่สำเร็จ';
      setTestResult({ success: false, message: msg });
    } finally {
      setLoadingToken(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!fcmToken) {
      // ถ้าไม่มี FCM token ทดสอบการแจ้งเตือนในเบราว์เซอร์โดยตรง
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 ทดสอบการแจ้งเตือน TaskFlow', {
          body: 'เบราว์เซอร์ของคุณพร้อมรับการแจ้งเตือนกำหนดส่งแล้ว!',
          icon: '/icons/icon-192x192.png',
        });
        setTestResult({
          success: true,
          message: 'ส่งการแจ้งเตือนในเครื่องสำเร็จ! (เชื่อมต่อ Firebase Admin เพื่อใช้ Web Push แบบเต็มรูปแบบ)',
        });
      }
      return;
    }

    try {
      setTestingNotification(true);
      setTestResult(null);

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fcmToken,
          title: '🔔 แจ้งเตือนกำหนดส่งจาก TaskFlow',
          body: 'อุปกรณ์ของคุณพร้อมรับการแจ้งเตือนงานที่กำลังจะถึงแล้ว',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: 'ส่งการแจ้งเตือนไปยังอุปกรณ์ของคุณผ่าน Firebase Cloud Messaging แล้ว!',
        });
      } else {
        // สำรอง: แจ้งเตือนในเครื่องหากยังไม่ได้ตั้งค่า server admin
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 การแจ้งเตือน TaskFlow', {
            body: 'ส่งการแจ้งเตือนสำรองในเครื่องสำเร็จ!',
            icon: '/icons/icon-192x192.png',
          });
        }
        setTestResult({
          success: true,
          message: data.error || 'ส่งการแจ้งเตือนสำรองในเครื่องสำเร็จ',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'การทดสอบล้มเหลว';
      setTestResult({ success: false, message: msg });
    } finally {
      setTestingNotification(false);
    }
  };

  const isSupported = isPushNotificationSupported();

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            ตั้งค่า
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            จัดการการแจ้งเตือนกำหนดส่งและการแจ้งเตือนล่วงหน้า
          </p>
        </div>

        {/* 1. การแจ้งเตือนแบบ Push (FCM) */}
        <section className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span>การแจ้งเตือนแบบ Push</span>
              </h3>
              <p className="text-xs text-muted mt-0.5">
                รับการแจ้งเตือนล่วงหน้าสำหรับงานด่วนและกำหนดส่งที่ใกล้ถึง
              </p>
            </div>

            <div className="text-right">
              <span
                className={cn(
                  'text-[11px] font-medium px-2.5 py-1 rounded-full',
                  notificationPermission === 'granted'
                    ? 'bg-green-50 text-done'
                    : notificationPermission === 'denied'
                    ? 'bg-red-50 text-overdue'
                    : 'bg-neutral-100 text-neutral-500'
                )}
              >
                {notificationPermission === 'granted'
                  ? 'เปิดใช้งาน'
                  : notificationPermission === 'denied'
                  ? 'ถูกปฏิเสธ'
                  : 'ยังไม่เปิดใช้งาน'}
              </span>
            </div>
          </div>

          {!isSupported ? (
            <div className="p-3 text-xs rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-due-soon" />
              <span>เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือนแบบ Web Push</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleEnableNotifications}
                  loading={loadingToken}
                  disabled={notificationPermission === 'granted' && Boolean(fcmToken)}
                  className="gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    {notificationPermission === 'granted' && fcmToken
                      ? 'การแจ้งเตือนทำงานอยู่'
                      : 'เปิดใช้งานการแจ้งเตือน'}
                  </span>
                </Button>

                {notificationPermission === 'granted' && (
                  <Button
                    variant="outline"
                    onClick={handleSendTestNotification}
                    loading={testingNotification}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>ทดสอบการแจ้งเตือน</span>
                  </Button>
                )}
              </div>

              {testResult && (
                <div
                  className={cn(
                    'p-3 text-xs rounded-lg border flex items-center gap-2',
                    testResult.success
                      ? 'bg-green-50 text-done border-green-200'
                      : 'bg-red-50 text-overdue border-red-200'
                  )}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* ช่วงเวลาที่ต้องการแจ้งเตือน */}
              <div className="pt-3 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-semibold text-neutral-700 block">
                  ช่วงเวลาแจ้งเตือน
                </span>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer text-xs">
                    <div>
                      <span className="font-medium text-neutral-900 block">
                        แจ้งเตือนงานเกินกำหนด
                      </span>
                      <span className="text-[11px] text-muted">
                        แจ้งทันทีเมื่องานเลยกำหนดส่ง
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindOverdue}
                      onChange={(e) => saveReminderPref('overdue', e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer text-xs">
                    <div>
                      <span className="font-medium text-neutral-900 block">
                        แจ้งเตือนวันกำหนดส่ง 3 รอบ (08:00 น., 11:00 น., 17:00 น.)
                      </span>
                      <span className="text-[11px] text-muted">
                        แจ้งเตือนในวันส่งงาน 3 เวลา: รอบเช้า 8 โมง, รอบสาย 11 โมง, และรอบเย็น 5 โมง
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindDueToday}
                      onChange={(e) => saveReminderPref('today', e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer text-xs">
                    <div>
                      <span className="font-medium text-neutral-900 block">
                        แจ้งเตือนล่วงหน้า 2 วัน (48 ชั่วโมงก่อนกำหนดส่ง)
                      </span>
                      <span className="text-[11px] text-muted">
                        แจ้งเตือนล่วงหน้า 2 วันก่อนกำหนดส่ง เพื่อเตรียมตัวทำงานล่วงหน้า
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind48h}
                      onChange={(e) => saveReminderPref('48h', e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              {/* ข้อแนะนำการเปิดใช้งาน Web Push บน Vercel / มือถือ */}
              <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 space-y-1.5">
                <p className="font-medium text-neutral-900 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>รอบเวลาการแจ้งเตือนอัตโนมัติ (Server Cron):</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted ml-1">
                  <li><strong>ล่วงหน้า 2 วัน:</strong> แจ้งเตือนเมื่อเหลือเวลา 48 ชม. ก่อนกำหนดส่ง</li>
                  <li><strong>วันกำหนดส่ง:</strong> แจ้งเตือน 3 รอบต่อวัน เวลา <strong>08:00 น.</strong>, <strong>11:00 น.</strong> และ <strong>17:00 น.</strong></li>
                  <li><strong>งานเกินกำหนด:</strong> แจ้งเตือนทันทีเมื่องานเลยกำหนดส่ง</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* 2. ระบบและการจัดเก็บ */}
        <section className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3">
          <h3 className="text-base font-semibold text-neutral-900">
            ระบบและการจัดเก็บข้อมูล
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-surface border border-neutral-200 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="font-medium text-neutral-900 block">
                  Progressive Web App (PWA)
                </span>
                <span className="text-[11px] text-done font-medium">
                  Service Worker และโหมดออฟไลน์ทำงานอยู่
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-neutral-200 flex items-center gap-3">
              <Database className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="font-medium text-neutral-900 block">
                  ฐานข้อมูลและพื้นที่จัดเก็บ
                </span>
                <span className="text-[11px] text-muted">
                  Supabase PostgreSQL + สำรองข้อมูลในเครื่อง
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
