
import React, { useState } from 'react';
import { Lock, User as UserIcon, BookOpen } from 'lucide-react';
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
    name: '',
    studentNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
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
        name: formData.name, // Will be empty for students, ignored by service logic for student type
        password: formData.password,
        studentNumber: formData.studentNumber,
        type: loginType
      });

      if (user) {
        onLoginSuccess(user);
      } else {
        // Fallback for demo/testing
        if (formData.password === 'demo') {
           const demoUser: User = {
             id: Date.now().toString(),
             name: loginType === UserType.STUDENT ? '학생(데모)' : formData.name,
             role: loginType,
             password: 'demo',
             profile: loginType === UserType.STUDENT 
               ? { points: 0, studentNumber: formData.studentNumber || '24001' }
               : { teacherType: 'HOMEROOM' }
           };
           StorageService.register(demoUser);
           onLoginSuccess(demoUser);
        } else {
          setError('정보가 일치하지 않습니다. 입력을 확인해주세요.');
          setIsLoading(false);
        }
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-[24px] font-bold text-text-main">로그인</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-secondary-bg rounded-[12px] mb-8">
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
        {/* Name Input - Only for Teachers */}
        {loginType === UserType.TEACHER && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-sm font-medium text-text-main">이름</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              className="w-full h-[52px] pl-10 pr-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary transition-colors"
              placeholder="비밀번호 입력"
            />
          </div>
        </div>

        {error && <p className="text-error-text text-sm bg-error-bg p-3 rounded-[8px]">{error}</p>}
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
