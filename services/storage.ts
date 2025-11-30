
import { User, UserType, ClassItem, ChallengeItem, ActivityItem, RegisteredClass, StudentProfile, TeacherProfile } from '../types';

const KEYS = {
  USERS: 'gs_users',
  CLASSES: 'gs_classes',
  CHALLENGES: 'gs_challenges',
  ACTIVITIES: 'gs_activities',
  REGISTERED_CLASSES: 'gs_registered_classes',
  CURRENT_USER: 'gs_current_user',
};

const DEMO_SCHOOL = '갓생고등학교';

const INITIAL_CLASSES: ClassItem[] = [
  { id: 'sample-1', schoolId: DEMO_SCHOOL, title: '3분 갓생: 효율적인 시간 관리법', date: '2024.03.15', type: 'video', description: '하루 24시간을 48시간처럼 쓰는 시간 관리 노하우', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'sample-2', schoolId: DEMO_SCHOOL, title: '학습 집중력을 높이는 5가지 습관', date: '2024.03.14', type: 'link', description: '공부할 때 집중이 안 된다면 꼭 확인해보세요.', url: 'https://example.com' },
];

const INITIAL_CHALLENGES: ChallengeItem[] = [
  { id: '1', schoolId: DEMO_SCHOOL, title: '아침 독서 10분 인증', status: 'active', participants: 24, description: '매일 아침 10분 독서하고 인증샷을 올려주세요.', reward: '500' },
  { id: '2', schoolId: DEMO_SCHOOL, title: '하루 물 1L 마시기', status: 'active', participants: 18, description: '건강을 위해 물 마시는 습관을 길러봅시다.', reward: '300' },
];

export const StorageService = {
  // Helper to check school match
  isSameSchool: (itemSchoolId: string, userSchoolId?: string) => {
    return itemSchoolId === userSchoolId;
  },

  getUsers: (currentUser?: User | null, schoolIdFilter?: string): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    const allUsers: User[] = data ? JSON.parse(data) : [];
    
    // Admin override: if filter is provided, use it
    if (schoolIdFilter) {
        return allUsers.filter(u => u.schoolId === schoolIdFilter);
    }

    if (!currentUser) return allUsers;
    
    // Super admin (heawon) sees everything (or filtered by UI)
    if (currentUser.name === 'heawon' || currentUser.name === 'haewon') {
        return allUsers; 
    }

    // School Admin or Regular Teacher sees only their school
    return allUsers.filter(u => u.schoolId === currentUser.schoolId);
  },

  // New method: Check if a school already has an admin
  hasSchoolAdmin: (schoolId: string): boolean => {
    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    return users.some(u => u.schoolId === schoolId && u.isAdmin === true);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  login: (credentials: { name: string, password?: string, studentNumber?: string, type: UserType, schoolId: string }): User | null => {
    // Super Admin Backdoor
    if ((credentials.name === 'heawon' || credentials.name === 'haewon') && credentials.password === 'tprudrh@' && credentials.type === UserType.TEACHER) {
      const adminUser: User = {
        id: 'admin-heawon',
        name: 'heawon', 
        role: UserType.TEACHER,
        schoolId: credentials.schoolId || 'System Admin', 
        password: credentials.password,
        isAdmin: true, // Super Admin
        profile: { teacherType: 'HOMEROOM' }
      };
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(adminUser));
      return adminUser;
    }

    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    
    if (credentials.type === UserType.STUDENT) {
      return users.find(u => 
        u.role === UserType.STUDENT && 
        u.schoolId === credentials.schoolId &&
        (u.profile as StudentProfile)?.studentNumber === credentials.studentNumber &&
        u.password === credentials.password
      ) || null;
    } else {
      // Teacher Login
      return users.find(u => 
        u.role === UserType.TEACHER && 
        u.schoolId === credentials.schoolId &&
        u.name === credentials.name && 
        u.password === credentials.password
      ) || null;
    }
  },

  checkWrongRole: (credentials: { name: string, password?: string, studentNumber?: string, type: UserType, schoolId: string }): User | null => {
    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];

    if (credentials.type === UserType.STUDENT) {
        return users.find(u => 
            u.role === UserType.TEACHER &&
            u.schoolId === credentials.schoolId &&
            u.name === credentials.name && 
            u.password === credentials.password
        ) || null;
    } else {
         return users.find(u => 
            u.role === UserType.STUDENT &&
            u.schoolId === credentials.schoolId &&
            u.name === credentials.name &&
            u.password === credentials.password
        ) || null;
    }
  },

  register: (user: User): boolean => {
    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    
    // Check for duplicates
    const exists = users.some(u => {
      if (u.schoolId !== user.schoolId) return false;

      // Duplicate Check
      if (user.role === UserType.STUDENT) {
        return u.role === UserType.STUDENT && (u.profile as StudentProfile)?.studentNumber === (user.profile as StudentProfile)?.studentNumber;
      } else {
        return u.role === UserType.TEACHER && u.name === user.name;
      }
    });

    if (exists) return false;

    // Admin Constraint: Check if trying to register an admin for a school that already has one
    if (user.isAdmin) {
       const adminExists = users.some(u => u.schoolId === user.schoolId && u.isAdmin === true);
       if (adminExists) return false; // Fail if admin exists
    }

    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    
    // Only set current user if it's a self-registration (not bulk/admin create)
    // We assume this method is used for self-registration mostly, but we can't distinguish easily without context.
    // However, RegisterScreen uses this. Admin screen usually uses bulkRegister or specific logic.
    // Let's keep it safe: update current user ONLY if not already logged in (self-reg)
    const currentUser = localStorage.getItem(KEYS.CURRENT_USER);
    if (!currentUser) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    }
    
    return true;
  },

  bulkRegister: (newUsers: User[]): { success: number, fail: number } => {
    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    let successCount = 0;
    let failCount = 0;

    newUsers.forEach(user => {
      const exists = users.some(u => {
        if (u.schoolId !== user.schoolId) return false;
        if (user.role === UserType.STUDENT) {
          return u.role === UserType.STUDENT && (u.profile as StudentProfile)?.studentNumber === (user.profile as StudentProfile)?.studentNumber;
        } else {
          return u.role === UserType.TEACHER && u.name === user.name;
        }
      });

      // Also ensure we don't bulk register multiple admins if one exists (though bulk usually is regular users)
      // We skip admin check here for simplicity as bulk is mostly for students/teachers
      
      if (!exists) {
        users.push(user);
        successCount++;
      } else {
        failCount++;
      }
    });

    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return { success: successCount, fail: failCount };
  },

  removeUser: (id: string) => {
    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    const newUsers = users.filter(u => String(u.id) !== String(id));
    localStorage.setItem(KEYS.USERS, JSON.stringify(newUsers));
  },

  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  updateUserPoints: (identifier: string, amount: number) => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    
    const updatedUsers = users.map(u => {
      if (u.schoolId === currentUser.schoolId && u.name === identifier && u.role === UserType.STUDENT && u.profile) {
        const profile = u.profile as StudentProfile;
        return {
          ...u,
          profile: {
            ...profile,
            points: (profile.points || 0) + amount
          }
        };
      }
      return u;
    });
    localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
    
    if (currentUser.name === identifier) {
      const updatedCurrent = updatedUsers.find(u => u.name === identifier && u.schoolId === currentUser.schoolId);
      if (updatedCurrent) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedCurrent));
      }
    }
  },

  getClasses: (currentUser?: User | null): ClassItem[] => {
    const data = localStorage.getItem(KEYS.CLASSES);
    const items: ClassItem[] = data ? JSON.parse(data) : INITIAL_CLASSES;
    const schoolId = currentUser?.schoolId || DEMO_SCHOOL;
    // Super Admin sees all? No, let's keep isolation to avoid clutter, or rely on currentUser context
    if (currentUser?.name === 'heawon' || currentUser?.name === 'haewon') return items;
    return items.filter(item => (item.schoolId || DEMO_SCHOOL) === schoolId);
  },

  addClass: (item: ClassItem) => {
    const data = localStorage.getItem(KEYS.CLASSES);
    const items: ClassItem[] = data ? JSON.parse(data) : INITIAL_CLASSES;
    localStorage.setItem(KEYS.CLASSES, JSON.stringify([item, ...items]));
  },

  removeClass: (id: string) => {
    const data = localStorage.getItem(KEYS.CLASSES);
    const items: ClassItem[] = data ? JSON.parse(data) : INITIAL_CLASSES;
    const newItems = items.filter(c => String(c.id) !== String(id));
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(newItems));
  },

  getChallenges: (currentUser?: User | null): ChallengeItem[] => {
    const data = localStorage.getItem(KEYS.CHALLENGES);
    const items: ChallengeItem[] = data ? JSON.parse(data) : INITIAL_CHALLENGES;
    const schoolId = currentUser?.schoolId || DEMO_SCHOOL;
    if (currentUser?.name === 'heawon' || currentUser?.name === 'haewon') return items;
    return items.filter(item => (item.schoolId || DEMO_SCHOOL) === schoolId);
  },

  addChallenge: (item: ChallengeItem) => {
    const data = localStorage.getItem(KEYS.CHALLENGES);
    const items: ChallengeItem[] = data ? JSON.parse(data) : INITIAL_CHALLENGES;
    localStorage.setItem(KEYS.CHALLENGES, JSON.stringify([item, ...items]));
  },

  removeChallenge: (id: string) => {
    const data = localStorage.getItem(KEYS.CHALLENGES);
    const items: ChallengeItem[] = data ? JSON.parse(data) : INITIAL_CHALLENGES;
    const newItems = items.filter(c => String(c.id) !== String(id));
    localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(newItems));
  },

  getActivities: (currentUser?: User | null): ActivityItem[] => {
    const data = localStorage.getItem(KEYS.ACTIVITIES);
    const items: ActivityItem[] = data ? JSON.parse(data) : [];
    const schoolId = currentUser?.schoolId || DEMO_SCHOOL;
    if (currentUser?.name === 'heawon' || currentUser?.name === 'haewon') return items;
    return items.filter(item => (item.schoolId || DEMO_SCHOOL) === schoolId);
  },

  addActivity: (item: ActivityItem) => {
    const data = localStorage.getItem(KEYS.ACTIVITIES);
    const items: ActivityItem[] = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify([item, ...items]));
  },

  updateActivityStatus: (id: string, status: ActivityItem['status']) => {
    const data = localStorage.getItem(KEYS.ACTIVITIES);
    const items: ActivityItem[] = data ? JSON.parse(data) : [];
    const updated = items.map(i => i.id === id ? { ...i, status } : i);
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(updated));
  },

  getRegisteredClasses: (currentUser?: User | null): RegisteredClass[] => {
    const data = localStorage.getItem(KEYS.REGISTERED_CLASSES);
    const items: RegisteredClass[] = data ? JSON.parse(data) : [];
    const schoolId = currentUser?.schoolId || DEMO_SCHOOL;
    if (currentUser?.name === 'heawon' || currentUser?.name === 'haewon') return items;
    return items.filter(item => (item.schoolId || DEMO_SCHOOL) === schoolId);
  },

  addRegisteredClass: (item: RegisteredClass) => {
    const data = localStorage.getItem(KEYS.REGISTERED_CLASSES);
    const items: RegisteredClass[] = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.REGISTERED_CLASSES, JSON.stringify([...items, item]));
  }
};
