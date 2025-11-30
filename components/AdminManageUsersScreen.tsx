
import React, { useState, useEffect } from 'react';
import { User, UserType, StudentProfile, TeacherProfile } from '../types';
import { StorageService } from '../services/storage';
import { Button } from './Button';
import { Trash2, Upload, FileSpreadsheet, AlertCircle, ChevronLeft, RefreshCw, Users, ShieldCheck, School } from 'lucide-react';

interface AdminManageUsersScreenProps {
  onBack: () => void;
  currentUser: User | null;
}

export const AdminManageUsersScreen: React.FC<AdminManageUsersScreenProps> = ({ onBack, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'admin'>('list');
  const [users, setUsers] = useState<User[]>([]);
  const [targetSchoolId, setTargetSchoolId] = useState(currentUser?.schoolId || '');
  
  // Bulk Upload States
  const [uploadText, setUploadText] = useState('');
  const [parsedUsers, setParsedUsers] = useState<User[]>([]);
  const [uploadRole, setUploadRole] = useState<UserType>(UserType.STUDENT);
  
  // School Admin Creation States
  const [adminSchoolName, setAdminSchoolName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const isSuperAdmin = currentUser?.name === 'heawon' || currentUser?.name === 'haewon';

  useEffect(() => {
    loadUsers();
  }, [targetSchoolId]); // Reload when target school changes

  const loadUsers = () => {
    setUsers(StorageService.getUsers(currentUser, targetSchoolId));
  };

  const handleDeleteUser = (id: string | number) => {
    StorageService.removeUser(String(id));
    loadUsers();
    setMessage({ text: '사용자가 삭제되었습니다.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Bulk Upload Logic ---
  const handleParse = () => {
    if (!targetSchoolId.trim()) {
      setMessage({ text: '관리 대상 학교명을 먼저 입력해주세요.', type: 'error' });
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
      if (cols.length < 3) return;

      const [name, info, password] = cols;
      if (!name || !info || !password) return;

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
      setMessage({ text: '유효한 데이터가 없습니다.', type: 'error' });
    } else {
      setMessage({ text: `${newUsers.length}명 데이터를 확인했습니다.`, type: 'success' });
    }
  };

  const handleRegister = () => {
    if (parsedUsers.length === 0) return;
    const result = StorageService.bulkRegister(parsedUsers);
    loadUsers();
    setUploadText('');
    setParsedUsers([]);
    setMessage({ text: `등록 완료: 성공 ${result.success}명, 중복(실패) ${result.fail}명`, type: 'success' });
    setTimeout(() => setActiveTab('list'), 1500);
  };

  // --- School Admin Creation Logic (Super Admin Only) ---
  const handleCreateSchoolAdmin = () => {
    if (!adminSchoolName || !adminId || !adminPassword) {
      setMessage({ text: '모든 정보를 입력해주세요.', type: 'error' });
      return;
    }

    // Check if admin already exists for this school
    if (StorageService.hasSchoolAdmin(adminSchoolName)) {
      setMessage({ text: `[${adminSchoolName}]에는 이미 학교 관리자가 존재합니다. (1학교 1관리자)`, type: 'error' });
      return;
    }

    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      schoolId: adminSchoolName,
      name: adminId,
      password: adminPassword,
      role: UserType.TEACHER,
      isAdmin: true, // Key Flag
      profile: { teacherType: 'HOMEROOM' }
    };

    const success = StorageService.register(newAdmin);
    if (success) {
      setMessage({ text: `[${adminSchoolName}] 관리자(${adminId})가 생성되었습니다.`, type: 'success' });
      setAdminSchoolName('');
      setAdminId('');
      setAdminPassword('');
      loadUsers(); // Refresh list to maybe see the new admin if filter allows
    } else {
      setMessage({ text: '관리자 생성 실패 (중복된 ID 등).', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex flex-col gap-2 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 -ml-1 text-muted-text hover:text-text-main">
            <ChevronLeft size={24} />
            </button>
            <h1 className="text-[20px] font-bold text-text-main">
               {isSuperAdmin ? '시스템 관리자 모드' : `학교 관리자 (${currentUser?.schoolId})`}
            </h1>
        </div>
        
        {/* School Filter for Super Admin */}
        {isSuperAdmin && (
          <div className="relative">
             <School className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={16} />
             <input 
                type="text" 
                value={targetSchoolId}
                onChange={(e) => setTargetSchoolId(e.target.value)}
                placeholder="관리 대상 학교명 입력..."
                className="w-full pl-9 pr-3 py-2 border border-card-border rounded-[8px] text-sm focus:border-primary outline-none"
             />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('list')} className={`flex-1 min-w-[100px] py-3 text-sm font-bold whitespace-nowrap ${activeTab === 'list' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}>
          <Users size={16} className="inline mr-1" /> 목록
        </button>
        <button onClick={() => setActiveTab('upload')} className={`flex-1 min-w-[100px] py-3 text-sm font-bold whitespace-nowrap ${activeTab === 'upload' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}>
          <FileSpreadsheet size={16} className="inline mr-1" /> 일괄등록
        </button>
        {isSuperAdmin && (
          <button onClick={() => setActiveTab('admin')} className={`flex-1 min-w-[100px] py-3 text-sm font-bold whitespace-nowrap ${activeTab === 'admin' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}>
            <ShieldCheck size={16} className="inline mr-1" /> 관리자 생성
          </button>
        )}
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`p-3 text-sm font-bold text-center ${message.type === 'success' ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'}`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-secondary-bg/30">
        {activeTab === 'list' && (
          <div className="p-4 space-y-3">
             {users.length === 0 ? <div className="text-center py-10 text-muted-text">사용자가 없습니다.</div> : (
                users.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-[12px] border border-card-border shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {u.isAdmin && <ShieldCheck size={14} className="text-primary" />}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === UserType.TEACHER ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {u.role === UserType.TEACHER ? (u.isAdmin ? '관리자' : '교사') : '학생'}
                                </span>
                                <span className="font-bold text-text-main">{u.name}</span>
                            </div>
                            <div className="text-xs text-muted-text">
                                {u.role === UserType.TEACHER 
                                    ? `ID: ${u.name}` 
                                    : `학번: ${(u.profile as StudentProfile)?.studentNumber}`
                                }
                                {isSuperAdmin && <span className="ml-2 text-gray-400">({u.schoolId})</span>}
                            </div>
                        </div>
                        {currentUser?.id !== u.id && (
                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))
             )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="p-6 space-y-6 bg-white min-h-full">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button onClick={() => { setUploadRole(UserType.STUDENT); setParsedUsers([]); }} className={`flex-1 py-2 rounded-[8px] text-sm font-bold border ${uploadRole === UserType.STUDENT ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}>학생</button>
                    <button onClick={() => { setUploadRole(UserType.TEACHER); setParsedUsers([]); }} className={`flex-1 py-2 rounded-[8px] text-sm font-bold border ${uploadRole === UserType.TEACHER ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}>교사</button>
                </div>
                <div className="bg-blue-50 p-4 rounded-[12px] text-sm text-blue-800">
                    <p className="font-bold mb-2 flex items-center gap-2"><AlertCircle size={16} /> 데이터 형식 (콤마/탭 구분)</p>
                    {uploadRole === UserType.STUDENT ? (
                        <code className="block bg-white/50 p-2 rounded text-xs mt-2 font-mono">이름, 학번, 비밀번호</code>
                    ) : (
                        <code className="block bg-white/50 p-2 rounded text-xs mt-2 font-mono">이름, 유형(담임/교과), 비밀번호</code>
                    )}
                </div>
                <textarea value={uploadText} onChange={(e) => setUploadText(e.target.value)} placeholder="데이터 붙여넣기..." className="w-full h-[150px] p-4 border border-card-border rounded-[12px] focus:outline-none focus:border-primary text-sm font-mono" />
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleParse} className="flex-1" icon={<RefreshCw size={18} />}>확인</Button>
                    <Button onClick={handleRegister} className="flex-1" disabled={parsedUsers.length === 0} icon={<Upload size={18} />}>등록</Button>
                </div>
            </div>
          </div>
        )}

        {/* School Admin Creation Tab (Only visible to Super Admin) */}
        {activeTab === 'admin' && isSuperAdmin && (
          <div className="p-6 space-y-6 bg-white min-h-full">
             <div className="bg-orange-50 p-4 rounded-[12px] text-sm text-orange-800 mb-6">
                <p className="font-bold mb-2 flex items-center gap-2"><ShieldCheck size={16} /> 학교 최종 관리자 등록</p>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                   <li>학교마다 <strong>단 1명</strong>의 관리자만 등록 가능합니다.</li>
                   <li>해당 관리자는 본인 학교의 학생/교사만 관리할 수 있습니다.</li>
                   <li>다른 학교의 정보는 절대 볼 수 없습니다.</li>
                </ul>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-text-main">학교명</label>
                   <input 
                      type="text" 
                      value={adminSchoolName} 
                      onChange={(e) => setAdminSchoolName(e.target.value)} 
                      placeholder="예: 서울고등학교"
                      className="w-full h-[48px] px-4 border border-card-border rounded-[12px] focus:border-primary outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-text-main">관리자 ID</label>
                   <input 
                      type="text" 
                      value={adminId} 
                      onChange={(e) => setAdminId(e.target.value)} 
                      placeholder="예: admin_seoul"
                      className="w-full h-[48px] px-4 border border-card-border rounded-[12px] focus:border-primary outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-text-main">비밀번호</label>
                   <input 
                      type="text" 
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)} 
                      placeholder="비밀번호"
                      className="w-full h-[48px] px-4 border border-card-border rounded-[12px] focus:border-primary outline-none"
                   />
                </div>
                
                <Button onClick={handleCreateSchoolAdmin} fullWidth className="mt-4" icon={<ShieldCheck size={18} />}>
                   학교 관리자 생성
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
