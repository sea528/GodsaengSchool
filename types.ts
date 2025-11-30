
export enum Screen {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ACCOUNT_SELECTION = 'ACCOUNT_SELECTION',
  CLASS_JOIN = 'CLASS_JOIN',
  DEMO_VIDEO = 'DEMO_VIDEO',
  COMMENT_PRACTICE = 'COMMENT_PRACTICE',
  CHALLENGE_INVITE = 'CHALLENGE_INVITE',
  VERIFICATION_UPLOAD = 'VERIFICATION_UPLOAD',
  REWARD = 'REWARD',
  GROWTH_RECORD = 'GROWTH_RECORD',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  TEACHER_CLASSES = 'TEACHER_CLASSES',
  UPLOAD_CLASS = 'UPLOAD_CLASS',
  TEACHER_CHALLENGES = 'TEACHER_CHALLENGES',
  CREATE_CHALLENGE = 'CREATE_CHALLENGE',
  CREATE_CLASS = 'CREATE_CLASS',
  SIGNUP = 'SIGNUP',
  ADMIN_MANAGE_USERS = 'ADMIN_MANAGE_USERS',
}

export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  GUEST = 'GUEST',
}

export interface ClassItem {
  id: string;
  title: string;
  date: string;
  type: 'video' | 'link';
  thumbnail?: string;
  description?: string;
  url?: string;
}

export interface ChallengeItem {
  id: string;
  title: string;
  status: 'active' | 'pending';
  participants: number;
  description?: string;
  // New fields
  duration?: string;
  targetGrade?: string;
  goalSummary?: string;
  verificationMethod?: 'photo' | 'video' | 'file';
  aiWeight?: number; // 0-100
  badgeName?: string;
  reward?: string; // Points
}

export interface ActivityItem {
  id: string;
  title: string;
  date: string;
  score: number;
  status: 'trusted' | 'verified' | 'review' | 'rejected';
  student?: string;
  className?: string;
  type?: '강의' | '도전';
  progressInfo?: string;
}

export interface BadgeItem {
  id: number;
  name: string;
  icon: string;
  date: string;
}

export interface PointHistoryItem {
  id: number;
  desc: string;
  amount: number;
  date: string;
}

export interface RegisteredClass {
  name: string;
  subject: string;
  code: string;
}

export interface StudentProfile {
  studentNumber?: string;
  points: number;
}

export interface TeacherProfile {
  teacherType?: 'HOMEROOM' | 'SUBJECT'; // 학급담임 | 교과담임
}

export interface User {
  id: string;
  // Email removed
  password?: string;
  name: string;
  role: UserType;
  profile?: StudentProfile | TeacherProfile;
}

export interface PointReason {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
}

export interface Student {
  id: string;
  name: string;
  points: number;
  avatarSeed: string;
}
