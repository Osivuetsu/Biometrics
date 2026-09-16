import { useState, useRef } from 'react';
import { useStudents } from '@/hooks';
import { useUiStore } from '@/store/uiStore';
import { PageHeader } from '@/components/ui';
import WebcamCapture from './WebcamCapture';
import EnrollmentResult from './EnrollmentResult';
import api from '@/services/api';

const REQUIRED_SHOTS = 5;
const SHOT_LABELS = [
  'Looking straight ahead',
  'Slightly left',
  'Slightly right',
  'Slightly up',
  'Natural expression',
];

export default function FaceEnrollment() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [currentShot, setCurrentShot] = useState(0);
  const { data: students } = useStudents({ limit: 100 });
  const addToast = useUiStore((s) => s.addToast);

  const handleCapture = (base64: string) => {
    if (capturedImages.length >= REQUIRED_SHOTS) return;
    const next = [...capturedImages, base64];
    setCapturedImages(next);
    setCurrentShot(next.length);
    if (next.length < REQUIRED_SHOTS) {
      addToast(`Shot ${next.length}/${REQUIRED_SHOTS} captured — now: ${SHOT_LABELS[next.length]}`, 'info');
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudentId || capturedImages.length < REQUIRED_SHOTS) return;
    setIsEnrolling(true);
    setResult(null);
    try {
      // Use multi-image enrollment endpoint
      const res = await api.post('/recognition/enroll/multi', {
        student_id: selectedStudentId,
        images: capturedImages,
      });
      setResult({
        success: true,
        message: `Face enrolled from ${REQUIRED_SHOTS} images`,
        embedding_id: res.data.data?.embedding_id,
      });
      addToast('Enrollment successful', 'success');
    } catch (e: any) {
      setResult({ success: false, message: e.response?.data?.message || 'Enrollment failed' });
      addToast('Enrollment failed', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleReset = () => {
    setCapturedImages([]);
    setCurrentShot(0);
    setResult(null);
  };

  const allCaptured = capturedImages.length >= REQUIRED_SHOTS;

  return (
    <div>
      <PageHeader title="Face Enrollment" subtitle="Register student biometric data — 5 shots required" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — student + progress */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="text-base font-semibold text-slate-200">Select Student</h2>
            <select className="input" value={selectedStudentId ?? ''} onChange={(e) => {
              setSelectedStudentId(parseInt(e.target.value));
              handleReset();
            }}>
              <option value="">Choose a student…</option>
              {students?.data?.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.matric_no} — {s.name}
                </option>
              ))}
            </select>

            {selectedStudentId && (() => {
              const s = students?.data?.find((st) => st.student_id === selectedStudentId);
              return s ? (
                <div className="bg-primary-900/20 border border-primary-800/50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-slate-200">{s.name}</p>
                  <p className="text-slate-400">{s.matric_no} · {s.department} · {s.level}L</p>
                </div>
              ) : null;
            })()}
          </div>

          {/* Shot progress */}
          {selectedStudentId && (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Capture Progress</h3>
                <span className="text-xs text-slate-400">{capturedImages.length}/{REQUIRED_SHOTS} shots</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${(capturedImages.length / REQUIRED_SHOTS) * 100}%` }}
                />
              </div>

              {/* Shot list */}
              <div className="space-y-1.5">
                {SHOT_LABELS.map((label, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${
                    i < capturedImages.length
                      ? 'text-emerald-400'
                      : i === capturedImages.length
                      ? 'text-primary-400 font-medium'
                      : 'text-slate-600'
                  }`}>
                    <span>{i < capturedImages.length ? '✓' : i === capturedImages.length ? '→' : '○'}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Current instruction */}
              {!allCaptured && (
                <div className="bg-primary-900/20 border border-primary-800/30 rounded-lg p-2 text-center">
                  <p className="text-xs text-primary-300">
                    Next: <span className="font-medium">{SHOT_LABELS[capturedImages.length]}</span>
                  </p>
                </div>
              )}

              {/* Enroll button — appears when all shots captured */}
              {allCaptured && !result && (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="btn-primary w-full">
                  {isEnrolling ? 'Enrolling…' : `✓ Enroll with ${REQUIRED_SHOTS} Images`}
                </button>
              )}

              {allCaptured && (
                <button onClick={handleReset} className="btn-secondary w-full text-sm">
                  Retake All Shots
                </button>
              )}
            </div>
          )}

          <EnrollmentResult result={result} />
        </div>

        {/* Right — camera */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-200 mb-1">Webcam Capture</h2>
          {!allCaptured && capturedImages.length < REQUIRED_SHOTS && (
            <p className="text-xs text-slate-500 mb-3">
              Shot {capturedImages.length + 1}/{REQUIRED_SHOTS}: <span className="text-primary-400">{SHOT_LABELS[capturedImages.length]}</span>
            </p>
          )}

          {!selectedStudentId ? (
            <div className="flex items-center justify-center h-48 border border-dashed border-surface-border rounded-xl">
              <p className="text-slate-500 text-sm">Select a student first</p>
            </div>
          ) : allCaptured ? (
            <div className="flex flex-col items-center justify-center h-48 border border-emerald-800/50 bg-emerald-900/10 rounded-xl">
              <span className="text-3xl mb-2">✅</span>
              <p className="text-emerald-400 font-medium">All {REQUIRED_SHOTS} shots captured</p>
              <p className="text-xs text-slate-400 mt-1">Click enroll or retake shots</p>
            </div>
          ) : (
            <WebcamCapture
              onCapture={handleCapture}
              isCapturing={isEnrolling}
              mode="single"
            />
          )}
        </div>
      </div>
    </div>
  );
}
