
import React from 'react';
import { LayoutGrid, Target, LineChart, User as UserIcon } from 'lucide-react';
import { Screen, UserType } from '../types';

interface BottomNavProps {
  currentScreen?: Screen;
  userType?: UserType;
  onNavigate?: (screen: Screen) => void;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, userType, onNavigate, activeTab, onTabChange }) => {
  // Support for activeTab mode (from App-1)
  if (activeTab && onTabChange) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center h-[64px] z-20">
        <button 
          onClick={() => onTabChange('classes')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'classes' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutGrid size={24} strokeWidth={activeTab === 'classes' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">갓생강의</span>
        </button>

        <button 
          onClick={() => onTabChange('challenges')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'challenges' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Target size={24} strokeWidth={activeTab === 'challenges' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">갓생도전</span>
        </button>

        <button 
          onClick={() => onTabChange('growth')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'growth' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {/* Defaulting to Chart icon for growth tab if userType is unknown in this mode, or stick to generic logic */}
          <LineChart size={24} strokeWidth={activeTab === 'growth' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">성장케어</span>
        </button>
      </div>
    );
  }

  // Original Logic using Screen
  let derivedActiveTab = 'classes';
  if (currentScreen) {
    if ([Screen.CHALLENGE_INVITE, Screen.TEACHER_CHALLENGES, Screen.CREATE_CHALLENGE].includes(currentScreen)) {
      derivedActiveTab = 'challenges';
    } else if ([Screen.GROWTH_RECORD, Screen.TEACHER_DASHBOARD].includes(currentScreen)) {
      derivedActiveTab = 'growth';
    } else if ([Screen.TEACHER_CLASSES, Screen.CLASS_JOIN, Screen.DEMO_VIDEO, Screen.STUDENT_CLASS_LIST].includes(currentScreen)) {
      derivedActiveTab = 'classes';
    }
  }

  const isTeacher = userType === UserType.TEACHER;
  const safeNavigate = onNavigate || (() => {});

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center h-[64px] z-20">
      <button 
        onClick={() => safeNavigate(isTeacher ? Screen.TEACHER_CLASSES : Screen.TEACHER_CLASSES)} // Fallback logic preserved
        className={`flex flex-col items-center gap-1 transition-colors ${derivedActiveTab === 'classes' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <LayoutGrid size={24} strokeWidth={derivedActiveTab === 'classes' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">갓생강의</span>
      </button>

      <button 
        onClick={() => safeNavigate(isTeacher ? Screen.TEACHER_CHALLENGES : Screen.CHALLENGE_INVITE)}
        className={`flex flex-col items-center gap-1 transition-colors ${derivedActiveTab === 'challenges' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Target size={24} strokeWidth={derivedActiveTab === 'challenges' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">갓생도전</span>
      </button>

      <button 
        onClick={() => safeNavigate(isTeacher ? Screen.TEACHER_DASHBOARD : Screen.GROWTH_RECORD)}
        className={`flex flex-col items-center gap-1 transition-colors ${derivedActiveTab === 'growth' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
      >
        {isTeacher ? <UserIcon size={24} strokeWidth={derivedActiveTab === 'growth' ? 2.5 : 2} /> : <LineChart size={24} strokeWidth={derivedActiveTab === 'growth' ? 2.5 : 2} />}
        <span className="text-[10px] font-medium">{isTeacher ? '성장케어' : '갓성장'}</span>
      </button>
    </div>
  );
};
