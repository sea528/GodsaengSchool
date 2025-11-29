
export enum Screen {
  WELCOME = 'WELCOME',
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
}

export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserType;
  school?: string;
  grade?: number;
  classNumber?: number;
}

export interface Challenge {
  id: string;
  title: string;
  duration: string;
  reward: string;
  status: 'pending' | 'active' | 'completed';
}

export interface GrowthRecord {
  id: string;
  activityName: string;
  date: string;
  trustScore: number;
  status: 'verified' | 'pending' | 'rejected';
}

export interface ReviewItem {
  id: string;
  studentName: string;
  challengeName: string;
  submittedAt: string;
  trustScore: number;
}