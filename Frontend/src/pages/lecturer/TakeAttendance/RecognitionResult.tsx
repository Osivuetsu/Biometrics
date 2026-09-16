import type { RecognitionResult } from '@/types';
import { format } from 'date-fns';

export default function RecognitionResultPanel({ result }: { result: RecognitionResult | null }) {
  if (!result) return null;

  if (!result.matched) {
    return (
      <div className="p-4 rounded-xl bg-red-900/20 border border-red-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-semibold text-red-400">No Match Found</p>
            <p className="text-xs text-red-400/70 mt-0.5">{result.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.already_marked) {
    return (
      <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-400">Already Marked</p>
            <p className="text-sm text-slate-300 mt-0.5">{result.name} — {result.matric_no}</p>
            <p className="text-xs text-amber-400/70">Attendance already recorded today</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800">
      <div className="flex items-start gap-3">
        <span className="text-3xl">✅</span>
        <div className="flex-1">
          <p className="font-bold text-emerald-400 text-lg">{result.name}</p>
          <p className="text-sm text-slate-300">{result.matric_no}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span>Distance: <span className="font-mono text-slate-300">{result.distance_score?.toFixed(4)}</span></span>
            {result.attendance && (
              <span>Time: <span className="font-mono text-slate-300">
                {format(new Date(result.attendance.timestamp), 'HH:mm:ss')}
              </span></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
