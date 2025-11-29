import { PointReason, Student } from './types';

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Liam Johnson', points: 15, avatarSeed: '1' },
  { id: '2', name: 'Emma Smith', points: 24, avatarSeed: '2' },
  { id: '3', name: 'Noah Williams', points: 8, avatarSeed: '3' },
  { id: '4', name: 'Olivia Brown', points: 30, avatarSeed: '4' },
  { id: '5', name: 'Ava Jones', points: 12, avatarSeed: '5' },
  { id: '6', name: 'Isabella Garcia', points: 18, avatarSeed: '6' },
];

export const POSITIVE_REASONS: PointReason[] = [
  { id: 'p1', label: 'Participation', value: 1, icon: 'Hand', color: 'bg-green-100 text-green-700' },
  { id: 'p2', label: 'Teamwork', value: 2, icon: 'Users', color: 'bg-blue-100 text-blue-700' },
  { id: 'p3', label: 'Completed Homework', value: 3, icon: 'BookOpen', color: 'bg-purple-100 text-purple-700' },
  { id: 'p4', label: 'Helping Others', value: 5, icon: 'Heart', color: 'bg-pink-100 text-pink-700' },
];

export const NEGATIVE_REASONS: PointReason[] = [
  { id: 'n1', label: 'Disruption', value: -1, icon: 'Megaphone', color: 'bg-orange-100 text-orange-700' },
  { id: 'n2', label: 'Late', value: -1, icon: 'Clock', color: 'bg-red-100 text-red-700' },
  { id: 'n3', label: 'No Homework', value: -2, icon: 'FileWarning', color: 'bg-gray-100 text-gray-700' },
];
