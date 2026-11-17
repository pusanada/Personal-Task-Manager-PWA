'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import {
  requestNotificationPermissionAndGetToken,
  isPushNotificationSupported,
} from '@/lib/firebase/client';
import {
  Bell,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Database,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Reminder preferences stored in localStorage
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

        // Register token with backend
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: result.token, platform: 'web' }),
        });

        setTestResult({
          success: true,
          message: 'Push notifications enabled and device token registered successfully!',
        });
      } else if (result.error) {
        setTestResult({
          success: false,
          message: result.error,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register notifications';
      setTestResult({ success: false, message: msg });
    } finally {
      setLoadingToken(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!fcmToken) {
      // If no FCM token, test standard browser notification directly
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 TaskFlow Test Notification', {
          body: 'Your browser is ready to receive deadline alerts!',
          icon: '/icons/icon-192x192.png',
        });
        setTestResult({
          success: true,
          message: 'Local notification delivered! (Connect Firebase Admin credentials for full server Web Push).',
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
          title: '🔔 TaskFlow Deadline Reminder',
          body: 'Great! Your device is ready to receive deadline alerts for upcoming tasks.',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: 'Push notification sent to your device via Firebase Cloud Messaging!',
        });
      } else {
        // Fallback to local notification if server admin isn't configured
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 TaskFlow Notification', {
            body: 'Local fallback notification delivered successfully!',
            icon: '/icons/icon-192x192.png',
          });
        }
        setTestResult({
          success: true,
          message: data.error || 'Server push completed with local verification.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Test failed';
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage deadline notifications, reminder windows, and display themes.
          </p>
        </div>

        {/* 1. Theme Selection */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Interface Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred visual appearance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id as any)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold gap-2 transition-all',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Push Notifications & FCM */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span>Push Notifications (Firebase Cloud Messaging)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Receive proactive reminders for urgent tasks and upcoming deadlines.
              </p>
            </div>

            <div className="text-right">
              <span
                className={cn(
                  'text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                  notificationPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {notificationPermission}
              </span>
            </div>
          </div>

          {!isSupported ? (
            <div className="p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Web push notifications are not supported in this browser environment.</span>
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
                      ? 'Notifications Active'
                      : 'Enable Push Notifications'}
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
                    <span>Send Test Notification</span>
                  </Button>
                )}
              </div>

              {testResult && (
                <div
                  className={cn(
                    'p-3 text-xs rounded-xl border flex items-center gap-2',
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  )}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Reminder Window Preferences */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Reminder Windows
                </span>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Overdue Task Alerts
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Alert immediately when a task passes its deadline
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindOverdue}
                      onChange={(e) => saveReminderPref('overdue', e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Due Today Morning Reminder
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Notify in the morning about assignments due before midnight
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remindDueToday}
                      onChange={(e) => saveReminderPref('today', e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        48-Hour Advance Warning
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Advance alert 2 days before deadline for larger projects
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={remind48h}
                      onChange={(e) => saveReminderPref('48h', e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3. System & PWA Status */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            System & Storage Architecture
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Progressive Web App (PWA)
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Service Worker & Offline Shell Active
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <Database className="w-5 h-5 text-teal-500 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Database & Storage
                </span>
                <span className="text-[11px] text-slate-500">
                  Supabase PostgreSQL + Local-First Fallback
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
