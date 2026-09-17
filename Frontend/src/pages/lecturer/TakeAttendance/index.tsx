import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useCourses } from '@/hooks';
import { useUiStore } from '@/store/uiStore';
import { PageHeader } from '@/components/ui';
import RecognitionResultPanel from './RecognitionResult';
import api from '@/services/api';
import type { RecognitionResult } from '@/types';

type Mode = 'single' | 'confirmed' | 'multi';

const CONFIRMATION_FRAMES = 3;

interface MultiResult {
  faces_detected: number;
  matched_count: number;
  unmatched_count: number;
  results: Array<RecognitionResult & { already_marked?: boolean }>;
}

interface ConfirmedResult {
  matched: boolean;
  confirmed: boolean;
  student_id?: number;
  name?: string;
  matric_no?: string;
  distance_score?: number;
  votes?: number;
  frames_analyzed?: number;
  message?: string;
  already_marked?: boolean;
  attendance?: any;
}

export default function TakeAttendance() {
  const webcamRef = useRef<Webcam>(null);

  const [courseId, setCourseId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('confirmed');

  const [singleResult, setSingleResult] = useState<RecognitionResult | null>(null);
  const [confirmedResult, setConfirmedResult] = useState<ConfirmedResult | null>(null);
  const [multiResult, setMultiResult] = useState<MultiResult | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturingFrames, setIsCapturingFrames] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState(0);

  const [hasCamera, setHasCamera] = useState(true);

  // Biometric engine status
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isWakingEngine, setIsWakingEngine] = useState(true);

  const { data: courses } = useCourses({ limit: 100 });
  const addToast = useUiStore((s) => s.addToast);

  /**
   * Wake the biometric engine as soon as the Take Attendance
   * page is opened.
   *
   * This is useful because Render free services can sleep
   * after being inactive.
   */
  useEffect(() => {
    let cancelled = false;

    const wakeEngine = async () => {
      try {
        setIsWakingEngine(true);

        await api.get('/recognition/wake');

        if (!cancelled) {
          setIsEngineReady(true);
          addToast('Biometric system ready', 'success');
        }
      } catch (error: any) {
        console.error('Failed to wake biometric engine:', error);

        if (!cancelled) {
          setIsEngineReady(false);
          addToast(
            error.response?.data?.message ||
              'Biometric system is still starting. Please try again.',
            'error'
          );
        }
      } finally {
        if (!cancelled) {
          setIsWakingEngine(false);
        }
      }
    };

    wakeEngine();

    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const captureFrame = useCallback((): string | null => {
    const screenshot = webcamRef.current?.getScreenshot();

    if (!screenshot) return null;

    return screenshot.split(',')[1];
  }, []);

  // Single frame capture
  const handleSingleCapture = async () => {
    if (!courseId) return;

    const frame = captureFrame();

    if (!frame) return;

    setIsProcessing(true);
    setSingleResult(null);

    try {
      const res = await api.post('/recognition/recognize', {
        image: frame,
        course_id: courseId,
      });

      setSingleResult(res.data.data);
    } catch (e: any) {
      addToast(
        e.response?.data?.message || 'Recognition failed',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Multi-frame confirmed capture
  const handleConfirmedCapture = async () => {
    if (!courseId) return;

    setIsCapturingFrames(true);
    setConfirmedResult(null);
    setCapturedFrames(0);

    const frames: string[] = [];

    // Capture frames with 400ms gap between them
    for (let i = 0; i < CONFIRMATION_FRAMES; i++) {
      await new Promise((r) => setTimeout(r, 400));

      const frame = captureFrame();

      if (frame) {
        frames.push(frame);
        setCapturedFrames(i + 1);
      }
    }

    setIsCapturingFrames(false);

    if (frames.length === 0) {
      addToast('Could not capture frames', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await api.post(
        '/recognition/recognize/confirmed',
        {
          images: frames,
          course_id: courseId,
        }
      );

      const result = res.data.data;

      setConfirmedResult(result);

      if (result.confirmed) {
        addToast(
          `✓ ${result.name} confirmed (${result.votes}/${CONFIRMATION_FRAMES} frames)`,
          'success'
        );
      } else if (result.matched) {
        addToast(
          `Partial match — ${result.message}`,
          'info'
        );
      } else {
        addToast('No match found', 'info');
      }
    } catch (e: any) {
      addToast(
        e.response?.data?.message || 'Recognition failed',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Multi-face capture
  const handleMultiCapture = async () => {
    if (!courseId) return;

    const frame = captureFrame();

    if (!frame) return;

    setIsProcessing(true);
    setMultiResult(null);

    try {
      const res = await api.post(
        '/recognition/recognize/multi',
        {
          image: frame,
          course_id: courseId,
        }
      );

      setMultiResult(res.data.data);

      const matched = res.data.data.matched_count;

      addToast(
        `${matched} student${matched !== 1 ? 's' : ''} recognized`,
        matched > 0 ? 'success' : 'info'
      );
    } catch (e: any) {
      addToast(
        e.response?.data?.message || 'Recognition failed',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = () => {
    // Prevent capture while the biometric engine is waking
    if (!isEngineReady || isWakingEngine) {
      addToast(
        'Biometric system is still starting. Please wait a moment.',
        'info'
      );
      return;
    }

    if (mode === 'single') {
      handleSingleCapture();
    } else if (mode === 'confirmed') {
      handleConfirmedCapture();
    } else {
      handleMultiCapture();
    }
  };

  const isLoading = isProcessing || isCapturingFrames;

  return (
    <div>
      <PageHeader
        title="Take Attendance"
        subtitle="Face recognition attendance marking"
      />

      {/* Biometric engine status */}
      <div
        className={`mb-4 rounded-lg border px-4 py-3 text-sm flex items-center gap-3 ${
          isWakingEngine
            ? 'border-amber-800/50 bg-amber-900/10 text-amber-400'
            : isEngineReady
            ? 'border-emerald-800/50 bg-emerald-900/10 text-emerald-400'
            : 'border-red-800/50 bg-red-900/10 text-red-400'
        }`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isWakingEngine
              ? 'bg-amber-400 animate-pulse'
              : isEngineReady
              ? 'bg-emerald-400'
              : 'bg-red-400'
          }`}
        />

        {isWakingEngine && 'Preparing biometric system…'}
        {!isWakingEngine && isEngineReady && 'Biometric system ready'}
        {!isWakingEngine &&
          !isEngineReady &&
          'Biometric system unavailable'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left panel */}
        <div className="space-y-4">

          <div className="card">
            <label className="label">Select Course</label>

            <select
              className="input"
              value={courseId ?? ''}
              onChange={(e) => {
                setCourseId(parseInt(e.target.value));
                setSingleResult(null);
                setConfirmedResult(null);
                setMultiResult(null);
              }}
            >
              <option value="">Choose a course…</option>

              {courses?.data?.map((c) => (
                <option
                  key={c.course_id}
                  value={c.course_id}
                >
                  {c.course_code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          {courseId && (
            <div className="card">
              <p className="label mb-2">
                Recognition Mode
              </p>

              <div className="grid grid-cols-3 gap-2">
                {([
                  {
                    id: 'single',
                    label: '👤 Single',
                    desc: 'One frame, one person',
                  },
                  {
                    id: 'confirmed',
                    label: '✓ Confirmed',
                    desc: `${CONFIRMATION_FRAMES} frames must agree`,
                  },
                  {
                    id: 'multi',
                    label: '👥 Multi',
                    desc: 'All faces in frame',
                  },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      setSingleResult(null);
                      setConfirmedResult(null);
                      setMultiResult(null);
                    }}
                    className={`p-2 rounded-lg text-xs font-medium border transition-colors text-center ${
                      mode === m.id
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-surface-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{m.label}</div>

                    <div
                      className={`mt-0.5 font-normal ${
                        mode === m.id
                          ? 'text-primary-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {mode === 'single' && singleResult && (
            <RecognitionResultPanel
              result={singleResult}
            />
          )}

          {mode === 'confirmed' && confirmedResult && (
            <div
              className={`card border ${
                confirmedResult.confirmed
                  ? 'border-emerald-800/50 bg-emerald-900/10'
                  : confirmedResult.matched
                  ? 'border-amber-800/50 bg-amber-900/10'
                  : 'border-red-800/50 bg-red-900/10'
              }`}
            >
              <div className="flex items-start gap-3">

                <span className="text-2xl">
                  {confirmedResult.confirmed
                    ? '✅'
                    : confirmedResult.matched
                    ? '⚠️'
                    : '❌'}
                </span>

                <div className="flex-1">

                  {confirmedResult.matched ? (
                    <>
                      <p
                        className={`font-bold text-lg ${
                          confirmedResult.confirmed
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {confirmedResult.name}
                      </p>

                      <p className="text-sm text-slate-300">
                        {confirmedResult.matric_no}
                      </p>

                      <div className="flex gap-4 mt-2 text-xs text-slate-400">
                        <span>
                          Frames:{' '}
                          <span className="text-slate-200">
                            {confirmedResult.votes}/
                            {CONFIRMATION_FRAMES}
                          </span>
                        </span>

                        <span>
                          Distance:{' '}
                          <span className="font-mono text-slate-200">
                            {confirmedResult.distance_score?.toFixed(4)}
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="font-medium text-red-400">
                      {confirmedResult.message}
                    </p>
                  )}

                  {!confirmedResult.confirmed &&
                    confirmedResult.matched && (
                      <p className="text-xs text-amber-400/80 mt-1">
                        {confirmedResult.message}
                      </p>
                    )}

                  {confirmedResult.already_marked && (
                    <p className="text-xs text-amber-400 mt-1">
                      Already marked today
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === 'multi' && multiResult && (
            <div className="card space-y-3">

              <div className="flex gap-6 pb-2 border-b border-surface-border">

                <div className="text-center">
                  <p className="text-xl font-bold text-slate-100">
                    {multiResult.faces_detected}
                  </p>
                  <p className="text-xs text-slate-500">
                    Detected
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-400">
                    {multiResult.matched_count}
                  </p>
                  <p className="text-xs text-slate-500">
                    Matched
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-red-400">
                    {multiResult.unmatched_count}
                  </p>
                  <p className="text-xs text-slate-500">
                    Unmatched
                  </p>
                </div>
              </div>

              {multiResult.results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    r.already_marked
                      ? 'bg-amber-900/10 border-amber-800/50'
                      : 'bg-emerald-900/10 border-emerald-800/50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-200">
                      {r.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {r.matric_no}
                    </p>
                  </div>

                  <div className="text-right">

                    {r.already_marked ? (
                      <span className="text-xs text-amber-400">
                        Already marked
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400">
                        ✓ Marked
                      </span>
                    )}

                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {r.distance_score?.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Camera panel */}
        <div className="card">

          <h2 className="text-base font-semibold text-slate-200 mb-1">
            Camera
          </h2>

          {mode === 'confirmed' && (
            <p className="text-xs text-slate-500 mb-3">
              Captures {CONFIRMATION_FRAMES} frames automatically — hold still
            </p>
          )}

          {!courseId ? (
            <div className="flex items-center justify-center h-64 border border-dashed border-surface-border rounded-xl">
              <p className="text-slate-500 text-sm">
                Select a course first
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {/* 4:3 camera preview */}
              <div
                className="relative rounded-xl overflow-hidden border border-surface-border bg-black"
                style={{ aspectRatio: '4/3' }}
              >

                {hasCamera ? (
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'user',
                      width: 640,
                      height: 480,
                    }}
                    onUserMediaError={() => setHasCamera(false)}
                    className="w-full h-full object-fill"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 text-sm">
                      Camera not available
                    </p>
                  </div>
                )}

                {/* Processing overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">

                    <div className="animate-spin rounded-full border-4 border-white border-t-transparent w-10 h-10 mb-3" />

                    {isCapturingFrames && (
                      <p className="text-white text-sm">
                        Frame {capturedFrames}/{CONFIRMATION_FRAMES}
                      </p>
                    )}

                    {isProcessing && !isCapturingFrames && (
                      <p className="text-white text-sm">
                        Analyzing…
                      </p>
                    )}
                  </div>
                )}

                {/* Frame capture progress */}
                {isCapturingFrames && (
                  <div className="absolute top-3 left-0 right-0 flex justify-center gap-2">

                    {Array.from({
                      length: CONFIRMATION_FRAMES,
                    }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full border border-white transition-colors ${
                          i < capturedFrames
                            ? 'bg-emerald-400'
                            : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Mode overlays */}
                {!isLoading && mode !== 'multi' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-48 border-2 border-primary-400/60 rounded-full" />
                  </div>
                )}

                {!isLoading && mode === 'multi' && (
                  <div className="absolute inset-0 pointer-events-none">

                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary-400/80 rounded-tl" />

                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-400/80 rounded-tr" />

                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-400/80 rounded-bl" />

                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary-400/80 rounded-br" />

                  </div>
                )}
              </div>

              <button
                onClick={handleCapture}
                disabled={
                  isLoading ||
                  !hasCamera ||
                  !isEngineReady ||
                  isWakingEngine
                }
                className="btn-primary w-full"
              >
                {isWakingEngine
                  ? '⏳ Preparing biometric system…'
                  : isCapturingFrames
                  ? `Capturing frame ${capturedFrames}/${CONFIRMATION_FRAMES}…`
                  : isProcessing
                  ? 'Analyzing…'
                  : '📸 Capture'}
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

