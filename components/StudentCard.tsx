import React from 'react';
import { User, Trophy, Plus, Minus } from 'lucide-react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onSelect: (student: Student) => void;
  rank: number;
}

const AVATAR_COLORS = [
  'bg-red-200 text-red-700',
  'bg-blue-200 text-blue-700',
  'bg-green-200 text-green-700',
  'bg-yellow-200 text-yellow-700',
  'bg-purple-200 text-purple-700',
  'bg-pink-200 text-pink-700',
];

export const StudentCard: React.FC<StudentCardProps> = ({ student, onSelect, rank }) => {
  const colorIndex = parseInt(student.avatarSeed) % AVATAR_COLORS.length;
  const colorClass = AVATAR_COLORS[colorIndex];

  return (
    <div 
      onClick={() => onSelect(student)}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center cursor-pointer transition-all hover:shadow-md hover:scale-105 relative overflow-hidden group"
    >
      {/* Rank Badge */}
      {rank <= 3 && (
        <div className={`absolute top-3 right-3 p-1 rounded-full ${rank === 1 ? 'bg-yellow-100 text-yellow-600' : rank === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
          <Trophy size={16} />
        </div>
      )}

      {/* Avatar */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-2xl font-bold ${colorClass}`}>
        {student.name.charAt(0)}
      </div>

      <h3 className="text-lg font-semibold text-slate-800 text-center">{student.name}</h3>
      
      <div className="mt-3 flex items-center gap-2">
        <span className={`text-3xl font-bold ${student.points >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
          {student.points}
        </span>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Points</span>
      </div>

      <div className="mt-4 w-full opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
        <button className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
          Manage Points
        </button>
      </div>
    </div>
  );
};
