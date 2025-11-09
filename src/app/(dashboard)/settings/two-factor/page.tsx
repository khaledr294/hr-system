'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { Shield, QrCode, CheckCircle, XCircle, Smartphone } from 'lucide-react';

interface TwoFactorStatus {
  enabled: boolean;
  qrCode?: string;
  secret?: string;
}

export default function TwoFactorPage() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/two-factor');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable' })
      });

      if (response.ok) {
        await fetchStatus();
      } else {
        alert('حدث خطأ أثناء تفعيل المصادقة الثنائية');
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      alert('حدث خطأ أثناء تفعيل المصادقة الثنائية');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      alert('الرجاء إدخال رمز التحقق');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'verify',
          code: verificationCode
        })
      });

      if (response.ok) {
        alert('تم تفعيل المصادقة الثنائية بنجاح');
        await fetchStatus();
        setVerificationCode('');
      } else {
        alert('رمز التحقق غير صحيح');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('حدث خطأ أثناء التحقق');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في تعطيل المصادقة الثنائية؟')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' })
      });

      if (response.ok) {
        alert('تم تعطيل المصادقة الثنائية');
        await fetchStatus();
      } else {
        alert('حدث خطأ أثناء تعطيل المصادقة الثنائية');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('حدث خطأ أثناء تعطيل المصادقة الثنائية');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-teal-100 rounded-lg">
          <Shield className="w-8 h-8 text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المصادقة الثنائية (2FA)</h1>
          <p className="text-gray-500">حماية إضافية لحسابك</p>
        </div>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-white rounded-lg border-2 border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {status?.enabled ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">المصادقة الثنائية مفعلة</h3>
                  <p className="text-sm text-gray-600">حسابك محمي بمستوى أمان إضافي</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">المصادقة الثنائية معطلة</h3>
                  <p className="text-sm text-gray-600">قم بتفعيلها لحماية أفضل</p>
                </div>
              </>
            )}
          </div>
        </div>

        {!status?.enabled && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-2">كيف تعمل المصادقة الثنائية؟</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>قم بتثبيت تطبيق مصادقة مثل Google Authenticator أو Microsoft Authenticator</li>
                <li>انقر على &quot;تفعيل المصادقة الثنائية&quot; أدناه</li>
                <li>امسح رمز QR باستخدام التطبيق</li>
                <li>أدخل الرمز الذي يظهر في التطبيق للتأكيد</li>
              </ol>
            </div>

            <Button onClick={handleEnable} disabled={processing} variant="primary">
              <div className="flex items-center gap-2">
                {processing ? <LoadingSpinner size="sm" /> : <Shield className="w-5 h-5" />}
                <span>تفعيل المصادقة الثنائية</span>
              </div>
            </Button>
          </div>
        )}

        {status?.enabled && status.qrCode && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <QrCode className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  امسح هذا الرمز باستخدام تطبيق المصادقة
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={status.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                {status.secret && (
                  <p className="text-xs text-gray-600 mt-3">
                    أو أدخل الرمز يدوياً: <code className="bg-gray-200 px-2 py-1 rounded">{status.secret}</code>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                رمز التحقق (6 أرقام)
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleVerify} disabled={processing} variant="primary">
                <div className="flex items-center gap-2">
                  {processing ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
                  <span>تأكيد</span>
                </div>
              </Button>
            </div>
          </div>
        )}

        {status?.enabled && !status.qrCode && (
          <Button onClick={handleDisable} disabled={processing} variant="danger">
            <div className="flex items-center gap-2">
              {processing ? <LoadingSpinner size="sm" /> : <XCircle className="w-4 h-4" />}
              <span>تعطيل المصادقة الثنائية</span>
            </div>
          </Button>
        )}
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 text-teal-600 mt-1" />
          <div>
            <h4 className="font-bold text-teal-900 mb-2">تطبيقات المصادقة الموصى بها</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• Google Authenticator</li>
              <li>• Microsoft Authenticator</li>
              <li>• Authy</li>
              <li>• 1Password</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

