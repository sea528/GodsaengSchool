import React from 'react';
import { X, Hand, Users, BookOpen, Heart, Megaphone, Clock, FileWarning, Star } from 'lucide-react';
import { PointReason, Student } from '../types';
import { POSITIVE_REASONS, NEGATIVE_REASONS } from '../constants';

interface ActionModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onAward: (amount: number, reason: string) => void;
}

const IconMap: Record<string, React.ReactNode> = {
  Hand: <Hand size={20} />,
  Users: <Users size={20} />,
  BookOpen: <BookOpen size={20} />,
  Heart: <Heart size={20} />,
  Megaphone: <Megaphone size={20} />,
  Clock: <Clock size={20} />,
  FileWarning: <FileWarning size={20} />,
};

export const ActionModal: React.FC<ActionModalProps> = ({ student, isOpen, onClose, onAward }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Award {student.name}</h2>
              <p className="text-sm text-slate-500">Select an action below</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Positive</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {POSITIVE_REASONS.map((reason) => (
              <button
                key={reason.id}
                onClick={() => onAward(reason.value, reason.label)}
                className={`${reason.color} p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-80 transition-opacity text-center`}
              >
                {IconMap[reason.icon] || <Star size={20} />}
                <span className="font-semibold text-sm">{reason.label}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">+{reason.value}</span>
              </button>
            ))}
          </div>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Needs Improvement</h3>
          <div className="grid grid-cols-2 gap-3">
            {NEGATIVE_REASONS.map((reason) => (
              <button
                key={reason.id}
                onClick={() => onAward(reason.value, reason.label)}
                className={`${reason.color} p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-80 transition-opacity text-center`}
              >
                {IconMap[reason.icon] || <Star size={20} />}
                <span className="font-semibold text-sm">{reason.label}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">{reason.value}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
