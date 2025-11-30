
import React, { useState } from 'react';
import { UserType, User, StudentProfile, TeacherProfile } from '../types';
import { StorageService } from '../services/storage';
import { Button } from './Button';
import { ChevronLeft, Upload, RefreshCw, FileSpreadsheet, AlertCircle, Lock, School } from 'lucide-react';

interface BulkUploadScreenProps {
  onBack: () => void;
}

export const BulkUploadScreen: React.FC<BulkUploadScreenProps> = ({ onBack }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  // Upload State
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [uploadRole, setUploadRole] = useState<UserType>(UserType.STUDENT);
  const [uploadText, setUploadText] = useState('');
  const [parsedUsers, setParsedUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleAdminLogin = () => {
    const normalizedId = adminName.trim();
    // Allow both 'heawon' (requested) and 'haewon' (previous) to prevent confusion
    if ((normalizedId === 'heawon' || normalizedId === 'haewon') && adminPass === 'tprudrh@') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('관리자 정보가 일치하지 않습니다.');
    }
  };

  const handleParse = () => {
    if (!targetSchoolId.trim()) {
      setMessage({ text: '학교명을 먼저 입력해주세요.', type: 'error' });
      return;
    }
    if (!uploadText.trim()) {
      setMessage({ text: '데이터를 입력해주세요.', type: 'error' });
      return;
    }

    const rows = uploadText.trim().split('\n');
    const newUsers: User[] = [];
    let errorCount = 0;

    rows.forEach((row, index) => {
      const cols = row.split(/,|\t/).map(c => c.trim());
      
      // Basic validation: needs at least 3 columns
      if (cols.length < 3) {
        errorCount++;
        return;
      }

      const [name, info, password] = cols;
      if (!name || !info || !password) {
        errorCount++;
        return;
      }

      const newUser: User = {
        id: `bulk-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        schoolId: targetSchoolId,
        name: name,
        password: password,
        role: uploadRole,
        profile: uploadRole === UserType.STUDENT 
          ? { studentNumber: info, points: 0 } as StudentProfile
          : { teacherType: (info === '담임' || info === 'HOMEROOM') ? 'HOMEROOM' : 'SUBJECT' } as TeacherProfile
      };
      
      newUsers.push(newUser);
    });

    setParsedUsers(newUsers);
    if (newUsers.length === 0) {
      setMessage({ text: '유효한 데이터가 없습니다. 형식을 확인해주세요.', type: 'error' });
    } else {
      setMessage({ text: `${newUsers.length}명 데이터를 확인했습니다. 등록 버튼을 눌러주세요.`, type: 'success' });
    }
  };

  const handleRegister = () => {
    if (parsedUsers.length === 0) return;

    const result = StorageService.bulkRegister(parsedUsers);
    setUploadText('');
    setParsedUsers([]);
    setMessage({ 
      text: `등록 완료: 성공 ${result.success}명, 중복(실패) ${result.fail}명`, 
      type: 'success' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full p-6 bg-white">
        <div className="flex items-center gap-2 mb-8">
          <button onClick={onBack} className="p-1 -ml-1 text-muted-text hover:text-text-main">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[24px] font-bold text-text-main">관리자 인증</h1>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-gray-400" />
            </div>
            <p className="text-text-main font-medium">관리자 계정으로 로그인하세요</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main">관리자 ID</label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="w-full h-[52px] px-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary"
              placeholder="heawon"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main">비밀번호</label>
            <input
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="w-full h-[52px] px-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary"
            />
          </div>
          
          {authError && <p className="text-error-text text-sm text-center animate-pulse">{authError}</p>}
          
          <Button fullWidth onClick={handleAdminLogin}>인증하기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white z-10">
        <button onClick={onBack} className="p-1 -ml-1 text-muted-text hover:text-text-main">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold text-text-main">사용자 일괄 등록</h1>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* School ID Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main flex items-center gap-2">
            <School size={16} /> 대상 학교명
          </label>
          <input
            type="text"
            value={targetSchoolId}
            onChange={(e) => setTargetSchoolId(e.target.value)}
            placeholder="예: 갓생고등학교"
            className="w-full h-[48px] px-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary bg-secondary-bg/20"
          />
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2">
            <button 
                onClick={() => { setUploadRole(UserType.STUDENT); setParsedUsers([]); setMessage(null); }}
                className={`flex-1 py-2 rounded-[8px] text-sm font-bold border transition-colors ${uploadRole === UserType.STUDENT ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}
            >
                학생 등록
            </button>
            <button 
                  onClick={() => { setUploadRole(UserType.TEACHER); setParsedUsers([]); setMessage(null); }}
                className={`flex-1 py-2 rounded-[8px] text-sm font-bold border transition-colors ${uploadRole === UserType.TEACHER ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}
            >
                교사 등록
            </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-[12px] text-sm text-blue-800">
            <p className="font-bold mb-2 flex items-center gap-2"><AlertCircle size={16} /> 형식 안내</p>
            <p className="mb-1">아래 형식을 맞춰 텍스트를 붙여넣으세요 (콤마/탭 구분)</p>
            {uploadRole === UserType.STUDENT ? (
                <code className="block bg-white/50 p-2 rounded text-xs mt-2 font-mono">
                    이름, 학번, 비밀번호<br/>
                    홍길동, 10101, 1234
                </code>
            ) : (
                <code className="block bg-white/50 p-2 rounded text-xs mt-2 font-mono">
                    이름, 유형(담임/교과), 비밀번호<br/>
                    김선생, 담임, pass123
                </code>
            )}
        </div>

        <textarea
            value={uploadText}
            onChange={(e) => setUploadText(e.target.value)}
            placeholder="여기에 데이터를 붙여넣으세요..."
            className="w-full h-[150px] p-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary text-sm font-mono"
        />

        {message && (
          <div className={`p-3 rounded-[8px] text-sm font-bold ${message.type === 'success' ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3">
            <Button variant="secondary" onClick={handleParse} className="flex-1" icon={<RefreshCw size={18} />}>
                데이터 확인
            </Button>
            <Button 
                onClick={handleRegister} 
                className="flex-1" 
                disabled={parsedUsers.length === 0}
                icon={<Upload size={18} />}
            >
                {parsedUsers.length > 0 ? `${parsedUsers.length}명 등록` : '등록하기'}
            </Button>
        </div>
      </div>
    </div>
  );
};
