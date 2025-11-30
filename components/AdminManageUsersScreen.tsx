
import React, { useState, useEffect } from 'react';
import { User, UserType, StudentProfile, TeacherProfile } from '../types';
import { StorageService } from '../services/storage';
import { Button } from './Button';
import { Trash2, Upload, FileSpreadsheet, AlertCircle, ChevronLeft, RefreshCw, Users, UserCog } from 'lucide-react';

interface AdminManageUsersScreenProps {
  onBack: () => void;
  currentUser: User | null;
}

export const AdminManageUsersScreen: React.FC<AdminManageUsersScreenProps> = ({ onBack, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [uploadText, setUploadText] = useState('');
  const [parsedUsers, setParsedUsers] = useState<User[]>([]);
  const [uploadRole, setUploadRole] = useState<UserType>(UserType.STUDENT);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(StorageService.getUsers(currentUser));
  };

  const handleDeleteUser = (id: string | number) => {
    // Removed window.confirm due to potential blocking issues in some environments
    StorageService.removeUser(String(id));
    loadUsers();
    setMessage({ text: '사용자가 삭제되었습니다.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Bulk Upload Logic ---
  const handleParse = () => {
    if (!uploadText.trim()) {
      setMessage({ text: '데이터를 입력해주세요.', type: 'error' });
      return;
    }

    const rows = uploadText.trim().split('\n');
    const newUsers: User[] = [];
    let errorCount = 0;

    rows.forEach((row, index) => {
      // Split by tab or comma
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
        schoolId: currentUser?.schoolId || 'default-school', // Assign current admin's school
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
    loadUsers();
    setUploadText('');
    setParsedUsers([]);
    setMessage({ 
      text: `등록 완료: 성공 ${result.success}명, 중복(실패) ${result.fail}명`, 
      type: 'success' 
    });
    
    // Switch to list view after 1.5s
    setTimeout(() => {
        setActiveTab('list');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 -ml-1 text-muted-text hover:text-text-main">
            <ChevronLeft size={24} />
            </button>
            <h1 className="text-[20px] font-bold text-text-main">사용자 관리 ({currentUser?.schoolId})</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'list' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users size={16} /> 사용자 목록 ({users.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'upload' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileSpreadsheet size={16} /> 일괄 업로드
          </div>
        </button>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`p-3 text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'
        }`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-secondary-bg/30">
        {activeTab === 'list' ? (
          <div className="p-4 space-y-3">
             {users.length === 0 ? (
                <div className="text-center py-10 text-muted-text">등록된 사용자가 없습니다.</div>
             ) : (
                users.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-[12px] border border-card-border shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === UserType.TEACHER ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {u.role === UserType.TEACHER ? '교사' : '학생'}
                                </span>
                                <span className="font-bold text-text-main">{u.name}</span>
                            </div>
                            <div className="text-xs text-muted-text">
                                {u.role === UserType.TEACHER 
                                    ? `유형: ${(u.profile as TeacherProfile)?.teacherType === 'HOMEROOM' ? '담임' : '교과'}` 
                                    : `학번: ${(u.profile as StudentProfile)?.studentNumber}`
                                }
                            </div>
                        </div>
                        {currentUser?.id !== u.id && (
                            <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))
             )}
          </div>
        ) : (
          <div className="p-6 space-y-6 bg-white min-h-full">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setUploadRole(UserType.STUDENT); setParsedUsers([]); }}
                        className={`flex-1 py-2 rounded-[8px] text-sm font-bold border ${uploadRole === UserType.STUDENT ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}
                    >
                        학생 등록
                    </button>
                    <button 
                         onClick={() => { setUploadRole(UserType.TEACHER); setParsedUsers([]); }}
                        className={`flex-1 py-2 rounded-[8px] text-sm font-bold border ${uploadRole === UserType.TEACHER ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}
                    >
                        교사 등록
                    </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-[12px] text-sm text-blue-800">
                    <p className="font-bold mb-2 flex items-center gap-2"><AlertCircle size={16} /> 엑셀/스프레드시트 복사 붙여넣기</p>
                    <p className="mb-1">아래 형식을 맞춰 텍스트를 붙여넣으세요 (콤마 또는 탭으로 구분)</p>
                    {uploadRole === UserType.STUDENT ? (
                        <code className="block bg-white/50 p-2 rounded text-xs mt-2 font-mono">
                            이름, 학번, 비밀번호<br/>
                            홍길동, 10101, 1234<br/>
                            김철수, 10102, 1234
                        </code>
                    ) : (
                        <code className="block bg-white/50 p-2 rounded text-xs mt-2 font-mono">
                            이름, 유형(담임/교과), 비밀번호<br/>
                            김선생, 담임, pass123<br/>
                            이교과, 교과, pass123
                        </code>
                    )}
                </div>

                <textarea
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    placeholder="여기에 데이터를 붙여넣으세요..."
                    className="w-full h-[200px] p-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary text-sm font-mono"
                />

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
                        {parsedUsers.length > 0 ? `${parsedUsers.length}명 등록하기` : '등록하기'}
                    </Button>
                </div>

                {parsedUsers.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-bold text-sm mb-2">미리보기 ({parsedUsers.length}명)</h3>
                        <div className="bg-gray-50 rounded-[8px] p-2 max-h-[150px] overflow-y-auto text-xs space-y-1 border border-gray-200">
                            {parsedUsers.map((u, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="font-bold w-[60px]">{u.name}</span>
                                    <span className="text-gray-500">
                                        {u.role === UserType.STUDENT ? (u.profile as any).studentNumber : (u.profile as any).teacherType}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
