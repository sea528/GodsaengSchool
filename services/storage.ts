
import { User, UserType, ClassItem, ChallengeItem, ActivityItem, RegisteredClass, StudentProfile, TeacherProfile } from '../types';

const KEYS = {
  USERS: 'gs_users',
  CLASSES: 'gs_classes',
  CHALLENGES: 'gs_challenges',
  ACTIVITIES: 'gs_activities',
  REGISTERED_CLASSES: 'gs_registered_classes',
  CURRENT_USER: 'gs_current_user',
};

const INITIAL_CLASSES: ClassItem[] = [
  { id: 'sample-1', title: '3분 갓생: 효율적인 시간 관리법', date: '2024.03.15', type: 'video', description: '하루 24시간을 48시간처럼 쓰는 시간 관리 노하우', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'sample-2', title: '학습 집중력을 높이는 5가지 습관', date: '2024.03.14', type: 'link', description: '공부할 때 집중이 안 된다면 꼭 확인해보세요.', url: 'https://example.com' },
];

const INITIAL_CHALLENGES: ChallengeItem[] = [
  { id: '1', title: '아침 독서 10분 인증', status: 'active', participants: 24, description: '매일 아침 10분 독서하고 인증샷을 올려주세요.', reward: '500' },
  { id: '2', title: '하루 물 1L 마시기', status: 'active', participants: 18, description: '건강을 위해 물 마시는 습관을 길러봅시다.', reward: '300' },
];

export const StorageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  login: (credentials: { name: string, password?: string, studentNumber?: string, type: UserType }): User | null => {
    const users = StorageService.getUsers();
    
    if (credentials.type === UserType.STUDENT) {
      return users.find(u => 
        u.role === UserType.STUDENT && 
        // For students, ignore name, check studentNumber
        (u.profile as StudentProfile)?.studentNumber === credentials.studentNumber &&
        u.password === credentials.password
      ) || null;
    } else {
      return users.find(u => 
        u.role === UserType.TEACHER && 
        u.name === credentials.name && 
        u.password === credentials.password
      ) || null;
    }
  },

  register: (user: User): boolean => {
    const users = StorageService.getUsers();
    
    // Check for duplicates
    const exists = users.some(u => {
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

  // 일괄 등록 (중복 건너뜀)
  bulkRegister: (newUsers: User[]): { success: number, fail: number } => {
    const users = StorageService.getUsers();
    let successCount = 0;
    let failCount = 0;

    newUsers.forEach(user => {
      const exists = users.some(u => {
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
    const users = StorageService.getUsers();
    // Convert to string for robust comparison (handles number IDs)
    const newUsers = users.filter(u => String(u.id) !== String(id));
    localStorage.setItem(KEYS.USERS, JSON.stringify(newUsers));
  },

  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  updateUserPoints: (identifier: string, amount: number) => {
    // identifier can be name for now, in robust system should be ID
    const users = StorageService.getUsers();
    const updatedUsers = users.map(u => {
      // Allow finding by name for simplicity in this demo context
      if (u.name === identifier && u.role === UserType.STUDENT && u.profile) {
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
    
    // Update current user if it matches
    const currentUser = StorageService.getCurrentUser();
    if (currentUser && currentUser.name === identifier) {
      const updatedCurrent = updatedUsers.find(u => u.name === identifier);
      if (updatedCurrent) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedCurrent));
      }
    }
  },

  getClasses: (): ClassItem[] => {
    const data = localStorage.getItem(KEYS.CLASSES);
    return data ? JSON.parse(data) : INITIAL_CLASSES;
  },

  addClass: (item: ClassItem) => {
    const items = StorageService.getClasses();
    localStorage.setItem(KEYS.CLASSES, JSON.stringify([item, ...items]));
  },

  removeClass: (id: string) => {
    const items = StorageService.getClasses();
    // Convert both to string to be safe
    const newItems = items.filter(c => String(c.id) !== String(id));
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(newItems));
  },

  getChallenges: (): ChallengeItem[] => {
    const data = localStorage.getItem(KEYS.CHALLENGES);
    return data ? JSON.parse(data) : INITIAL_CHALLENGES;
  },

  addChallenge: (item: ChallengeItem) => {
    const items = StorageService.getChallenges();
    localStorage.setItem(KEYS.CHALLENGES, JSON.stringify([item, ...items]));
  },

  removeChallenge: (id: string) => {
    const items = StorageService.getChallenges();
    const newItems = items.filter(c => String(c.id) !== String(id));
    localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(newItems));
  },

  getActivities: (): ActivityItem[] => {
    const data = localStorage.getItem(KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  },

  addActivity: (item: ActivityItem) => {
    const items = StorageService.getActivities();
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify([item, ...items]));
  },

  updateActivityStatus: (id: string, status: ActivityItem['status']) => {
    const items = StorageService.getActivities();
    const updated = items.map(i => i.id === id ? { ...i, status } : i);
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(updated));
  },

  getRegisteredClasses: (): RegisteredClass[] => {
    const data = localStorage.getItem(KEYS.REGISTERED_CLASSES);
    return data ? JSON.parse(data) : [];
  },

  addRegisteredClass: (item: RegisteredClass) => {
    const items = StorageService.getRegisteredClasses();
    localStorage.setItem(KEYS.REGISTERED_CLASSES, JSON.stringify([...items, item]));
  }
};
