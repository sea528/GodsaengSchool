
import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from './Button';
import { User, UserType } from '../types';
import { StorageService } from '../services/storage';

interface RegisterScreenProps {
  userType: UserType;
  onRegisterSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ userType, onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    schoolId: '',
    password: '',
    name: '',
    studentNumber: '', // Student only
    teacherType: 'HOMEROOM' as 'HOMEROOM' | 'SUBJECT', // Teacher only
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = () => {
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const newUser: User = {
        id: Date.now().toString(),
        schoolId: formData.schoolId,
        password: formData.password,
        name: formData.name,
        role: userType,
        profile: userType === UserType.STUDENT ? {
          studentNumber: formData.studentNumber,
          points: 0
        } : {
          teacherType: formData.teacherType
        }
      };
      
      const success = StorageService.register(newUser);
      if (success) {
        onRegisterSuccess(newUser);
      } else {
        setError('이미 해당 학교에 등록된 사용자 정보입니다.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const isValid = () => {
    if (!formData.schoolId || !formData.password || !formData.name) return false;
    if (userType === UserType.STUDENT && !formData.studentNumber) return false;
    return true;
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onSwitchToLogin} className="p-1 -ml-1 text-muted-text hover:text-text-main">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[24px] font-bold text-text-main">
          {userType === UserType.STUDENT ? '학생' : '교사'} 회원가입
        </h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {/* School Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">학교명</label>
          <input
            type="text"
            value={formData.schoolId}
            onChange={e => setFormData({...formData, schoolId: e.target.value})}
            className="w-full h-[52px] px-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary"
            placeholder="학교 이름을 입력하세요"
          />
        </div>

        {/* Common Fields */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">이름</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full h-[52px] px-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary"
            placeholder="실명을 입력하세요"
          />
        </div>

        {/* Role Specific Fields */}
        {userType === UserType.TEACHER ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main">교사 유형</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormData({...formData, teacherType: 'HOMEROOM'})}
                className={`flex-1 h-[52px] rounded-[12px] font-bold border transition-colors ${
                  formData.teacherType === 'HOMEROOM' 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-muted-text border-card-border'
                }`}
              >
                학급 담임
              </button>
              <button
                onClick={() => setFormData({...formData, teacherType: 'SUBJECT'})}
                className={`flex-1 h-[52px] rounded-[12px] font-bold border transition-colors ${
                  formData.teacherType === 'SUBJECT' 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-muted-text border-card-border'
                }`}
              >
                교과 담임
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main">학번</label>
            <input
              type="text"
              value={formData.studentNumber}
              onChange={e => setFormData({...formData, studentNumber: e.target.value})}
              className="w-full h-[52px] px-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary"
              placeholder="예: 10101"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">비밀번호</label>
          <input
            type="password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            className="w-full h-[52px] px-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary"
            placeholder="비밀번호 입력"
          />
        </div>

        {error && (
          <div className="p-3 bg-error-bg text-error-text rounded-[8px] text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Button 
          fullWidth 
          onClick={handleRegister} 
          loading={isLoading}
          disabled={!isValid()}
        >
          가입 완료
        </Button>
      </div>
    </div>
  );
};
