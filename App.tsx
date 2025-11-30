
import React, { useState, useEffect, useRef } from 'react';
import { Screen, UserType, User } from './types';
import { Button } from './components/Button';
import { Toast } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { AdminManageUsersScreen } from './components/AdminManageUsersScreen';
import { BulkUploadScreen } from './components/BulkUploadScreen';
import { StorageService } from './services/storage';
import { generateClassThumbnail, analyzeComment, verifyChallengeImage } from './services/geminiService';
import { Play, Pause, RotateCcw, Upload, Camera, FileText, ChevronRight, CheckCircle, Clock, AlertTriangle, Target, AlertCircle, Plus, Video, Image, Film, File, FileSpreadsheet, Coins, Award, Loader2, Sparkles, Users, BookOpen, Link as LinkIcon, LogOut, Filter, ExternalLink, Copy, RefreshCw, ChevronDown, PlayCircle, Smartphone, Monitor, Trash2, Settings } from 'lucide-react';

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const getChallengeDurationDays = (durationStr: string): number => {
  if (durationStr.includes('1주일')) return 7;
  if (durationStr.includes('2주일')) return 14;
  if (durationStr.includes('한달')) return 30;
  return 7; // Default
};

// --- Screens Components ---

// 1. Welcome Screen
const WelcomeScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col h-full p-6 bg-white">
    <div className="flex-1 flex flex-col justify-center">
      <h1 className="text-[28px] font-bold text-text-main leading-[36px] mb-4" aria-label="페이지 주요 제목">
        갓생스쿨에 오신 것을<br />환영합니다
      </h1>
      <p className="text-[15px] text-text-main leading-[22px] mb-8" aria-label="설명 텍스트">
        작은 습관이 큰 성장을 만듭니다.<br />
        3분 갓생강의와 갓생도전으로 오늘의<br />
        한 걸음을 시작하세요.
      </p>
    </div>
    <div className="flex flex-col gap-3 mb-8">
      <Button onClick={onNext} aria-label="주요 작업 시작">시작하기</Button>
    </div>
  </div>
);

// Account Selection Screen
const AccountSelectionScreen = ({ onSelect, onBulkUpload }: { onSelect: (type: UserType) => void, onBulkUpload: () => void }) => (
  <div className="flex flex-col h-full p-6 bg-white">
    <h1 className="text-[28px] font-bold text-text-main leading-[36px] mb-8">
      계정 유형을<br />선택하세요
    </h1>
    <div className="flex flex-col gap-4">
      <button onClick={() => onSelect(UserType.STUDENT)} className="w-full p-5 text-left rounded-[12px] border-2 border-card-border bg-white text-text-main hover:border-primary/50 transition-all font-bold">
        학생으로 가입하기
      </button>
      <button onClick={() => onSelect(UserType.TEACHER)} className="w-full p-5 text-left rounded-[12px] border-2 border-card-border bg-white text-text-main hover:border-primary/50 transition-all font-bold">
        교사로 가입하기
      </button>
    </div>
    <div className="mt-auto text-center">
         <Button variant="link" onClick={onBulkUpload} className="text-xs text-muted-text">관리자 / 일괄 등록</Button>
    </div>
  </div>
);

// 3. Class Join Screen
const ClassJoinScreen = ({ onJoin, onCreate, userType }: { onJoin: (code: string) => void, onCreate: () => void, userType: UserType }) => {
  const [inputCode, setInputCode] = useState('');

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <h1 className="text-[28px] font-bold text-text-main leading-[36px] mb-8">
        반에 참여하거나<br />새 반을 만드세요
      </h1>

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-[14px] text-muted-text">초대 코드 입력</label>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder="초대 코드를 입력하세요 (예: START)"
          className="h-[44px] px-3 border border-[#E0E6F0] rounded-[6px] focus:outline-none focus:border-primary w-full tracking-widest uppercase font-bold text-primary"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => onJoin(inputCode)}
          disabled={!inputCode && userType !== UserType.TEACHER}
          className={!inputCode && userType !== UserType.TEACHER ? "opacity-50" : ""}
        >
          참여하기
        </Button>
        {userType === UserType.TEACHER && (
          <Button variant="secondary" onClick={onCreate}>반 생성하기</Button>
        )}
      </div>
    </div>
  );
};

// 3.1 Create Class Screen
const CreateClassScreen = ({ onSubmit }: { onSubmit: (classInfo: { name: string, subject: string, code: string }) => void }) => {
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('1학년');
  const [subject, setSubject] = useState('국어');

  const handleSubmit = () => {
    if (!className) return;
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    onSubmit({
      name: className,
      subject: `${grade} ${subject}`,
      code: code
    });
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <h1 className="text-[28px] font-bold text-text-main leading-[36px] mb-8">
        새로운 반을<br />만들어보세요
      </h1>

      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-[14px] text-muted-text font-medium">반 이름</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="예: 3학년 2반, 방과후 독서반"
            className="h-[48px] px-4 border border-[#E0E6F0] rounded-[8px] focus:outline-none focus:border-primary w-full text-[16px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[14px] text-muted-text font-medium">학년</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-[48px] px-3 border border-[#E0E6F0] rounded-[8px] focus:outline-none focus:border-primary w-full bg-white"
            >
              {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={`${g}학년`}>{g}학년</option>)}
              <option value="중등">중등</option>
              <option value="고등">고등</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[14px] text-muted-text font-medium">과목/분야</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 국어"
              className="h-[48px] px-4 border border-[#E0E6F0] rounded-[8px] focus:outline-none focus:border-primary w-full"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!className} className={!className ? "opacity-50" : ""} >
        반 만들기
      </Button>
    </div>
  );
};

// ... StudentClassListScreen, DemoVideoScreen, CommentPracticeScreen ...
const StudentClassListScreen = ({ classes, onSelectClass, onLogout, studentClassInfo }: { classes: any[], onSelectClass: (item: any) => void, onLogout: () => void, studentClassInfo?: any | null }) => {
    return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-[20px] font-bold text-text-main">수강 가능한 갓생강의</h1>
          {studentClassInfo && (
            <p className="text-xs text-primary font-medium mt-1">
              소속: {studentClassInfo.name} ({studentClassInfo.subject})
            </p>
          )}
        </div>
        <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors p-1" aria-label="로그아웃">
          <LogOut size={20} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-text">
            <Video size={48} className="mb-4 opacity-20" />
            <p>등록된 갓생강의가 없습니다.</p>
          </div>
        ) : (
          classes.map(c => (
            <div
              key={c.id}
              onClick={() => onSelectClass(c)}
              className="flex gap-4 p-3 border border-gray-100 rounded-[12px] shadow-sm cursor-pointer hover:border-primary transition-colors bg-white overflow-hidden"
            >
              <div className="w-[120px] h-[68px] bg-gray-200 rounded-[8px] flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <>
                    {c.type === 'video' ? <Video className="text-gray-400" /> : <LinkIcon className="text-gray-400" />}
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                      <Play size={20} className="text-white fill-white opacity-80" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1 line-clamp-2">{c.title}</h3>
                <p className="text-xs text-muted-text mb-1">{c.date}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-secondary-bg text-primary px-1.5 py-0.5 rounded font-medium">
                    {c.type === 'video' ? '영상' : '링크'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const DemoVideoScreen = ({ classItem, onFinish, onBack }: { classItem: any | null, onFinish: () => void, onBack: () => void }) => {
    const [videoError, setVideoError] = useState(false);
  
  const title = classItem?.title || "데모 갓생강의 보기";
  const description = classItem?.description || "짧은 강의를 보고 댓글로 요약을 남겨 보세요. 자동으로 배지를 드립니다.";

  const openExternalLink = () => {
    if (classItem?.url) {
      window.open(classItem.url, '_blank');
    }
  };

  const isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isDirectVideoFile = () => {
    const url = classItem?.url?.toLowerCase() || '';
    return classItem?.type === 'video' || 
           /\.(mp4|mov|avi|wmv|flv|webm|ts|mts|m2ts|mkv|3gp|ogv)$/i.test(url);
  };

  const isBrowserSupportedFormat = () => {
    const url = classItem?.url?.toLowerCase() || '';
    return /\.(mp4|webm|ogv|mov)$/i.test(url);
  };

  useEffect(() => {
    if (classItem?.url && !isYouTube(classItem.url) && !isBrowserSupportedFormat() && isDirectVideoFile()) {
        setVideoError(true);
    }
  }, [classItem]);

  const renderPlayer = () => {
      if (classItem?.url && isYouTube(classItem.url)) {
          return (
            <div 
              onClick={openExternalLink}
              className="w-full h-full bg-black relative group cursor-pointer flex flex-col items-center justify-center"
            >
              <img 
                src={classItem.thumbnail || `https://img.youtube.com/vi/${classItem.url.split('v=')[1]?.split('&')[0] || ''}/mqdefault.jpg`} 
                alt="Thumbnail" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Video'; }}
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-10 flex flex-col items-center animate-in zoom-in fade-in duration-300">
                 <PlayCircle size={64} className="text-red-600 fill-white mb-3 drop-shadow-lg transform transition-transform group-hover:scale-110" />
                 <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2 border border-white/20">
                   <ExternalLink size={16} />
                   YouTube에서 재생
                 </div>
              </div>
            </div>
          );
      }

      if (isDirectVideoFile() && !videoError) {
        return (
          <video
            src={classItem.url || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'} 
            controls
            autoPlay
            playsInline
            className="w-full h-full bg-black object-contain"
            onError={() => setVideoError(true)}
          />
        );
      }
      
      return (
        <div 
          onClick={openExternalLink}
          className="w-full h-full bg-slate-900 relative group cursor-pointer flex flex-col items-center justify-center text-center p-6"
        >
          {classItem?.thumbnail && (
            <>
              <img src={classItem.thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
            </>
          )}
          
          <div className="relative z-10 flex flex-col items-center animate-in zoom-in fade-in duration-300">
             <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary">
                    <Smartphone size={32} className="text-white" />
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary">
                    <Monitor size={32} className="text-white" />
                </div>
             </div>
             
             <h3 className="text-white text-lg font-bold mb-2">외부 플레이어에서 재생</h3>
             <p className="text-gray-300 text-xs mb-4 max-w-[240px]">
               지원되지 않는 포맷(AVI, WMV 등)이거나<br/>코덱 문제입니다. 기기 자체 플레이어로 재생합니다.
             </p>

             <div className="bg-primary hover:bg-primary-hover transition-colors px-6 py-3 rounded-full text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/30">
               <Play size={18} fill="currentColor" />
               동영상 열기
             </div>
          </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronRight className="rotate-180 text-text-main" />
        </button>
        <h1 className="text-[16px] font-bold text-text-main">영상 재생</h1>
      </div>

      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-gray-100 shadow-inner">
        {renderPlayer()}
      </div>

      <div className="p-6 pb-2">
        <h1 className="text-[20px] font-bold text-text-main mb-2">{title}</h1>
        <p className="text-[15px] text-text-main line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="p-6 mt-auto">
        <Button fullWidth onClick={onFinish}>
          시청 완료 → 댓글 작성 연습으로 이동
        </Button>
      </div>
    </div>
  );
};

const CommentPracticeScreen = ({ onSubmit }: { onSubmit: (score: number, message: string) => void }) => {
    const [type, setType] = useState('question');
  const [comment, setComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCommentSubmit = async () => {
    setIsAnalyzing(true);
    const result = await analyzeComment(comment);
    setIsAnalyzing(false);

    let message = "";
    if (!result.isValid) {
        message = `AI 분석: ${result.reason || "내용이 부적절하거나 너무 짧습니다."} (1점)`;
        onSubmit(1, message);
    } else {
        message = `AI 분석: ${result.reason || "좋은 생각입니다!"} (${result.score}점)`;
        onSubmit(result.score, message);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white relative">
      <h1 className="text-[20px] font-bold text-text-main mb-6">댓글 유형을 선택해 보세요</h1>
      <div className="flex gap-3 mb-6" role="radiogroup" aria-label="댓글 유형 선택">
        {['질문', '느낀 점'].map((opt) => {
          const id = opt === '질문' ? 'question' : 'feeling';
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={type === id}
              onClick={() => setType(id)}
              disabled={isAnalyzing}
              className={`px-4 py-2 rounded-full text-[14px] border ${type === id
                ? 'bg-secondary-bg border-primary text-primary font-semibold'
                : 'border-gray-200 text-muted-text'
                }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      <div className="flex-1">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isAnalyzing}
          placeholder="20자 이상 작성 시 AI가 분석하여 점수를 부여합니다."
          className="w-full h-[120px] p-4 border border-[#E0E6F0] rounded-[8px] resize-none focus:outline-none focus:border-primary text-[15px] disabled:bg-gray-50"
          maxLength={100}
        />
        <div className={`mt-2 text-right text-[12px] font-medium transition-colors ${comment.length >= 20 ? 'text-primary' : 'text-muted-text'}`}>
          {comment.length}/20자 (목표)
        </div>
      </div>
      <div className="mt-auto">
        <Button
          fullWidth
          onClick={handleCommentSubmit}
          disabled={isAnalyzing}
          className={isAnalyzing ? "opacity-80 cursor-wait" : ""}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>AI 분석 중...</span>
            </div>
          ) : (
            "제출하기"
          )}
        </Button>
      </div>
    </div>
  );
};

// ... Teacher Components ...
const TeacherClassListScreen = ({ onUpload, classes, onLogout, onDelete, onAdmin, currentUser }: { onUpload: () => void, classes: any[], onLogout: () => void, onDelete: (id: string) => void, onAdmin: () => void, currentUser: User | null }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-[20px] font-bold text-text-main">갓생강의</h1>
           <p className="text-xs text-primary mt-1 font-medium">{currentUser?.schoolId} ({currentUser?.name})</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="icon" onClick={onUpload} aria-label="클래스 업로드">
            <Plus size={24} className="text-primary" />
          </Button>
          {/* Admin Button - ONLY visible for haewon */}
          {currentUser?.name === 'haewon' && (
            <Button variant="icon" onClick={onAdmin} aria-label="사용자 관리">
              <Settings size={24} className="text-muted-text hover:text-primary" />
            </Button>
          )}
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors ml-2" aria-label="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-text text-sm">등록된 갓생강의가 없습니다.</div>
        ) : (
          classes.map(c => (
            <div key={c.id} className="flex gap-4 p-3 border border-gray-100 rounded-[12px] shadow-sm overflow-hidden group">
              <div className="w-[120px] h-[68px] bg-gray-200 rounded-[8px] flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <Video className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1 line-clamp-2">{c.title}</h3>
                <p className="text-xs text-muted-text">{c.date}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors self-center mr-1"
                aria-label="강의 삭제"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const UploadClassScreen = ({ onSubmit, onCancel }: { onSubmit: (data: { title: string, type: 'video' | 'link', url?: string, thumbnail?: string }) => void, onCancel: () => void }) => {
    const [title, setTitle] = useState('');
    const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
    const [url, setUrl] = useState('');
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateThumbnail = async () => {
        if (!title) return;
        setIsGeneratingThumbnail(true);
        const generatedImage = await generateClassThumbnail(title);
        if (generatedImage) {
        setThumbnail(generatedImage);
        }
        setIsGeneratingThumbnail(false);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
           const file = e.target.files[0];
           setSelectedFileName(file.name);
           const objectUrl = URL.createObjectURL(file);
           setUrl(objectUrl);
           if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
    };
    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto">
        <div className="p-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10"><h1 className="text-[24px] font-bold text-text-main">새 갓생강의 업로드</h1></div>
        <div className="p-6 space-y-6">
            <div className="space-y-2"><label className="text-sm font-medium text-text-main">제목</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="강의 제목을 입력하세요" className="w-full h-[44px] px-3 border border-card-border rounded-[8px] outline-none focus:border-primary" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-text-main">업로드 방식</label><div className="flex gap-2 p-1 bg-secondary-bg rounded-[12px]"><button onClick={() => setUploadType('file')} className={`flex-1 py-2.5 rounded-[8px] text-sm font-bold transition-all ${uploadType === 'file' ? 'bg-white text-primary shadow-sm' : 'text-muted-text hover:text-text-main'}`}>파일 업로드</button><button onClick={() => setUploadType('link')} className={`flex-1 py-2.5 rounded-[8px] text-sm font-bold transition-all ${uploadType === 'link' ? 'bg-white text-primary shadow-sm' : 'text-muted-text hover:text-text-main'}`}>링크 공유</button></div></div>
            {uploadType === 'file' ? (<><input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} /><div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-card-border rounded-[12px] bg-secondary-bg/30 h-[120px] flex flex-col items-center justify-center text-muted-text cursor-pointer hover:bg-secondary-bg/50 transition-colors"><Video size={32} className="mb-2 opacity-50" /><span className="text-sm font-medium">{selectedFileName || "클릭하여 영상 파일 선택"}</span>{selectedFileName && <span className="text-xs text-primary mt-1">파일이 선택되었습니다</span>}</div></>) : (<div className="space-y-2"><label className="text-sm font-medium text-text-main">링크 주소</label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={18} /><input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube 등 영상 링크 입력" className="w-full h-[44px] pl-10 pr-3 border border-card-border rounded-[8px] outline-none focus:border-primary" /></div></div>)}
            <div className="space-y-2 pt-4 border-t border-gray-100"><label className="text-sm font-medium text-text-main flex items-center justify-between"><span>강의 썸네일</span><span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">AI 추천</span></label>{thumbnail ? (<div className="relative w-full aspect-video rounded-[12px] overflow-hidden border border-card-border group"><img src={thumbnail} alt="Generated Thumbnail" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={handleGenerateThumbnail} className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors"><RefreshCw size={16} /> 다시 생성</button></div></div>) : (<div className="bg-secondary-bg/30 rounded-[12px] p-6 text-center border border-card-border"><div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary"><Sparkles size={24} /></div><p className="text-sm text-text-main font-medium mb-1">AI 썸네일 만들기</p><p className="text-xs text-muted-text mb-4">강의 제목을 분석하여 어울리는 이미지를 만들어드려요.</p><Button onClick={handleGenerateThumbnail} disabled={!title || isGeneratingThumbnail} variant="secondary" className="h-[40px] text-sm bg-white border border-card-border shadow-sm hover:border-primary">{isGeneratingThumbnail ? (<><Loader2 className="animate-spin mr-2" size={16} /> 생성 중...</>) : ("AI로 생성하기")}</Button></div>)}</div>
        </div>
        <div className="flex gap-3 mt-auto p-6 pt-0"><Button variant="secondary" className="flex-1" onClick={onCancel}>취소</Button><Button className="flex-1" onClick={() => onSubmit({title: title || "새로운 강의", type: uploadType, url: url, thumbnail: thumbnail || undefined})}>업로드</Button></div>
        </div>
    );
};
const TeacherChallengeListScreen = ({ onCreate, challenges, onLogout, onDelete }: { onCreate: () => void, challenges: any[], onLogout: () => void, onDelete: (id: string) => void }) => {
    return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div><h1 className="text-[20px] font-bold text-text-main">진행 중인 갓생도전</h1></div>
        <div className="flex items-center gap-4">
          <Button variant="icon" onClick={onCreate} aria-label="새 챌린지 만들기"><Plus size={24} className="text-primary" /></Button>
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors" aria-label="로그아웃"><LogOut size={20} /></button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {challenges.length === 0 ? (<div className="text-center py-8 text-muted-text text-sm">생성된 갓생도전이 없습니다.</div>) : (
          challenges.map(c => (
            <div key={c.id} className="p-4 border border-card-border rounded-[12px] shadow-sm bg-white relative group">
              <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-20" aria-label="챌린지 삭제"><Trash2 size={18} /></button>
              <div className="flex justify-between items-start mb-2 pr-8"><span className={`px-2 py-0.5 rounded text-[11px] font-bold ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status === 'active' ? '진행중' : '대기중'}</span><span className="text-[12px] text-muted-text">{c.duration || '1주일'}</span></div>
              <h3 className="font-bold text-[16px] mb-1">{c.title}</h3><p className="text-sm text-muted-text">참여자 {c.participants}명</p>
              <div className="mt-2 text-xs text-muted-text flex items-center gap-2"><span className="bg-secondary-bg px-2 py-0.5 rounded">{c.targetGrade || '전체 학년'}</span><span className="text-primary font-medium">{c.reward ? `+${c.reward}P` : ''}</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
const CreateChallengeScreen = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void, onCancel: () => void }) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('1주일');
    const [targetGrade, setTargetGrade] = useState('전체');
    const [goalSummary, setGoalSummary] = useState('');
    const [verificationMethod, setVerificationMethod] = useState<'photo' | 'video' | 'file'>('photo');
    const [aiWeight, setAiWeight] = useState(50);
    const [badgeName, setBadgeName] = useState('');
    const [rewardPoints, setRewardPoints] = useState('');

    const handleSubmit = () => {
        onSubmit({title: title || "새로운 도전", duration, targetGrade, goalSummary, verificationMethod, aiWeight, badgeName, reward: rewardPoints || '500'});
    };
    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto">
        <div className="p-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10"><h1 className="text-[24px] font-bold text-text-main">새 갓생도전 만들기</h1></div>
        <div className="p-6 space-y-8 pb-32">
            <div className="space-y-2"><label className="text-[14px] font-bold text-text-main">챌린지 제목</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 아침 독서 10분 인증" className="w-full h-[48px] px-4 border border-card-border rounded-[8px] outline-none focus:border-primary bg-white text-[15px]" /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[14px] font-bold text-text-main">기간</label><div className="relative"><select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-[48px] px-4 border border-card-border rounded-[8px] outline-none bg-white text-[15px] appearance-none"><option>1주일</option><option>2주일</option><option>한달</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" size={18} /></div></div><div className="space-y-2"><label className="text-[14px] font-bold text-text-main">대상 학년</label><div className="relative"><select value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} className="w-full h-[48px] px-4 border border-card-border rounded-[8px] outline-none bg-white text-[15px] appearance-none"><option>전체</option><option>1학년</option><option>2학년</option><option>3학년</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" size={18} /></div></div></div>
            <div className="space-y-2"><label className="text-[14px] font-bold text-text-main">목표 요약</label><input type="text" value={goalSummary} onChange={(e) => setGoalSummary(e.target.value)} placeholder="학생들에게 보여질 핵심 목표를 적어주세요" className="w-full h-[48px] px-4 border border-card-border rounded-[8px] outline-none focus:border-primary bg-white text-[15px]" /></div>
            <div className="space-y-3"><label className="text-[14px] font-bold text-text-main">검증 옵션</label><div className="flex gap-3">{[{ id: 'photo', label: '사진 허용', icon: <Image size={18} /> },{ id: 'video', label: '영상 허용', icon: <Film size={18} /> },{ id: 'file', label: '문서 허용', icon: <FileText size={18} /> },].map((opt) => (<button key={opt.id} onClick={() => setVerificationMethod(opt.id as any)} className={`flex-1 h-[48px] rounded-[8px] text-[14px] font-medium flex items-center justify-center gap-2 border transition-all ${verificationMethod === opt.id ? 'bg-primary/5 border-primary text-primary font-bold' : 'bg-white border-card-border text-muted-text hover:bg-gray-50'}`}>{opt.icon}{opt.label}</button>))}</div></div>
            <div className="space-y-4 pt-4 border-t border-gray-100"><label className="text-[14px] font-bold text-text-main">자동 검증 가중치</label><div className="px-2 pb-2"><input type="range" min="0" max="100" value={aiWeight} onChange={(e) => setAiWeight(parseInt(e.target.value))} className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-[12px] text-muted-text mt-3 font-medium"><span className="text-left w-1/3">메타데이터</span><span className="text-center w-1/3">AI 검사</span><span className="text-right w-1/3">동료평가</span></div></div></div>
            <div className="space-y-4 pt-4 border-t border-gray-100"><label className="text-[14px] font-bold text-text-main">보상 설정</label><div className="flex gap-4 items-start"><div className="w-[52px] h-[52px] rounded-full bg-reward-badge flex items-center justify-center text-2xl shadow-sm flex-shrink-0">🏅</div><div className="flex-1 space-y-3"><input type="text" value={badgeName} onChange={(e) => setBadgeName(e.target.value)} placeholder="배지 이름" className="w-full h-[48px] px-4 border border-card-border rounded-[8px] outline-none focus:border-primary bg-white text-[15px]" /><input type="number" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} placeholder="지급 포인트 (예: 500)" className="w-full h-[48px] px-4 border border-card-border rounded-[8px] outline-none focus:border-primary bg-white text-[15px]" /></div></div></div>
        </div>
        <div className="p-6 bg-white border-t border-gray-100 flex gap-3 mt-auto absolute bottom-0 left-0 right-0"><Button variant="secondary" className="flex-1 bg-secondary-bg hover:bg-gray-100 text-primary" onClick={onCancel}>임시 저장</Button><Button className="flex-1" onClick={handleSubmit}>공개하기</Button></div>
        </div>
    );
};
const TeacherDashboardScreen = ({ myClass, activities, onReviewAction, onLogout }: { myClass?: any, activities: any[], onReviewAction: (id: string, status: 'trusted' | 'rejected') => void, onLogout: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-secondary-bg">
      <div className="bg-white p-6 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-[24px] font-bold text-text-main">갓생케어 (검토 대기 제출물)</h1>
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors p-1" aria-label="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs">최신순</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-text">요약 알림</span>
            <div className="w-8 h-4 bg-gray-300 rounded-full relative">
              <div className="absolute w-4 h-4 bg-white rounded-full shadow left-0"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {activities.length === 0 ? (
           <div className="text-center py-10 text-muted-text text-sm">제출된 활동이 없습니다.</div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-[12px] shadow-card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[16px]">{item.student || '학생'}</span>
                    <span className="text-[13px] text-muted-text">{item.date}</span>
                  </div>
                  <p className="text-[14px] text-text-main font-bold">{item.title}</p>
                  <p className="text-[12px] text-muted-text mt-1">{item.type || '활동'} {item.progressInfo ? `(${item.progressInfo})` : ''}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded-[4px] text-[11px] font-bold ${
                    item.status === 'trusted' ? 'bg-green-100 text-green-700' : 
                    item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-[#FFEBEE] text-[#C62828]'
                  }`}>
                    {item.status === 'trusted' ? '승인됨' : item.status === 'rejected' ? '반려됨' : '검토 필요'}
                  </span>
                  {item.score && <span className={`text-[12px] font-bold mt-1 ${item.score > 80 ? 'text-green-600' : 'text-orange-600'}`}>
                    점수 {item.score}
                  </span>}
                </div>
              </div>

              {(item.status !== 'trusted' && item.status !== 'rejected') && (
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" className="flex-1 h-[36px] text-sm py-0" onClick={() => onReviewAction(item.id, 'rejected')}>반려</Button>
                  <Button variant="primary" className="flex-1 h-[36px] text-sm py-0" onClick={() => onReviewAction(item.id, 'trusted')}>승인</Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
const VerificationUploadScreen = ({ challengeTitle, onSubmit, onFail }: { challengeTitle: string, onSubmit: (valid: boolean) => void, onFail: (reason: string) => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setErrorMsg(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setIsVerifying(true);
        setErrorMsg(null);
        try {
        const base64 = await fileToBase64(file);
        const result = await verifyChallengeImage(base64, challengeTitle);
        if (result.isValid) {
            onSubmit(true);
        } else {
            onFail(result.reason || "챌린지와 무관한 사진입니다.");
        }
        } catch (e) {
        console.error(e);
        setErrorMsg("검증 중 오류가 발생했습니다.");
        } finally {
        setIsVerifying(false);
        }
    };
    return (
        <div className="flex flex-col h-full p-6 bg-white">
        <h1 className="text-[28px] font-bold text-text-main mb-2">인증 자료 업로드</h1>
        <p className="text-[15px] text-muted-text mb-8">
            갓생도전: <span className="font-bold text-primary">{challengeTitle}</span><br/>
            AI가 관련성을 정밀하게 분석합니다.
        </p>
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-card-border rounded-[12px] bg-secondary-bg/30 relative">
            {file ? (
            <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                <div className="w-full h-48 bg-gray-200 rounded-[8px] mb-4 flex items-center justify-center overflow-hidden relative">
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm font-medium">{file.name}</p>
                <button onClick={() => { setFile(null); setErrorMsg(null); }} className="text-red-500 text-sm mt-2 underline">제거</button>
            </div>
            ) : (
            <div className="text-center">
                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFile} />
                <div className="flex gap-4 justify-center mb-4">
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4 bg-white rounded-[12px] shadow-sm border hover:border-primary transition-colors">
                    <Upload size={32} className="text-primary" />
                    <span className="text-sm font-medium">사진 업로드</span>
                </label>
                </div>
            </div>
            )}
        </div>
        {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-[8px] flex items-center gap-2 text-sm font-bold animate-pulse">
            <AlertCircle size={16} /> {errorMsg}
            </div>
        )}
        <div className="mt-6">
            <Button fullWidth onClick={handleSubmit} disabled={!file || isVerifying} className={!file ? 'opacity-50 cursor-not-allowed' : ''}>
            {isVerifying ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> AI 정밀 분석 중...</span> : "제출하기"}
            </Button>
        </div>
        </div>
    );
};
const RewardScreen = ({ message, points, isComplete, onViewGrowth, onChallengeMore }: { message: string, points: number, isComplete: boolean, onViewGrowth: () => void, onChallengeMore: () => void }) => {
  return (
    <div className="flex flex-col h-full p-6 bg-white text-center justify-center">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isComplete ? 'bg-reward-badge text-white' : 'bg-success-bg text-success-text'}`}>
        {isComplete ? <Award size={48} /> : <CheckCircle size={48} />}
      </div>
      <h1 className="text-[24px] font-bold text-text-main mb-2">{isComplete ? "갓생도전 완주!" : "오늘의 인증 완료"}</h1>
      <p className="text-[15px] text-muted-text mb-8">{message}</p>
      <div className="bg-secondary-bg p-6 rounded-[12px] mb-8">
         <p className="text-sm text-muted-text mb-1">지급된 포인트</p>
         <p className="text-3xl font-bold text-primary">+{points} P</p>
         {isComplete && <p className="text-sm font-bold text-orange-500 mt-2">✨ 배지 획득! ✨</p>}
      </div>
      <div className="flex flex-col gap-3">
        <Button fullWidth onClick={onViewGrowth}>갓성장 확인하기</Button>
        <Button fullWidth variant="secondary" onClick={onChallengeMore}>더 도전하기</Button>
      </div>
    </div>
  );
};
const GrowthRecordScreen = ({ userType, onLogout, activities, badges, pointHistory, totalPoints }: { userType: UserType, onLogout: () => void, activities: any[], badges: any[], pointHistory: any[], totalPoints: number }) => {
  const [currentView, setCurrentView] = useState<'history' | 'badges' | 'points'>('history');
  
  const renderContent = () => {
      if (currentView === 'badges') {
          return (
             <div className="p-4"><h3 className="font-bold text-sm text-text-main mb-3 ml-1">나의 획득 배지</h3><div className="grid grid-cols-3 gap-4">{badges.length===0?<div className="col-span-3 text-center py-10 text-muted-text text-sm">아직 획득한 배지가 없습니다.</div>:badges.map((b)=>(<div key={b.id} className="bg-white p-4 rounded-[12px] shadow-sm flex flex-col items-center justify-center border border-card-border aspect-square"><div className="text-4xl mb-2">{b.icon}</div><div className="font-bold text-sm text-center">{b.name}</div><div className="text-xs text-muted-text mt-1">{b.date}</div></div>))}</div></div>
          );
      } else if (currentView === 'points') {
          return (
              <div className="p-4 space-y-4"><div className="bg-primary p-6 rounded-[12px] text-white flex justify-between items-center shadow-lg"><div><p className="text-sm opacity-90">현재 보유 포인트</p><h2 className="text-3xl font-bold mt-1">{totalPoints.toLocaleString()} P</h2></div><div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Coins className="text-white" /></div></div><div className="space-y-3"><h3 className="font-bold text-sm text-text-main ml-1">포인트 적립 내역</h3>{pointHistory.length===0?<div className="text-center py-4 text-muted-text text-xs">포인트 내역이 없습니다.</div>:pointHistory.map((item)=>(<div key={item.id} className="bg-white p-4 rounded-[12px] shadow-sm flex justify-between items-center border border-card-border"><div><div className="font-bold text-sm mb-0.5">{item.desc}</div><div className="text-xs text-muted-text">{item.date}</div></div><div className="font-bold text-primary">+{item.amount.toLocaleString()} P</div></div>))}</div></div>
          );
      }
      return (
          <div className="p-4 space-y-3 pb-24"><h3 className="font-bold text-sm text-text-main ml-1">인증 히스토리 (강의 & 도전)</h3>{activities.length===0?<div className="text-center py-10 text-muted-text text-sm">기록된 활동이 없습니다.</div>:activities.map((item:any)=>(<div key={item.id} className="bg-white p-4 rounded-[12px] shadow-card flex items-center justify-between"><div><h3 className="font-bold text-[16px] mb-1">{item.title}</h3><p className="text-[13px] text-muted-text">{item.date} · {item.type||'활동'}</p></div><div className="flex flex-col items-end gap-1"><span className="px-2 py-1 rounded-[4px] bg-[#E6F4EA] text-[#1B5E20] text-[11px] font-bold">완료됨</span>{item.progressInfo&&<span className="text-[11px] text-blue-600 font-medium">{item.progressInfo}</span>}</div></div>))}</div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-secondary-bg relative">
      <div className="bg-white p-6 pb-0 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-[24px] font-bold text-text-main">{userType === UserType.TEACHER ? '학생 갓성장' : '나의 갓성장'}</h1>
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors p-1" aria-label="로그아웃"><LogOut size={20} /></button>
        </div>
        <div className="flex gap-6 border-b border-card-border">
          <button onClick={() => setCurrentView('history')} className={`pb-3 text-[15px] font-medium transition-colors ${currentView === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}>인증히스토리</button>
          <button onClick={() => setCurrentView('badges')} className={`pb-3 text-[15px] font-medium transition-colors ${currentView === 'badges' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}>획득배지</button>
          <button onClick={() => setCurrentView('points')} className={`pb-3 text-[15px] font-medium transition-colors ${currentView === 'points' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}>포인트</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};
const StudentChallengeListScreen = ({ challenges, onStart, onLogout }: { challenges: any[], onStart: (challenge: any) => void, onLogout: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <h1 className="text-[20px] font-bold text-text-main">
          도전 가능한 갓생도전
        </h1>
        <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors p-1" aria-label="로그아웃">
          <LogOut size={20} />
        </button>
      </div>
      <div className="p-6 space-y-6">
        {challenges.length === 0 ? (
          <div className="text-center text-muted-text py-10">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p>현재 진행 중인 갓생도전이 없습니다.</p>
          </div>
        ) : (
          challenges.map(challenge => (
            <div key={challenge.id} className="bg-white border border-card-border rounded-[12px] shadow-card overflow-hidden">
              <div className="h-[120px] bg-secondary-bg flex items-center justify-center">
                <Target size={32} className="text-primary/40" />
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  <span className="bg-reward-badge/20 text-orange-700 px-2 py-0.5 rounded text-[12px] font-bold">{challenge.duration || '1주일'} 도전</span>
                  {challenge.status === 'active' && <span className="bg-blue-100 text-primary px-2 py-0.5 rounded text-[12px] font-bold">진행중</span>}
                </div>
                <h2 className="text-[18px] font-bold mb-2">{challenge.title}</h2>
                <p className="text-[14px] text-muted-text mb-4">
                  {challenge.description || "매일 꾸준히 실천하고 인증하세요!"}
                </p>
                <div className="flex items-center gap-2 text-[13px] text-text-main border-t border-gray-100 pt-3">
                  <span className="w-5 h-5 rounded-full bg-reward-badge flex items-center justify-center text-[10px]">🏅</span>
                  <span>완주 시 배지 + {challenge.reward || "500P"}</span>
                </div>
                <Button fullWidth className="mt-4" onClick={() => onStart(challenge)}>인증하기</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.WELCOME);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [activeTab, setActiveTab] = useState<'classes' | 'challenges' | 'growth'>('classes');
  const [registerRole, setRegisterRole] = useState<UserType>(UserType.STUDENT);

  // Shared State
  const [studentClassInfo, setStudentClassInfo] = useState<any | null>(null);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);

  // Rewards logic
  const [lastRewardInfo, setLastRewardInfo] = useState<{message: string, points: number, isComplete: boolean}>({
    message: '', points: 0, isComplete: false
  });

  const [registeredClasses, setRegisteredClasses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [myActivities, setMyActivities] = useState<any[]>([]);
  const [myBadges, setMyBadges] = useState<any[]>([]);
  const [myPointHistory, setMyPointHistory] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [classActivities, setClassActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);

  useEffect(() => {
    // Only load initial data. Detailed data is loaded after login.
    const user = StorageService.getCurrentUser();
    if (user) {
      handleLoginSuccess(user);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    
    // Load Data FILTERED by School via StorageService helper
    setRegisteredClasses(StorageService.getRegisteredClasses(user));
    setClasses(StorageService.getClasses(user));
    setChallenges(StorageService.getChallenges(user));
    
    const all = StorageService.getActivities(user);
    setAllActivities(all);

    if (user.role === UserType.STUDENT) {
       const userProfile = user.profile as any;
       if (userProfile && userProfile.points) {
         setTotalPoints(userProfile.points);
       }
       setMyActivities(all.filter(a => a.student === user.name).sort((a,b) => parseInt(b.id) - parseInt(a.id)));
    }

    if (user.role === UserType.TEACHER) {
      setScreen(Screen.TEACHER_CLASSES);
      setClassActivities(all.sort((a,b) => parseInt(b.id) - parseInt(a.id))); 
    } else {
      setScreen(Screen.TEACHER_CLASSES);
    }
  };
  
  const handleReviewAction = (id: string, status: 'trusted' | 'rejected') => {
    StorageService.updateActivityStatus(id, status);
    const updater = (prev: any[]) => prev.map(item => item.id === id ? { ...item, status } : item);
    setClassActivities(updater);
    setAllActivities(updater);
    showToast(`상태가 ${status === 'trusted' ? '승인' : '반려'}되었습니다.`, 'success');
  };

  const handleDeleteClass = (id: string) => {
    StorageService.removeClass(id);
    setClasses(prev => prev.filter(c => c.id !== id));
    showToast('강의가 삭제되었습니다.', 'success');
  };

  const handleDeleteChallenge = (id: string) => {
    StorageService.removeChallenge(id);
    setChallenges(prev => prev.filter(c => c.id !== id));
    showToast('갓생도전이 삭제되었습니다.', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => setToast(prev => ({ ...prev, show: false }));

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setScreen(Screen.WELCOME);
    setActiveTab('classes');
    setSelectedClass(null);
    setSelectedChallenge(null);
    setStudentClassInfo(null);
    setMyActivities([]);
    setMyBadges([]);
    setMyPointHistory([]);
    setTotalPoints(0);
    setClassActivities([]);
    setClasses([]);
    setChallenges([]);
  };

  const containerClass = "w-full h-[100dvh] md:max-w-[480px] md:h-[800px] md:my-8 md:rounded-[24px] md:shadow-2xl md:overflow-hidden bg-white mx-auto relative flex flex-col";

  const renderScreen = () => {
    switch (screen) {
      case Screen.WELCOME:
        return <WelcomeScreen onNext={() => setScreen(Screen.LOGIN)} />;

      case Screen.ACCOUNT_SELECTION:
        return <AccountSelectionScreen 
            onSelect={(type) => { setRegisterRole(type); setScreen(Screen.REGISTER); }} 
            onBulkUpload={() => setScreen(Screen.BULK_UPLOAD)}
        />;

      case Screen.LOGIN: 
        return <LoginScreen onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setScreen(Screen.ACCOUNT_SELECTION)} />;
      
      case Screen.REGISTER: 
        return <RegisterScreen userType={registerRole} onRegisterSuccess={handleLoginSuccess} onSwitchToLogin={() => setScreen(Screen.LOGIN)} />;

      case Screen.CLASS_JOIN:
        return (
          <ClassJoinScreen
            userType={currentUser?.role || UserType.STUDENT}
            onJoin={(code) => {
              if (currentUser?.role === UserType.TEACHER) {
                setScreen(Screen.TEACHER_CLASSES);
                setActiveTab('classes');
              } else {
                if (!code) return;
                const foundClass = registeredClasses.find(c => c.code === code);
                if (foundClass) {
                  setStudentClassInfo(foundClass);
                  showToast(`${foundClass.name}에 참여했습니다!`, "success");
                  setScreen(Screen.TEACHER_CLASSES);
                  setActiveTab('classes');
                } else {
                  showToast("유효하지 않은 초대 코드입니다.", "error");
                }
              }
            }}
            onCreate={() => {
              setScreen(Screen.CREATE_CLASS);
            }}
          />
        );
      
      case Screen.CREATE_CLASS:
         return <CreateClassScreen onSubmit={(classInfo) => { 
             const newClass = { ...classInfo, schoolId: currentUser?.schoolId || '' };
             StorageService.addRegisteredClass(newClass); 
             setRegisteredClasses(prev => [...prev, newClass]); 
             showToast(`${classInfo.name}이(가) 생성되었습니다!`, "success"); 
             setScreen(Screen.TEACHER_CLASSES); 
             setActiveTab('classes'); 
         }} />;
      
      case Screen.DEMO_VIDEO:
        return <DemoVideoScreen classItem={selectedClass} onBack={() => setScreen(Screen.TEACHER_CLASSES)} onFinish={() => setScreen(Screen.COMMENT_PRACTICE)} />;

      case Screen.COMMENT_PRACTICE:
        return (
          <CommentPracticeScreen
            onSubmit={(score, msg) => {
              showToast(msg, score >= 2 ? "success" : "error");

              const earnedPoints = score === 3 ? 100 : score === 2 ? 50 : 10;
              const date = new Date().toLocaleDateString();

              const newActivity: any = {
                  id: Date.now().toString(),
                  schoolId: currentUser?.schoolId,
                  title: `${selectedClass?.title || '강의'} 학습 완료`,
                  date: date,
                  score: 100,
                  status: 'verified', 
                  student: currentUser?.name || '나',
                  type: '강의'
              };
              
              const updated = [newActivity, ...myActivities];
              setMyActivities(updated);
              setAllActivities(prev => [newActivity, ...prev]);
              StorageService.addActivity(newActivity); 
              setTotalPoints(prev => prev + earnedPoints);
              setMyPointHistory(prev => [{
                id: Date.now(),
                desc: '강의 완료 및 댓글 작성',
                amount: earnedPoints,
                date: date
              }, ...prev]);

              if (currentUser) {
                  StorageService.updateUserPoints(currentUser.name, earnedPoints);
              }

              setTimeout(() => {
                  setScreen(Screen.CHALLENGE_INVITE);
                  setActiveTab('challenges');
              }, 2000);
            }}
          />
        );

      case Screen.CHALLENGE_INVITE:
        return (
          <StudentChallengeListScreen
            challenges={challenges}
            onStart={(challenge) => {
              setSelectedChallenge(challenge);
              setScreen(Screen.VERIFICATION_UPLOAD);
            }}
            onLogout={handleLogout}
          />
        );

      case Screen.VERIFICATION_UPLOAD:
        return (
          <VerificationUploadScreen
            challengeTitle={selectedChallenge?.title || "챌린지"}
            onFail={(reason) => {
               showToast(`인증 실패: ${reason}`, "error");
               setTimeout(() => setScreen(Screen.CHALLENGE_INVITE), 2000);
            }}
            onSubmit={() => {
              const challengeTitle = selectedChallenge ? selectedChallenge.title : "챌린지 인증";
              const date = new Date().toLocaleDateString();
              
              const previousCount = myActivities.filter(a => a.title === challengeTitle && a.type === '도전').length;
              const currentCount = previousCount + 1;
              const durationStr = selectedChallenge?.duration || '1주일';
              const targetCount = getChallengeDurationDays(durationStr);
              const isCompletedNow = currentCount >= targetCount;

              const newActivity: any = {
                id: Date.now().toString(),
                schoolId: currentUser?.schoolId,
                title: challengeTitle,
                date: date,
                score: 100,
                status: 'verified',
                student: currentUser?.name || '나',
                type: '도전',
                progressInfo: `${currentCount}일차 인증`
              };
              
              const updatedActivities = [newActivity, ...myActivities];
              setMyActivities(updatedActivities);
              setAllActivities(prev => [newActivity, ...prev]);
              StorageService.addActivity(newActivity);

              let earnedPoints = 0;
              let earnedMessage = "";

              if (isCompletedNow) {
                 const reward = selectedChallenge ? parseInt(selectedChallenge.reward || "500") : 500;
                 earnedPoints = reward;
                 earnedMessage = `축하합니다! ${durationStr} 챌린지를 완주했습니다.`;
                 
                 const newBadge: any = {
                    id: Date.now(),
                    name: selectedChallenge?.badgeName || '성취왕',
                    icon: '👑',
                    date: date
                 };
                 if (!myBadges.some(b => b.name === newBadge.name)) {
                     setMyBadges(prev => [newBadge, ...prev]);
                 }
              } else {
                 earnedPoints = 10;
                 earnedMessage = `${currentCount}일차 인증에 성공했습니다! (${targetCount}일 완주 도전 중)`;
              }

              setTotalPoints(prev => prev + earnedPoints);
              setMyPointHistory(prev => [{
                id: Date.now(),
                desc: isCompletedNow ? `${challengeTitle} 완주 성공` : `${challengeTitle} 일일 인증`,
                amount: earnedPoints,
                date: date
              }, ...prev]);

              if (currentUser) {
                StorageService.updateUserPoints(currentUser.name, earnedPoints);
              }

              setLastRewardInfo({
                  message: earnedMessage,
                  points: earnedPoints,
                  isComplete: isCompletedNow
              });

              showToast("AI 검증 완료! 인증이 등록되었습니다.", "success");
              setTimeout(() => setScreen(Screen.REWARD), 1500);
            }}
          />
        );

      case Screen.REWARD:
        return (
          <RewardScreen
            message={lastRewardInfo.message}
            points={lastRewardInfo.points}
            isComplete={lastRewardInfo.isComplete}
            onViewGrowth={() => {
              setActiveTab('growth');
              setScreen(Screen.GROWTH_RECORD);
            }}
            onChallengeMore={() => {
              setActiveTab('challenges');
              setScreen(Screen.CHALLENGE_INVITE);
            }}
          />
        );

      case Screen.GROWTH_RECORD:
        const activitiesToShow = currentUser?.role === UserType.TEACHER ? [] : myActivities; 
        return (
          <GrowthRecordScreen
            userType={currentUser?.role || UserType.STUDENT}
            onLogout={handleLogout}
            activities={activitiesToShow}
            badges={myBadges}
            pointHistory={myPointHistory}
            totalPoints={totalPoints}
          />
        );

      case Screen.TEACHER_CLASSES:
        return <TeacherClassListScreen 
          classes={classes} 
          onUpload={() => setScreen(Screen.UPLOAD_CLASS)} 
          onLogout={handleLogout} 
          onDelete={handleDeleteClass} 
          onAdmin={() => setScreen(Screen.ADMIN_MANAGE_USERS)} 
          currentUser={currentUser}
        />;

      case Screen.UPLOAD_CLASS:
        return <UploadClassScreen onSubmit={(data) => { 
            const newClass: any = { 
                id: Date.now().toString(), 
                schoolId: currentUser?.schoolId,
                title: data.title, 
                date: new Date().toLocaleDateString(), 
                type: data.type, 
                description: '선생님이 업로드한 갓생강의입니다.', 
                url: data.url, 
                thumbnail: data.thumbnail 
            }; 
            setClasses([newClass, ...classes]); 
            StorageService.addClass(newClass); 
            showToast("갓생강의가 업로드되었습니다.", "success"); 
            setScreen(Screen.TEACHER_CLASSES); 
        }} onCancel={() => setScreen(Screen.TEACHER_CLASSES)} />;

      case Screen.TEACHER_CHALLENGES:
        return <TeacherChallengeListScreen challenges={challenges} onCreate={() => setScreen(Screen.CREATE_CHALLENGE)} onLogout={handleLogout} onDelete={handleDeleteChallenge} />;

      case Screen.CREATE_CHALLENGE:
        return (
          <CreateChallengeScreen
            onSubmit={(data) => {
              const newChallenge: any = {
                id: Date.now().toString(),
                schoolId: currentUser?.schoolId,
                title: data.title,
                status: 'active',
                participants: 0,
                description: data.goalSummary || '새로운 갓생도전입니다.',
                reward: data.reward,
                duration: data.duration,
                targetGrade: data.targetGrade,
                badgeName: data.badgeName
              };
              setChallenges([newChallenge, ...challenges]);
              StorageService.addChallenge(newChallenge);
              showToast("갓생도전이 공개되었습니다.", "success");
              setScreen(Screen.TEACHER_CHALLENGES);
            }}
            onCancel={() => setScreen(Screen.TEACHER_CHALLENGES)}
          />
        );

      case Screen.TEACHER_DASHBOARD:
        return <TeacherDashboardScreen 
                 myClass={null} 
                 activities={classActivities} 
                 onReviewAction={handleReviewAction} 
                 onLogout={handleLogout} 
               />;
      
      case Screen.ADMIN_MANAGE_USERS:
        return <AdminManageUsersScreen 
            onBack={() => setScreen(Screen.TEACHER_CLASSES)} 
            currentUser={currentUser}
        />;
    
      case Screen.BULK_UPLOAD:
        return <BulkUploadScreen onBack={() => setScreen(Screen.ACCOUNT_SELECTION)} />;

      default:
        return <WelcomeScreen onNext={() => setScreen(Screen.LOGIN)} />;
    }
  };

  const renderCurrentView = () => {
    if (currentUser?.role !== UserType.TEACHER && currentUser?.role !== UserType.GUEST && screen === Screen.TEACHER_CLASSES) {
      return (
        <StudentClassListScreen
          classes={classes}
          onSelectClass={(item) => {
            setSelectedClass(item);
            setScreen(Screen.DEMO_VIDEO);
          }}
          onLogout={handleLogout}
          studentClassInfo={studentClassInfo}
        />
      );
    }
    return renderScreen();
  };

  const isTeacherMainScreen = [Screen.TEACHER_CLASSES, Screen.TEACHER_CHALLENGES, Screen.TEACHER_DASHBOARD].includes(screen);
  const isStudentMainScreen = [Screen.GROWTH_RECORD, Screen.CHALLENGE_INVITE, Screen.TEACHER_CLASSES].includes(screen);
  const showBottomNav = (isTeacherMainScreen || isStudentMainScreen) && currentUser?.role !== UserType.GUEST && currentUser !== null && screen !== Screen.ADMIN_MANAGE_USERS && screen !== Screen.BULK_UPLOAD;

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f5f5f5] font-sans text-text-main">
      <div className={containerClass}>
        <div className={`flex-1 overflow-hidden ${showBottomNav ? 'pb-[64px]' : ''} relative`}>
          {renderCurrentView()}
        </div>

        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />

        {showBottomNav && (
          <BottomNav
            activeTab={activeTab}
            userType={currentUser?.role}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (currentUser?.role === UserType.TEACHER) {
                if (tab === 'classes') setScreen(Screen.TEACHER_CLASSES);
                if (tab === 'challenges') setScreen(Screen.TEACHER_CHALLENGES);
                if (tab === 'growth') setScreen(Screen.TEACHER_DASHBOARD);
              } else {
                if (tab === 'growth') setScreen(Screen.GROWTH_RECORD);
                if (tab === 'challenges') setScreen(Screen.CHALLENGE_INVITE);
                if (tab === 'classes') setScreen(Screen.TEACHER_CLASSES);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
