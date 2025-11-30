import React, { useState, useEffect } from 'react';
import { Screen, UserType, User } from './types';
import { Button } from './components/Button';
import { Toast } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { StorageService } from './services/storage';
import { Play, Pause, RotateCcw, Upload, Camera, FileText, ChevronRight, CheckCircle, Clock, AlertTriangle, Target, AlertCircle, Plus, Video, Image, Film, File, FileSpreadsheet, Coins, Award, Loader2, Sparkles, Users, BookOpen, Link as LinkIcon, LogOut, Filter, ExternalLink, Copy } from 'lucide-react';

// --- Shared Types ---
// These are now available in types.ts but kept here for reference if needed or removed if imported
// For simplicity and avoiding re-definition conflicts if strict, we rely on imports.
// However, the original code had them inline. To fix errors without massive refactor, we leave them or imports.
// The file imports User, UserType, Screen from './types'. 
// We will rely on types.ts for other interfaces if possible, but the original code had them here.
// I will keep the imports and logic.

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
        3분 갓생클래스와 챌린지로 오늘의<br />
        한 걸음을 시작하세요.
      </p>
    </div>
    <div className="flex flex-col gap-3 mb-8">
      <Button onClick={onNext} aria-label="주요 작업 시작">시작하기</Button>
      <div className="text-center">
        <Button variant="link" aria-label="링크로 이동" onClick={onNext}>교사용 계정으로 가입하기</Button>
      </div>
      <p className="text-[13px] text-muted-text text-center mt-4" aria-label="보조 설명">
        이미 반 초대 코드를 받으셨나요? 다음 화면에서 입력하세요.
      </p>
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
        <Button variant="secondary">QR로 참여하기</Button>
        {userType === UserType.TEACHER && (
          <Button variant="secondary" onClick={onCreate}>반 생성하기</Button>
        )}
      </div>

      <p className="text-[13px] text-muted-text mt-6">
        교사가 보낸 초대 링크나 QR을 사용하면 즉시 반에 합류합니다.
      </p>
    </div>
  );
};

// 3.1 Create Class Screen (Teacher Only)
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

        <div className="p-4 bg-secondary-bg rounded-[12px] flex items-start gap-3">
          <Users className="text-primary mt-1" size={20} />
          <div className="text-[13px] text-text-main">
            <p className="font-bold mb-1">반이 생성되면?</p>
            <p className="text-muted-text">초대 코드가 발급됩니다. 학생들에게 코드를 공유하면 자동으로 학생 명단이 생성됩니다.</p>
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!className} className={!className ? "opacity-50" : ""} >
        반 만들기
      </Button>
    </div>
  );
};

// 4. Student Class List Screen (New)
const StudentClassListScreen = ({ classes, onSelectClass, onLogout, studentClassInfo }: { classes: any[], onSelectClass: (item: any) => void, onLogout: () => void, studentClassInfo?: any | null }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-[20px] font-bold text-text-main">수강 가능한 갓생클래스</h1>
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
            <p>등록된 클래스가 없습니다.</p>
          </div>
        ) : (
          classes.map(c => (
            <div
              key={c.id}
              onClick={() => onSelectClass(c)}
              className="flex gap-4 p-3 border border-gray-100 rounded-[12px] shadow-sm cursor-pointer hover:border-primary transition-colors bg-white"
            >
              <div className="w-[120px] h-[68px] bg-gray-200 rounded-[8px] flex items-center justify-center relative overflow-hidden">
                {c.type === 'video' ? <Video className="text-gray-400" /> : <LinkIcon className="text-gray-400" />}
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <Play size={20} className="text-white fill-white opacity-80" />
                </div>
              </div>
              <div className="flex-1">
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

// 4.1 Demo Video Screen (Student View - Player)
const DemoVideoScreen = ({ classItem, onFinish, onBack }: { classItem: any | null, onFinish: () => void, onBack: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const title = classItem?.title || "데모 갓생클래스 보기 1분";
  const description = classItem?.description || "짧은 강의를 보고 댓글로 요약을 남겨 보세요. 자동으로 배지를 드립니다.";

  // Function to convert normal YouTube links to embed links
  const getEmbedUrl = (url: string) => {
    if (!url) return '';

    let videoId = '';

    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        return `${url}${url.includes('?') ? '&' : '?'}autoplay=1&mute=1&playsinline=1&origin=${window.location.origin}`;
      }
    } catch (e) {
      console.error("URL parsing error", e);
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&origin=${window.location.origin}`;
    }

    // For non-YouTube links (e.g. blogs, vimeo, etc.), return the original URL for iframe
    return url;
  };

  // Helper to check if a URL is likely a direct video file
  const isDirectVideoFile = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm') || lower.endsWith('.ogg');
  };

  const renderPlayer = () => {
    if (videoError) {
      return (
        <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle size={32} className="text-yellow-500 mb-2" />
          <p className="text-sm">동영상을 재생할 수 없습니다.</p>
          {classItem?.url && (
            <a href={classItem.url} target="_blank" rel="noreferrer" className="text-primary mt-2 text-xs flex items-center gap-1">
              <ExternalLink size={12} /> 원본 링크에서 보기
            </a>
          )}
        </div>
      );
    }

    if (!classItem?.url && !classItem?.type) {
      return (
        <div className="relative w-full h-full bg-black flex items-center justify-center group">
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="text-white fill-white" /> : <Play className="text-white fill-white ml-1" />}
            </button>
          </div>
        </div>
      );
    }

    // Determine if we should use <video> tag or <iframe>
    // Use <video> if it's explicitly a 'video' type OR if the URL ends in a video extension
    const useNativeVideo = classItem?.type === 'video' || (classItem?.url && isDirectVideoFile(classItem.url));

    if (useNativeVideo) {
      return (
        <video
          src={classItem.url}
          controls
          autoPlay
          muted // Muted needed for autoplay policy
          playsInline
          className="w-full h-full bg-black object-contain"
          onError={() => setVideoError(true)}
        />
      );
    } else {
      return (
        <iframe
          src={getEmbedUrl(classItem?.url || '')}
          title={classItem?.title}
          className="w-full h-full bg-white"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setVideoError(true)}
        />
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronRight className="rotate-180 text-text-main" />
        </button>
        <h1 className="text-[16px] font-bold text-text-main">영상 재생</h1>
      </div>

      {/* Video Player Section - Moved to top */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-gray-100">
        {renderPlayer()}
      </div>

      <div className="p-6 pb-2">
        <h1 className="text-[20px] font-bold text-text-main mb-2">{title}</h1>
        <p className="text-[15px] text-text-main line-clamp-2">
          {description}
        </p>
      </div>

      <div className="p-6 mt-auto">
        <Button fullWidth onClick={onFinish}>
          시청 완료 → 댓글 작성 연습으로 이동
        </Button>
        <p className="text-[13px] text-muted-text text-center mt-3">
          핵심 질문 하나에 답하면 더 많은 포인트를 받을 수 있습니다.
        </p>
      </div>
    </div>
  );
};

// 5. Comment Practice Screen
const CommentPracticeScreen = ({ onSubmit }: { onSubmit: (score: number, message: string) => void }) => {
  const [type, setType] = useState('summary');
  const [comment, setComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCommentSubmit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const length = comment.length;
      let score = 0;
      let message = "";
      if (length === 0) {
        score = 1;
        message = "AI 분석 완료: 빈 내용입니다. (1점)";
      } else if (length < 20) {
        score = 2;
        message = "AI 분석 완료: 내용이 조금 짧네요. (2점)";
      } else {
        score = 3;
        message = "AI 분석 완료: 핵심을 잘 파악했습니다! (3점)";
      }
      onSubmit(score, message);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white relative">
      <h1 className="text-[20px] font-bold text-text-main mb-6">댓글 유형을 선택해 보세요</h1>

      <div className="flex gap-3 mb-6" role="radiogroup" aria-label="댓글 유형 선택">
        {['요약', '질문', '느낀 점'].map((opt) => {
          const id = opt === '요약' ? 'summary' : opt === '질문' ? 'question' : 'feeling';
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
          placeholder="20자 이상 작성 시 3점을 획득합니다."
          className="w-full h-[120px] p-4 border border-[#E0E6F0] rounded-[8px] resize-none focus:outline-none focus:border-primary text-[15px] disabled:bg-gray-50"
          maxLength={100}
        />
        <div className={`mt-2 text-right text-[12px] font-medium transition-colors ${comment.length >= 20 ? 'text-primary' : 'text-muted-text'}`}>
          {comment.length}/20자 (목표)
        </div>
      </div>

      <div className="mt-auto">
        <div className="bg-[#E6F0FF] p-3 rounded-[8px] mb-4 text-[#0047B3] text-[13px] flex items-start gap-2">
          <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            {isAnalyzing
              ? "AI가 작성하신 내용을 꼼꼼히 검토하고 있습니다..."
              : "댓글 유형을 선택하면 AI가 내용을 검토하고 점수를 부여합니다."}
          </p>
        </div>
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

      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/50 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]"></div>
      )}
    </div>
  );
};

// 6. Student Challenge List Screen
const StudentChallengeListScreen = ({ challenges, onStart, onLogout }: { challenges: any[], onStart: (challenge: any) => void, onLogout: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <h1 className="text-[20px] font-bold text-text-main">
          도전 가능한 챌린지
        </h1>
        <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors p-1" aria-label="로그아웃">
          <LogOut size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {challenges.length === 0 ? (
          <div className="text-center text-muted-text py-10">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p>현재 진행 중인 챌린지가 없습니다.</p>
          </div>
        ) : (
          challenges.map(challenge => (
            <div key={challenge.id} className="bg-white border border-card-border rounded-[12px] shadow-card overflow-hidden">
              <div className="h-[120px] bg-secondary-bg flex items-center justify-center">
                <Target size={32} className="text-primary/40" />
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  <span className="bg-reward-badge/20 text-orange-700 px-2 py-0.5 rounded text-[12px] font-bold">1주 챌린지</span>
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

// 7. Verification Upload Screen
const VerificationUploadScreen = ({ onSubmit }: { onSubmit: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("파일 크기가 너무 큽니다. 5MB 이하로 다시 시도하세요");
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <h1 className="text-[28px] font-bold text-text-main mb-2">인증 자료 업로드</h1>
      <p className="text-[15px] text-muted-text mb-8">
        권장 증거: 알람 스크린샷, 책 페이지 사진,<br />활동 로그 스크린샷
      </p>

      {error && (
        <div className="bg-error-bg text-error-text p-3 rounded-[8px] mb-4 text-[13px] flex items-center gap-2" role="alert">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-card-border rounded-[12px] bg-secondary-bg/30 relative">
        {file ? (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            <div className="w-full h-48 bg-gray-200 rounded-[8px] mb-4 flex items-center justify-center overflow-hidden relative">
              <FileText size={48} className="text-muted-text" />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <p className="text-sm font-medium">{file.name}</p>
            <button onClick={() => setFile(null)} className="text-red-500 text-sm mt-2 underline">제거</button>

            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-verify-pending/20 text-orange-700 rounded-full text-xs font-bold">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              검증 준비 완료
            </div>
          </div>
        ) : (
          <div className="text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFile}
            />
            <div className="flex gap-4 justify-center mb-4">
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4 bg-white rounded-[12px] shadow-sm border hover:border-primary transition-colors">
                <Upload size={32} className="text-primary" />
                <span className="text-sm font-medium">파일 선택</span>
              </label>
              <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-[12px] shadow-sm border hover:border-primary transition-colors">
                <Camera size={32} className="text-primary" />
                <span className="text-sm font-medium">사진 촬영</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="text-[13px] text-muted-text text-center mb-4">
          업로드된 파일은 타임스탬프로 검증됩니다. 얼굴 노출을 피해주세요.
        </p>
        <Button fullWidth onClick={onSubmit} disabled={!file} className={!file ? 'opacity-50 cursor-not-allowed' : ''}>
          제출하기
        </Button>
      </div>
    </div>
  );
};

// 8. Reward Screen
const RewardScreen = ({ onViewGrowth, onChallengeMore }: { onViewGrowth: () => void, onChallengeMore: () => void }) => {
  return (
    <div className="flex flex-col h-full p-6 bg-white text-center justify-center">
      <div className="w-24 h-24 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={48} className="text-success-text" />
      </div>

      <h1 className="text-[24px] font-bold text-text-main mb-2">활동 완료 축하합니다!</h1>
      <p className="text-[15px] text-muted-text mb-8">
        매일 한 번의 작은 실천이<br />큰 변화를 만듭니다.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 border border-card-border rounded-[12px]">
          <div className="text-[32px] mb-1">🏅</div>
          <div className="text-[14px] font-bold">독서 새싹</div>
          <div className="text-[12px] text-muted-text">획득 배지</div>
        </div>
        <div className="p-4 border border-card-border rounded-[12px]">
          <div className="text-[32px] mb-1 font-bold text-primary">500</div>
          <div className="text-[14px] font-bold">포인트</div>
          <div className="text-[12px] text-muted-text">현재 누적</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button fullWidth onClick={onViewGrowth}>성장기록 보기</Button>
        <Button fullWidth variant="secondary" onClick={onChallengeMore}>더 도전하기</Button>
      </div>
    </div>
  );
};

// 9. Growth Record Screen
const GrowthRecordScreen = ({
  userType,
  onExport,
  myClass,
  onLogout,
  activities,
  badges,
  pointHistory,
  totalPoints
}: {
  userType: UserType,
  onExport?: () => void,
  myClass?: any,
  onLogout: () => void,
  activities: any[],
  badges: any[],
  pointHistory: any[],
  totalPoints: number
}) => {
  const [currentView, setCurrentView] = useState<'history' | 'badges' | 'points'>('history');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(null);

  const filteredActivities = selectedClassFilter
    ? activities.filter(item => item.className === selectedClassFilter)
    : activities;

  const renderContent = () => {
    switch (currentView) {
      case 'badges':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
            {badges.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-muted-text text-sm">획득한 배지가 없습니다.</div>
            ) : (
              badges.map((badge) => (
                <div key={badge.id} className="bg-white p-4 rounded-[12px] shadow-sm flex flex-col items-center justify-center border border-card-border aspect-square">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="font-bold text-sm text-center">{badge.name}</div>
                  <div className="text-xs text-muted-text mt-1">{badge.date}</div>
                </div>
              ))
            )}
          </div>
        );
      case 'points':
        return (
          <div className="p-4 space-y-4">
            <div className="bg-primary p-6 rounded-[12px] text-white flex justify-between items-center shadow-lg">
              <div>
                <p className="text-sm opacity-90">현재 보유 포인트</p>
                <h2 className="text-3xl font-bold mt-1">{totalPoints.toLocaleString()} P</h2>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-text-main ml-1">최근 내역</h3>
              {pointHistory.length === 0 ? (
                <div className="text-center py-4 text-muted-text text-xs">포인트 내역이 없습니다.</div>
              ) : (
                pointHistory.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-[12px] shadow-sm flex justify-between items-center border border-card-border">
                    <div>
                      <div className="font-bold text-sm mb-0.5">{item.desc}</div>
                      <div className="text-xs text-muted-text">{item.date}</div>
                    </div>
                    <div className="font-bold text-primary">+{item.amount.toLocaleString()} P</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default: // history
        return (
          <div className="p-4 space-y-3 pb-24">
            {userType === UserType.TEACHER && myClass && (
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setSelectedClassFilter(null)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${selectedClassFilter === null
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-muted-text'
                    }`}
                >
                  전체 보기
                </button>
                <button
                  onClick={() => setSelectedClassFilter(myClass.name)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${selectedClassFilter === myClass.name
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-muted-text'
                    }`}
                >
                  {myClass.name}
                </button>
              </div>
            )}

            {userType === UserType.TEACHER && !selectedClassFilter && myClass && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-[12px] mb-2">
                <h3 className="text-primary font-bold flex items-center gap-2">
                  <Users size={18} /> 전체 학생 활동 기록
                </h3>
                <p className="text-xs text-muted-text mt-1">모든 반의 학생 활동이 최신순으로 표시됩니다.</p>
              </div>
            )}

            {filteredActivities.length === 0 ? (
              <div className="text-center py-10 text-muted-text text-sm">기록된 활동이 없습니다.</div>
            ) : (
              filteredActivities.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-[12px] shadow-card flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[16px] mb-1">
                      {item.student ? `${item.student} - ` : ''}{item.title}
                    </h3>
                    <p className="text-[13px] text-muted-text">{item.date} · 자동 검증</p>
                    {userType === UserType.TEACHER && item.className && (
                      <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded mt-1 inline-block">{item.className}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {item.status === 'trusted' && (
                      <span className="px-2 py-1 rounded-[4px] bg-[#E6F4EA] text-[#1B5E20] text-[11px] font-bold">신뢰 높음</span>
                    )}
                    {item.status === 'verified' && (
                      <span className="px-2 py-1 rounded-[4px] bg-[#FFF8E1] text-[#F57F17] text-[11px] font-bold">검증 완료</span>
                    )}
                    {item.status === 'review' && (
                      <span className="px-2 py-1 rounded-[4px] bg-[#FFEBEE] text-[#C62828] text-[11px] font-bold">검토 필요</span>
                    )}
                    <span className="text-[12px] font-mono text-muted-text">신뢰도 {item.score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary-bg relative">
      <div className="bg-white p-6 pb-0 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-[24px] font-bold text-text-main">
            {userType === UserType.TEACHER ? '학생 성장기록' : '나의 성장기록'}
          </h1>
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors p-1" aria-label="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
        <div className="flex gap-6 border-b border-card-border">
          <button
            onClick={() => setCurrentView('history')}
            className={`pb-3 text-[15px] font-medium transition-colors ${currentView === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}
          >
            {userType === UserType.TEACHER ? '학급 히스토리' : '인증 히스토리'}
          </button>
          <button
            onClick={() => setCurrentView('badges')}
            className={`pb-3 text-[15px] font-medium transition-colors ${currentView === 'badges' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}
          >
            획득 배지
          </button>
          <button
            onClick={() => setCurrentView('points')}
            className={`pb-3 text-[15px] font-medium transition-colors ${currentView === 'points' ? 'border-b-2 border-primary text-primary' : 'text-muted-text'}`}
          >
            포인트
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {userType === UserType.TEACHER && (
        <div className="absolute bottom-24 right-4 z-30">
          <Button
            onClick={onExport}
            className="shadow-xl rounded-full bg-[#107C41] hover:bg-[#0b5c30] text-white px-5 py-3 h-auto flex items-center gap-2 font-bold transition-transform active:scale-95"
            aria-label="구글 시트로 내보내기"
          >
            <FileSpreadsheet size={20} />
            <span>구글 시트로 내보내기</span>
          </Button>
        </div>
      )}
    </div>
  );
};

// 10. Teacher Dashboard (Review Queue)
const TeacherDashboardScreen = ({ myClass, onLogout }: { myClass?: any, onLogout: () => void }) => {
  const reviews = [
    { id: '1', name: '김철수', task: '영어 말하기 연습', date: '10분 전', score: 45 },
    { id: '2', name: '이영희', task: '과학 실험 사진', date: '30분 전', score: 30 },
    { id: '3', name: '박지성', task: '줄넘기 100회', date: '1시간 전', score: 92 },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary-bg">
      <div className="bg-white p-6 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-[24px] font-bold text-text-main">검토 대기 제출물</h1>
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors p-1" aria-label="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
        {myClass ? (
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-[12px] mb-4">
            <p className="text-sm text-primary font-bold flex items-center gap-1 mb-1">
              <BookOpen size={16} /> {myClass.name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-text">초대 코드: <span className="font-bold text-text-main text-sm">{myClass.code}</span></p>
              <button className="p-1 hover:bg-black/5 rounded"><Copy size={12} /></button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-text mb-4">현재 관리 중인 반이 없습니다.</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs">신뢰 점수 낮음 우선</span>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-muted-text text-xs">반별 필터</span>
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
        {reviews.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-[12px] shadow-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[16px]">{item.name}</span>
                  <span className="text-[13px] text-muted-text">{item.date}</span>
                </div>
                <p className="text-[14px] text-text-main">{item.task}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 rounded-[4px] text-[11px] font-bold ${item.score > 80 ? 'bg-green-100 text-green-700' : 'bg-[#FFEBEE] text-[#C62828]'}`}>
                  {item.score > 80 ? '신뢰 높음' : '검토 필요'}
                </span>
                <span className={`text-[12px] font-bold mt-1 ${item.score > 80 ? 'text-green-600' : 'text-red-600'}`}>
                  신뢰도 {item.score}%
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1 h-[36px] text-sm py-0">반려</Button>
              <Button variant="primary" className="flex-1 h-[36px] text-sm py-0">승인</Button>
            </div>
          </div>
        ))}
        {myClass && (
          <div className="text-center p-4 text-xs text-muted-text">
            {myClass.name} 학생들의 모든 활동이 여기에 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
};

// 11. Teacher Class List Screen
const TeacherClassListScreen = ({ onUpload, myClass, classes, onLogout }: { onUpload: () => void, myClass?: any, classes: any[], onLogout: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-[20px] font-bold text-text-main">우리 반 갓생클래스</h1>
          {myClass && <p className="text-xs text-primary font-medium mt-1">{myClass.name} ({myClass.subject})</p>}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="icon" onClick={onUpload} aria-label="클래스 업로드">
            <Plus size={24} className="text-primary" />
          </Button>
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors" aria-label="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-text text-sm">등록된 클래스가 없습니다.</div>
        ) : (
          classes.map(c => (
            <div key={c.id} className="flex gap-4 p-3 border border-gray-100 rounded-[12px] shadow-sm">
              <div className="w-[120px] h-[68px] bg-gray-200 rounded-[8px] flex items-center justify-center">
                {c.type === 'video' ? <Video className="text-gray-400" /> : <LinkIcon className="text-gray-400" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-muted-text">{c.date}</p>
                <span className="text-[10px] bg-secondary-bg text-primary px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                  {c.type === 'video' ? '영상' : '링크'}
                </span>
              </div>
            </div>
          ))
        )}
        <Button onClick={onUpload} fullWidth className="mt-4" icon={<Upload size={18} />}>
          클래스 업로드
        </Button>
      </div>
    </div>
  );
};

// 12. Upload Class Screen
const UploadClassScreen = ({ onSubmit, onCancel }: { onSubmit: (data: { title: string, type: 'video' | 'link', url?: string }) => void, onCancel: () => void }) => {
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <h1 className="text-[24px] font-bold text-text-main mb-6">새 갓생클래스 업로드</h1>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="영상 제목을 입력하세요"
            className="w-full h-[44px] px-3 border border-card-border rounded-[8px] outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">업로드 방식</label>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setUploadType('file')}
              className={`flex-1 py-2 rounded-[8px] text-sm font-bold border transition-colors ${uploadType === 'file' ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}
            >
              파일 업로드
            </button>
            <button
              onClick={() => setUploadType('link')}
              className={`flex-1 py-2 rounded-[8px] text-sm font-bold border transition-colors ${uploadType === 'link' ? 'bg-primary text-white border-primary' : 'bg-white text-muted-text border-card-border'}`}
            >
              링크 입력
            </button>
          </div>

          {uploadType === 'file' ? (
            <div className="border-2 border-dashed border-card-border rounded-[12px] bg-secondary-bg/50 h-[120px] flex flex-col items-center justify-center text-muted-text transition-all">
              <Video size={32} className="mb-2 opacity-50" />
              <span className="text-sm">클릭하여 영상 선택 (MP4, MOV)</span>
              <span className="text-xs mt-1 text-primary">(데모: 샘플 영상이 등록됩니다)</span>
            </div>
          ) : (
            <div className="transition-all">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text">
                  <LinkIcon size={18} />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="YouTube, 블로그 또는 영상 링크를 입력하세요"
                  className="w-full h-[48px] pl-10 pr-3 border border-card-border rounded-[8px] outline-none focus:border-primary bg-secondary-bg/20"
                />
              </div>
              <p className="text-[12px] text-muted-text mt-2 ml-1">
                유튜브, 블로그, 웹사이트 등 외부 링크를 지원합니다.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">설명</label>
          <textarea placeholder="영상에 대한 설명을 입력하세요" className="w-full h-[100px] p-3 border border-card-border rounded-[8px] resize-none outline-none focus:border-primary" />
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>취소</Button>
        <Button className="flex-1" onClick={() => onSubmit({
          title: title || "새로운 클래스",
          type: uploadType === 'file' ? 'video' : 'link',
          url: uploadType === 'link' ? url : 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
        })}>
          업로드
        </Button>
      </div>
    </div>
  );
};

// 13. Teacher Challenge List Screen
const TeacherChallengeListScreen = ({ onCreate, myClass, challenges, onLogout }: { onCreate: () => void, myClass?: any, challenges: any[], onLogout: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-[20px] font-bold text-text-main">진행 중인 챌린지</h1>
          {myClass && <p className="text-xs text-primary font-medium mt-1">{myClass.name}</p>}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="icon" onClick={onCreate} aria-label="새 챌린지 만들기">
            <Plus size={24} className="text-primary" />
          </Button>
          <button onClick={onLogout} className="text-muted-text hover:text-primary transition-colors" aria-label="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {challenges.length === 0 ? (
          <div className="text-center py-8 text-muted-text text-sm">생성된 챌린지가 없습니다.</div>
        ) : (
          challenges.map(c => (
            <div key={c.id} className="p-4 border border-card-border rounded-[12px] shadow-sm bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {c.status === 'active' ? '진행중' : '대기중'}
                </span>
              </div>
              <h3 className="font-bold text-[16px] mb-1">{c.title}</h3>
              <p className="text-sm text-muted-text">참여자 {c.participants}명</p>
            </div>
          ))
        )}

        <div className="mt-4 p-6 bg-secondary-bg/50 rounded-[12px] text-center">
          <p className="text-sm text-muted-text mb-4">새로운 챌린지를 만들어 학생들의 참여를 유도해보세요!</p>
          <Button onClick={onCreate} fullWidth>새 챌린지 만들기</Button>
        </div>
      </div>
    </div>
  );
};

// 14. Create Challenge Screen
const CreateChallengeScreen = ({ onSubmit, onCancel }: { onSubmit: (data: { title: string }) => void, onCancel: () => void }) => {
  const [title, setTitle] = useState('');

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-6 pb-4 border-b border-gray-100">
        <h1 className="text-[24px] font-bold text-text-main">새 챌린지 만들기</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">챌린지 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 아침 독서 10분 인증"
            className="w-full h-[44px] px-3 border border-card-border rounded-[8px] outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main">기간</label>
            <select className="w-full h-[44px] px-3 border border-card-border rounded-[8px] outline-none bg-white">
              <option>1주일</option>
              <option>2주일</option>
              <option>한달</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main">대상 학년</label>
            <select className="w-full h-[44px] px-3 border border-card-border rounded-[8px] outline-none bg-white">
              <option>전체</option>
              <option>1학년</option>
              <option>2학년</option>
              <option>3학년</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-main">목표 요약</label>
          <input type="text" placeholder="학생들에게 보여질 핵심 목표를 적어주세요" className="w-full h-[44px] px-3 border border-card-border rounded-[8px] outline-none focus:border-primary" />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-text-main">검증 옵션</label>
          <div className="flex gap-2">
            <button className="flex-1 py-2 border border-primary bg-secondary-bg text-primary rounded-[8px] text-sm font-bold flex items-center justify-center gap-1">
              <Image size={16} /> 사진 허용
            </button>
            <button className="flex-1 py-2 border border-card-border text-muted-text rounded-[8px] text-sm flex items-center justify-center gap-1">
              <Film size={16} /> 영상 허용
            </button>
            <button className="flex-1 py-2 border border-card-border text-muted-text rounded-[8px] text-sm flex items-center justify-center gap-1">
              <File size={16} /> 문서 허용
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <label className="text-sm font-medium text-text-main">자동 검증 가중치</label>
          <div className="px-2">
            <input type="range" className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-text mt-1">
              <span>메타데이터</span>
              <span>AI 검사</span>
              <span>동료평가</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <label className="text-sm font-medium text-text-main">보상 설정</label>
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-reward-badge rounded-full flex items-center justify-center text-xl cursor-pointer">🏅</div>
            <div className="flex-1">
              <input type="text" placeholder="배지 이름" className="w-full h-[44px] px-3 border border-card-border rounded-[8px] mb-2" />
              <input type="number" placeholder="지급 포인트 (예: 500)" className="w-full h-[44px] px-3 border border-card-border rounded-[8px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>임시 저장</Button>
        <Button className="flex-1" onClick={() => onSubmit({ title: title || "새로운 챌린지" })}>공개하기</Button>
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

  // Shared State
  const [myClass, setMyClass] = useState<any | null>(null); // For teacher
  const [studentClassInfo, setStudentClassInfo] = useState<any | null>(null); // For student
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);

  // Data State - Registered Classes (Mock Database)
  const [registeredClasses, setRegisteredClasses] = useState<any[]>([]);

  const [classes, setClasses] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);

  // Growth Record State (Student's own data)
  const [myActivities, setMyActivities] = useState<any[]>([]);
  const [myBadges, setMyBadges] = useState<any[]>([]);
  const [myPointHistory, setMyPointHistory] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  // Teacher's view of student activities
  const [classActivities, setClassActivities] = useState<any[]>([]);

  useEffect(() => {
    // Initialize Data from Storage
    setRegisteredClasses(StorageService.getRegisteredClasses());
    setClasses(StorageService.getClasses());
    setChallenges(StorageService.getChallenges());

    // Check for existing session
    const user = StorageService.getCurrentUser();
    if (user) {
      handleLoginSuccess(user);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Load user specific data if needed
    // For now, we just load shared data. In a real app, we'd fetch user specific data here.

    // Mock loading user data
    if (user.role === UserType.STUDENT) {
      setMyActivities(StorageService.getActivities().filter(a => a.student === user.name));
      // ... load other student data
    }

    if (user.role === UserType.TEACHER) {
      setScreen(Screen.TEACHER_CLASSES);
    } else {
      setScreen(Screen.TEACHER_CLASSES); // Student also goes here initially
    }
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
    setMyClass(null);
  };

  const containerClass = "w-full h-[100dvh] md:max-w-[480px] md:h-[800px] md:my-8 md:rounded-[24px] md:shadow-2xl md:overflow-hidden bg-white mx-auto relative flex flex-col";

  const renderScreen = () => {
    switch (screen) {
      case Screen.WELCOME:
        return <WelcomeScreen onNext={() => setScreen(Screen.ACCOUNT_SELECTION)} />;

      case Screen.ACCOUNT_SELECTION: // Using this for Login
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setScreen(Screen.SIGNUP)}
          />
        );

      case Screen.SIGNUP:
        return (
          <SignupScreen
            onSignupSuccess={(user) => {
              showToast("회원가입을 축하합니다!", "success");
              handleLoginSuccess(user);
            }}
            onCancel={() => setScreen(Screen.ACCOUNT_SELECTION)}
          />
        );

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
                  showToast("유효하지 않은 초대 코드입니다. 다시 확인해주세요.", "error");
                }
              }
            }}
            onCreate={() => {
              setScreen(Screen.CREATE_CLASS);
            }}
          />
        );

      case Screen.CREATE_CLASS:
        return (
          <CreateClassScreen
            onSubmit={(classInfo) => {
              const newClass = { ...classInfo, schoolId: currentUser?.schoolId || '갓생고등학교' };
              setMyClass(newClass);
              StorageService.addRegisteredClass(newClass);
              setRegisteredClasses(prev => [...prev, newClass]);
              showToast(`${classInfo.name}이(가) 생성되었습니다!`, "success");
              setScreen(Screen.TEACHER_CLASSES);
              setActiveTab('classes');
            }}
          />
        );

      // Student Flows
      case Screen.DEMO_VIDEO:
        return <DemoVideoScreen classItem={selectedClass} onBack={() => setScreen(Screen.TEACHER_CLASSES)} onFinish={() => setScreen(Screen.COMMENT_PRACTICE)} />;

      case Screen.COMMENT_PRACTICE:
        return (
          <CommentPracticeScreen
            onSubmit={(score, msg) => {
              showToast(msg, score >= 2 ? "success" : "error");

              const earnedPoints = score === 3 ? 100 : score === 2 ? 50 : 10;
              setTotalPoints(prev => prev + earnedPoints);
              setMyPointHistory(prev => [{
                id: Date.now(),
                desc: '댓글 작성 연습',
                amount: earnedPoints,
                date: new Date().toLocaleDateString()
              }, ...prev]);

              setTimeout(() => setScreen(Screen.CHALLENGE_INVITE), 2000);
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
            onSubmit={() => {
              const challengeTitle = selectedChallenge ? selectedChallenge.title : "챌린지 인증";
              const date = new Date().toLocaleDateString();

              const newActivity: any = {
                id: Date.now().toString(),
                title: challengeTitle,
                date: date,
                score: 100,
                status: 'verified',
                student: currentUser?.name || '나',
                className: myClass ? myClass.name : undefined
              };
              setMyActivities(prev => [newActivity, ...prev]);
              StorageService.addActivity(newActivity);

              const newBadge: any = {
                id: Date.now(),
                name: '실천왕',
                icon: '🔥',
                date: date
              };
              setMyBadges(prev => [newBadge, ...prev]);

              const pointsEarned = 500;
              setTotalPoints(prev => prev + pointsEarned);
              setMyPointHistory(prev => [{
                id: Date.now(),
                desc: `${challengeTitle} 성공`,
                amount: pointsEarned,
                date: date
              }, ...prev]);

              showToast("인증 접수 완료. 자동 검증 중입니다.", "success");
              setTimeout(() => setScreen(Screen.REWARD), 1500);
            }}
          />
        );

      case Screen.REWARD:
        return (
          <RewardScreen
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
        const activitiesToShow = currentUser?.role === UserType.TEACHER ? classActivities : myActivities;
        return (
          <GrowthRecordScreen
            userType={currentUser?.role || UserType.STUDENT}
            myClass={myClass}
            onLogout={handleLogout}
            activities={activitiesToShow}
            badges={myBadges}
            pointHistory={myPointHistory}
            totalPoints={totalPoints}
            onExport={() => {
              showToast("구글 스프레드시트로 포트폴리오를 전송했습니다.", "success");
            }}
          />
        );

      // Teacher Flows
      case Screen.TEACHER_CLASSES:
        return (
          <TeacherClassListScreen
            myClass={myClass}
            classes={classes}
            onUpload={() => setScreen(Screen.UPLOAD_CLASS)}
            onLogout={handleLogout}
          />
        );

      case Screen.UPLOAD_CLASS:
        return (
          <UploadClassScreen
            onSubmit={(data) => {
              const newClass: any = {
                id: Date.now().toString(),
                title: data.title,
                date: new Date().toLocaleDateString(),
                type: data.type,
                description: '선생님이 업로드한 갓생클래스입니다.',
                url: data.url
              };
              setClasses([newClass, ...classes]);
              StorageService.addClass(newClass);
              showToast("갓생클래스가 업로드되었습니다.", "success");
              setScreen(Screen.TEACHER_CLASSES);
            }}
            onCancel={() => setScreen(Screen.TEACHER_CLASSES)}
          />
        );

      case Screen.TEACHER_CHALLENGES:
        return (
          <TeacherChallengeListScreen
            myClass={myClass}
            challenges={challenges}
            onCreate={() => setScreen(Screen.CREATE_CHALLENGE)}
            onLogout={handleLogout}
          />
        );

      case Screen.CREATE_CHALLENGE:
        return (
          <CreateChallengeScreen
            onSubmit={(data) => {
              const newChallenge: any = {
                id: Date.now().toString(),
                title: data.title,
                status: 'active',
                participants: 0,
                description: '새로운 챌린지입니다.'
              };
              setChallenges([newChallenge, ...challenges]);
              StorageService.addChallenge(newChallenge);
              showToast("챌린지가 공개되었습니다.", "success");
              setScreen(Screen.TEACHER_CHALLENGES);
            }}
            onCancel={() => setScreen(Screen.TEACHER_CHALLENGES)}
          />
        );

      case Screen.TEACHER_DASHBOARD:
        return <TeacherDashboardScreen myClass={myClass} onLogout={handleLogout} />;

      default:
        return <WelcomeScreen onNext={() => setScreen(Screen.ACCOUNT_SELECTION)} />;
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
  const showBottomNav = (isTeacherMainScreen || isStudentMainScreen) && currentUser?.role !== UserType.GUEST && currentUser !== null;

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