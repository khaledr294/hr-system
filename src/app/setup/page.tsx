export default function SetupPage() {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '50px auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      direction: 'rtl'
    }}>
      <h1 style={{ 
        color: '#2563eb', 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        🚀 إعداد نظام إدارة الموارد البشرية
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#dc2626' }}>⚠️ خطأ 404 - الصفحة غير موجودة</h2>
        <p>هذا يعني أن النشر لم يكتمل بعد أو أن هناك مشكلة في الإعداد.</p>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#059669' }}>🔧 الحلول البديلة:</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <h4>1. جرب هذا الرابط:</h4>
          <a 
            href="/api/setup" 
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block'
            }}
            target="_blank"
          >
            إعداد المستخدمين الافتراضيين
          </a>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4>2. أو انسخ هذا الرابط:</h4>
          <code style={{
            backgroundColor: '#f3f4f6',
            padding: '5px',
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            https://your-app-url.vercel.app/api/setup
          </code>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#d97706' }}>🔑 بيانات تسجيل الدخول الافتراضية:</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>مدير النظام:</strong><br/>
          Email: admin@hr-system.com<br/>
          Password: 123456
        </div>

        <div>
          <strong>مدير الموارد البشرية:</strong><br/>
          Email: hr@hr-system.com<br/>
          Password: 123456
        </div>
      </div>

      <div style={{
        backgroundColor: '#dcfce7',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#16a34a' }}>✅ بعد إنشاء المستخدمين:</h3>
        <ol>
          <li>اذهب إلى صفحة تسجيل الدخول</li>
          <li>استخدم أحد بيانات تسجيل الدخول أعلاه</li>
          <li>ابدأ استخدام النظام</li>
        </ol>
      </div>
    </div>
  );
}
