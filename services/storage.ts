
import { User, UserType, ClassItem, ChallengeItem, ActivityItem, RegisteredClass, StudentProfile, TeacherProfile } from '../types';

const KEYS = {
  USERS: 'gs_users',
  CLASSES: 'gs_classes',
  CHALLENGES: 'gs_challenges',
  ACTIVITIES: 'gs_activities',
  REGISTERED_CLASSES: 'gs_registered_classes',
  CURRENT_USER: 'gs_current_user',
};

// Initial data now needs a default school ID to be visible. 
// We will assign them to '갓생고등학교' for demo purposes.
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

  getUsers: (currentUser?: User | null): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    const allUsers: User[] = data ? JSON.parse(data) : [];
    if (!currentUser) return allUsers;
    return allUsers.filter(u => u.schoolId === currentUser.schoolId);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  login: (credentials: { name: string, password?: string, studentNumber?: string, type: UserType, schoolId: string }): User | null => {
    // Super Admin Backdoor (Hardcoded)
    if (credentials.name === 'haewon' && credentials.password === 'tprudrh@' && credentials.type === UserType.TEACHER) {
      const adminUser: User = {
        id: 'admin-haewon',
        name: 'haewon',
        role: UserType.TEACHER,
        schoolId: credentials.schoolId, // Log in to the specific school context
        password: credentials.password,
        profile: { teacherType: 'HOMEROOM' }
      };
      // Save session
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
      return users.find(u => 
        u.role === UserType.TEACHER && 
        u.schoolId === credentials.schoolId &&
        u.name === credentials.name && 
        u.password === credentials.password
      ) || null;
    }
  },

  register: (user: User): boolean => {
    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [];
    
    // Check for duplicates WITHIN the same school
    const exists = users.some(u => {
      if (u.schoolId !== user.schoolId) return false;

      if (user.role === UserType.STUDENT) {
        return u.role === UserType.STUDENT && (u.profile as StudentProfile)?.studentNumber === (user.profile as StudentProfile)?.studentNumber;
      } else {
        return u.role === UserType.TEACHER && u.name === user.name;
      }
    });

    if (exists) return false;

    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
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
    
    // Update current user if matched
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
    
    // Filter by school
    const schoolId = currentUser?.schoolId || DEMO_SCHOOL;
    
    // If we have initial classes but they don't have schoolId set (from old version), treat them as demo school
    // In this new version, we default new items to have schoolId.
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
    return items.filter(item => (item.schoolId || DEMO_SCHOOL) === schoolId);
  },

  addRegisteredClass: (item: RegisteredClass) => {
    const data = localStorage.getItem(KEYS.REGISTERED_CLASSES);
    const items: RegisteredClass[] = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.REGISTERED_CLASSES, JSON.stringify([...items, item]));
  }
};
