# 📱 دليل تطوير Mobile App - HR System

## نظرة عامة
هذا الدليل يوفر خطة كاملة لتطوير تطبيق جوال React Native لنظام إدارة الموارد البشرية.

## 🎯 الأهداف

### المزايا الأساسية
1. **الوصول السريع**: عرض البيانات الأساسية
2. **الإشعارات**: Push notifications فورية
3. **العمل دون اتصال**: Offline mode للقراءة
4. **المزامنة**: Sync تلقائي مع النظام الرئيسي

## 🛠️ التقنيات المقترحة

### Frontend (React Native)
```json
{
  "react-native": "^0.74.0",
  "expo": "~51.0.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.4.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.5.0",
  "react-native-paper": "^5.12.0",
  "react-native-reanimated": "^3.10.0",
  "axios": "^1.6.0"
}
```

### State Management & Offline
```json
{
  "@react-native-async-storage/async-storage": "^1.23.0",
  "react-native-mmkv": "^2.12.0",
  "watermelondb": "^0.27.0",
  "react-query-persist": "^0.2.0"
}
```

### Push Notifications
```json
{
  "expo-notifications": "~0.28.0",
  "@notifee/react-native": "^7.8.0",
  "react-native-firebase": "^19.0.0"
}
```

## 📱 بنية التطبيق

### الشاشات الرئيسية

#### 1. Login Screen
```typescript
// screens/Auth/LoginScreen.tsx
import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    await login({ email, password, otpCode });
  };

  return (
    <View>
      <TextInput 
        value={email}
        onChangeText={setEmail}
        placeholder="البريد الإلكتروني"
      />
      <TextInput 
        value={password}
        onChangeText={setPassword}
        placeholder="كلمة المرور"
        secureTextEntry
      />
      {/* 2FA Support */}
      <TextInput 
        value={otpCode}
        onChangeText={setOtpCode}
        placeholder="رمز المصادقة (اختياري)"
      />
      <Button 
        title={loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

#### 2. Dashboard Screen
```typescript
// screens/Dashboard/DashboardScreen.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useNetInfo } from '@react-native-community/netinfo';

export default function DashboardScreen() {
  const netInfo = useNetInfo();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 دقائق
    // Offline support
    enabled: netInfo.isConnected ?? true,
  });

  return (
    <ScrollView>
      {/* إحصائيات سريعة */}
      <StatsGrid stats={stats} />
      
      {/* الإشعارات الأخيرة */}
      <NotificationsList />
      
      {/* العقود المنتهية قريباً */}
      <ExpiringContracts />
      
      {/* Offline indicator */}
      {!netInfo.isConnected && <OfflineBanner />}
    </ScrollView>
  );
}
```

#### 3. Workers List Screen
```typescript
// screens/Workers/WorkersListScreen.tsx
import { FlatList } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function WorkersListScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['workers'],
    queryFn: ({ pageParam = 1 }) => api.getWorkers({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <FlatList
      data={data?.pages.flatMap(page => page.workers)}
      renderItem={({ item }) => <WorkerCard worker={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      refreshing={isLoading}
      onRefresh={() => {/* Pull to refresh */}}
    />
  );
}
```

#### 4. Worker Details Screen
```typescript
// screens/Workers/WorkerDetailsScreen.tsx
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

export default function WorkerDetailsScreen() {
  const route = useRoute();
  const workerId = route.params.workerId;

  const { data: worker } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => api.getWorkerDetails(workerId),
  });

  return (
    <ScrollView>
      <WorkerHeader worker={worker} />
      <WorkerInfo worker={worker} />
      <WorkerContracts workerId={workerId} />
      <WorkerDocuments workerId={workerId} />
    </ScrollView>
  );
}
```

## 🔔 Push Notifications

### Setup (Expo)
```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    alert('يجب استخدام جهاز حقيقي للإشعارات');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('فشل في الحصول على إذن الإشعارات');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // إرسال الـ token للسيرفر
  await api.registerPushToken(token);
  
  return token;
}

// إعداد معالج الإشعارات
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

### إرسال من السيرفر
```typescript
// server: src/lib/push-notifications.ts
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    data?: any;
  }
) {
  const messages = tokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
    }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return tickets;
}
```

## 💾 Offline Mode

### WatermelonDB Setup
```typescript
// database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workers',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'code', type: 'number' },
        { name: 'nationality', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'contracts',
      columns: [
        { name: 'worker_id', type: 'string' },
        { name: 'client_id', type: 'string' },
        { name: 'start_date', type: 'number' },
        { name: 'end_date', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'synced', type: 'boolean' },
      ],
    }),
  ],
});
```

### Sync Strategy
```typescript
// services/sync.ts
import { useNetInfo } from '@react-native-community/netinfo';
import { database } from '@/database';

export function useSyncManager() {
  const netInfo = useNetInfo();

  const syncData = async () => {
    if (!netInfo.isConnected) {
      console.log('Offline - تأجيل المزامنة');
      return;
    }

    try {
      // 1. رفع التغييرات المحلية
      const unsyncedWorkers = await database
        .get('workers')
        .query(Q.where('synced', false))
        .fetch();

      for (const worker of unsyncedWorkers) {
        await api.updateWorker(worker.id, worker);
        await worker.update(w => { w.synced = true; });
      }

      // 2. تنزيل التحديثات من السيرفر
      const lastSync = await AsyncStorage.getItem('last_sync');
      const updates = await api.getUpdatesSince(lastSync);
      
      await database.write(async () => {
        for (const update of updates) {
          await syncRecordToLocal(update);
        }
      });

      await AsyncStorage.setItem('last_sync', new Date().toISOString());
      
      console.log('✅ المزامنة مكتملة');
    } catch (error) {
      console.error('❌ فشلت المزامنة:', error);
    }
  };

  // مزامنة تلقائية كل 5 دقائق
  useEffect(() => {
    const interval = setInterval(syncData, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, [netInfo.isConnected]);

  return { syncData };
}
```

## 🔐 الأمان

### Secure Storage
```typescript
// services/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setToken(token: string) {
    await SecureStore.setItemAsync('auth_token', token);
  },
  
  async getToken() {
    return await SecureStore.getItemAsync('auth_token');
  },
  
  async removeToken() {
    await SecureStore.deleteItemAsync('auth_token');
  },
};
```

### API Client with Auth
```typescript
// services/api.ts
import axios from 'axios';
import { secureStorage } from './secureStorage';

const api = axios.create({
  baseURL: 'https://your-api.com',
  timeout: 10000,
});

// إضافة الـ token تلقائياً
api.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// معالجة الأخطاء
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token منتهي - تسجيل خروج
      await secureStorage.removeToken();
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export { api };
```

## 📦 هيكل المشروع

```
hr-mobile/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── TwoFactorScreen.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── Workers/
│   │   │   ├── WorkersListScreen.tsx
│   │   │   ├── WorkerDetailsScreen.tsx
│   │   │   └── AddWorkerScreen.tsx
│   │   ├── Contracts/
│   │   │   ├── ContractsListScreen.tsx
│   │   │   └── ContractDetailsScreen.tsx
│   │   ├── Clients/
│   │   │   └── ClientsListScreen.tsx
│   │   ├── Notifications/
│   │   │   └── NotificationsScreen.tsx
│   │   └── Settings/
│   │       └── SettingsScreen.tsx
│   ├── components/
│   │   ├── WorkerCard.tsx
│   │   ├── ContractCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── notifications.ts
│   │   ├── sync.ts
│   │   └── secureStorage.ts
│   ├── database/
│   │   ├── schema.ts
│   │   ├── models/
│   │   └── sync.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWorkers.ts
│   │   ├── useContracts.ts
│   │   └── useSync.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── workersStore.ts
│   │   └── settingsStore.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── types/
│       ├── api.types.ts
│       ├── navigation.types.ts
│       └── models.types.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 خطوات التطوير

### المرحلة 1: الإعداد (Week 1)
- [ ] إنشاء مشروع Expo جديد
- [ ] إعداد TypeScript و ESLint
- [ ] تثبيت المكتبات الأساسية
- [ ] إعداد Navigation
- [ ] إعداد React Query

### المرحلة 2: Authentication (Week 2)
- [ ] شاشة تسجيل الدخول
- [ ] دعم 2FA
- [ ] Secure storage للـ token
- [ ] Auto logout عند انتهاء الـ session

### المرحلة 3: الشاشات الرئيسية (Week 3-4)
- [ ] Dashboard
- [ ] Workers list & details
- [ ] Contracts list & details
- [ ] Clients list
- [ ] Search functionality

### المرحلة 4: Push Notifications (Week 5)
- [ ] إعداد Expo Notifications
- [ ] تسجيل الـ tokens
- [ ] معالجة الإشعارات الواردة
- [ ] Deep linking للإشعارات

### المرحلة 5: Offline Mode (Week 6-7)
- [ ] إعداد WatermelonDB
- [ ] استراتيجية الـ Sync
- [ ] Conflict resolution
- [ ] Offline indicator

### المرحلة 6: Testing & Polish (Week 8)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] UI/UX improvements

## 📝 API Endpoints المطلوبة

### على السيرفر (Next.js)
```typescript
// Required endpoints for mobile app

// Auth
POST /api/mobile/auth/login
POST /api/mobile/auth/verify-2fa
POST /api/mobile/auth/refresh
POST /api/mobile/auth/register-push-token

// Dashboard
GET /api/mobile/dashboard/stats

// Workers
GET /api/mobile/workers?page=1&limit=20
GET /api/mobile/workers/:id
POST /api/mobile/workers
PUT /api/mobile/workers/:id

// Contracts
GET /api/mobile/contracts?page=1&limit=20
GET /api/mobile/contracts/:id

// Notifications
GET /api/mobile/notifications
PUT /api/mobile/notifications/:id/read

// Sync
GET /api/mobile/sync/updates?since=timestamp
POST /api/mobile/sync/push
```

## 🔧 Environment Variables

```env
# .env
API_URL=https://your-api.com
EXPO_PUBLIC_API_URL=https://your-api.com
EXPO_PROJECT_ID=your-expo-project-id
```

## 📱 البناء والنشر

### iOS
```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android
```bash
# Development build
eas build --profile development --platform android

# Production build
eas build --profile production --platform android

# Submit to Play Store
eas submit --platform android
```

## 🎨 التصميم

### Theme
```typescript
// theme.ts
export const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    error: '#ef4444',
    success: '#10b981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
```

## 📊 Performance Tips

1. **Lazy Loading**: استخدم `React.lazy()` للشاشات الكبيرة
2. **Memoization**: استخدم `useMemo` و `useCallback`
3. **Images**: استخدم `FastImage` لتحميل الصور
4. **Lists**: استخدم `FlashList` بدلاً من `FlatList`
5. **Navigation**: استخدم `react-navigation` v6+

## 🔍 Testing

```typescript
// __tests__/LoginScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/screens/Auth/LoginScreen';

describe('LoginScreen', () => {
  it('يجب أن يعرض حقول تسجيل الدخول', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('البريد الإلكتروني')).toBeTruthy();
    expect(getByPlaceholderText('كلمة المرور')).toBeTruthy();
  });

  it('يجب أن يتحقق من البيانات قبل الإرسال', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    const loginButton = getByText('تسجيل الدخول');
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(getByText('يرجى إدخال البريد الإلكتروني')).toBeTruthy();
    });
  });
});
```

---

## 📚 المراجع

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TanStack Query](https://tanstack.com/query/latest)
- [WatermelonDB](https://nozbe.github.io/WatermelonDB/)

---

**ملاحظة**: هذا دليل شامل للمرجع المستقبلي. يمكن البدء بمشروع منفصل عندما يكون هناك حاجة فعلية للتطبيق الجوال.
