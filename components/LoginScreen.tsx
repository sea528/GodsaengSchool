
import React, { useState } from 'react';
import { Lock, User as UserIcon, BookOpen, School } from 'lucide-react';
import { Button } from './Button';
import { User, UserType } from '../types';
import { StorageService } from '../services/storage';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [loginType, setLoginType] = useState<UserType>(UserType.STUDENT);
  const [formData, setFormData] = useState({
    schoolId: '',
    name: '',
    studentNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    // Admin Bypass check (heawon or haewon)
    const isSuperAdmin = (formData.name === 'heawon' || formData.name === 'haewon') && formData.password === 'tprudrh@';

    if (!formData.schoolId && !isSuperAdmin) {
      setError('학교명을 입력해주세요.');
      return;
    }

    // Teacher validation: Name + Password
    if (loginType === UserType.TEACHER) {
      if (!formData.name || !formData.password) {
        setError('이름과 비밀번호를 입력해주세요.');
        return;
      }
    }

    // Student validation: Student Number + Password
    if (loginType === UserType.STUDENT) {
      if (!formData.studentNumber || !formData.password) {
        setError('학번과 비밀번호를 입력해주세요.');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = StorageService.login({
        name: formData.name, 
        password: formData.password,
        studentNumber: formData.studentNumber,
        type: loginType,
        schoolId: formData.schoolId
      });

      if (user) {
        onLoginSuccess(user);
      } else {
         // Smart error handling: Check if they are in the wrong tab
         const wrongRoleUser = StorageService.checkWrongRole({
            name: formData.name,
            password: formData.password,
            studentNumber: formData.studentNumber,
            type: loginType,
            schoolId: formData.schoolId
         });

         if (wrongRoleUser) {
             setError(`${wrongRoleUser.role === UserType.TEACHER ? '교사' : '학생'} 계정입니다. ${wrongRoleUser.role === UserType.TEACHER ? '교사' : '학생'} 로그인 탭을 이용해주세요.`);
         } else {
             setError('학교명, 정보 또는 비밀번호가 일치하지 않습니다.');
         }
         setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-[24px] font-bold text-text-main">로그인</h1>
      </div>

      <div className="flex p-1 bg-secondary-bg rounded-[12px] mb-6">
        <button
          onClick={() => { setLoginType(UserType.STUDENT); setError(''); }}
          className={`flex-1 py-3 text-sm font-bold rounded-[8px] transition-all ${
            loginType === UserType.STUDENT 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-muted-text hover:text-text-main'
          }`}
        >
          학생 로그인
        </button>
        <button
          onClick={() => { setLoginType(UserType.TEACHER); setError(''); }}
          className={`flex-1 py-3 text-sm font-bold rounded-[8px] transition-all ${
            loginType === UserType.TEACHER 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-muted-text hover:text-text-main'
          }`}
        >
          교사 로그인
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {/* School Name Input (Common) */}
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-sm font-medium text-text-main">학교명</label>
          <div className="relative">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
            <input
              type="text"
              value={formData.schoolId}
              onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full h-[52px] pl-10 pr-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary transition-colors"
              placeholder="학교 이름을 입력하세요 (예: 갓생고)"
            />
          </div>
        </div>

        {/* Name Input - Only for Teachers */}
        {loginType === UserType.TEACHER && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-sm font-medium text-text-main">이름 (ID)</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full h-[52px] pl-10 pr-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary transition-colors"
                placeholder="이름 입력"
              />
            </div>
          </div>
        )}

        {/* Student Number Input - Only for Students */}
        {loginType === UserType.STUDENT && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-sm font-medium text-text-main">학번</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
              <input
                type="text"
                value={formData.studentNumber}
                onChange={(e) => setFormData({...formData, studentNumber: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full h-[52px] pl-10 pr-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary transition-colors"
                placeholder="학번 입력 (예: 10101)"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">비밀번호</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full h-[52px] pl-10 pr-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary transition-colors"
              placeholder="비밀번호 입력"
            />
          </div>
        </div>

        {error && <p className="text-error-text text-sm bg-error-bg p-3 rounded-[8px] animate-pulse">{error}</p>}
      </div>

      <div className="mt-auto space-y-4">
        <Button fullWidth onClick={handleLogin} loading={isLoading}>
          로그인
        </Button>
        <div className="text-center">
          <span className="text-sm text-muted-text mr-2">계정이 없으신가요?</span>
          <Button variant="link" onClick={onSwitchToRegister}>회원가입</Button>
        </div>
      </div>
    </div>
  );
};
