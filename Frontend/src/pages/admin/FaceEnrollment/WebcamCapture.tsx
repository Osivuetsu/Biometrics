import { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

interface FaceGuide {
  status: 'waiting' | 'too_small' | 'too_large' | 'off_center' | 'ready';
  message: string;
  color: string;
}

interface Props {
  onCapture: (base64: string) => void;
  isCapturing: boolean;
  mode?: 'single' | 'multi';
  onFaceDetected?: (detected: boolean) => void;
}

export default function WebcamCapture({ onCapture, isCapturing, mode = 'single', onFaceDetected }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [guide, setGuide] = useState<FaceGuide>({ status: 'waiting', message: 'Position your face in the oval', color: 'border-primary-400/60' });
  const [videoReady, setVideoReady] = useState(false);

  // Continuously analyze frames using canvas to estimate face presence/position
  useEffect(() => {
    if (!videoReady || mode !== 'single') return;

    const interval = setInterval(() => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Sample center region brightness to estimate face presence
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const sampleSize = 80;
      const centerData = ctx.getImageData(cx - sampleSize / 2, cy - sampleSize / 2, sampleSize, sampleSize);
      const edgeData = ctx.getImageData(0, 0, 60, 60);

      const avgBrightness = (data: ImageData) => {
        let sum = 0;
        for (let i = 0; i < data.data.length; i += 4) {
          sum += (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3;
        }
        return sum / (data.data.length / 4);
      };

      const centerBrightness = avgBrightness(centerData);
      const edgeBrightness = avgBrightness(edgeData);
      const contrast = Math.abs(centerBrightness - edgeBrightness);

      // Estimate sharpness via Laplacian variance on center patch
      const pixels = centerData.data;
      let variance = 0;
      const mean = centerBrightness;
      for (let i = 0; i < pixels.length; i += 4) {
        const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        variance += (gray - mean) ** 2;
      }
      variance /= pixels.length / 4;

      if (centerBrightness < 40) {
        setGuide({ status: 'waiting', message: '⚠ Too dark — improve lighting', color: 'border-amber-400/80' });
      } else if (centerBrightness > 220) {
        setGuide({ status: 'waiting', message: '⚠ Too bright — reduce lighting', color: 'border-amber-400/80' });
      } else if (variance < 80) {
        setGuide({ status: 'waiting', message: 'Hold still — image too blurry', color: 'border-red-400/80' });
      } else if (contrast < 15) {
        setGuide({ status: 'waiting', message: 'Move closer to the camera', color: 'border-slate-400/60' });
      } else {
        setGuide({ status: 'ready', message: '✓ Good — ready to capture', color: 'border-emerald-400/80' });
        onFaceDetected?.(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [videoReady, mode, onFaceDetected]);

  const capture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      const base64 = screenshot.split(',')[1];
      onCapture(base64);
    }
  }, [onCapture]);

  if (!hasCamera) {
    return (
      <div className="flex items-center justify-center bg-surface rounded-xl h-64 border border-surface-border">
        <p className="text-slate-500 text-sm">Camera not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* FIXED: 4:3 aspect ratio to match actual camera output — no cropping */}
      <div className="relative rounded-xl overflow-hidden border border-surface-border bg-black" style={{ aspectRatio: '4/3' }}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
          onUserMediaError={() => setHasCamera(false)}
          onLoadedMetadata={() => setVideoReady(true)}
          className="w-full h-full object-fill"
        />

        {/* Hidden canvas for frame analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full border-4 border-white border-t-transparent w-10 h-10 mx-auto mb-2" />
              <p className="text-white text-sm">Processing…</p>
            </div>
          </div>
        )}

        {/* Single mode — dynamic oval guide */}
        {mode === 'single' && !isCapturing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className={`w-40 h-48 border-2 ${guide.color} rounded-full transition-colors duration-300`} />
          </div>
        )}

        {/* Multi mode — corner brackets, full frame */}
        {mode === 'multi' && !isCapturing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary-400/80 rounded-tl" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary-400/80 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary-400/80 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary-400/80 rounded-br" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <span className="text-xs text-primary-300/80 bg-black/50 px-3 py-1 rounded-full">
                Fit all faces within frame
              </span>
            </div>
          </div>
        )}

        {/* Guide status badge — single mode only */}
        {mode === 'single' && !isCapturing && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className={`text-xs px-3 py-1 rounded-full bg-black/50 transition-colors duration-300 ${
              guide.status === 'ready' ? 'text-emerald-400' :
              guide.status === 'waiting' && guide.color.includes('amber') ? 'text-amber-400' :
              guide.color.includes('red') ? 'text-red-400' : 'text-slate-300'
            }`}>
              {guide.message}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={capture}
        disabled={isCapturing}
        className="btn-primary w-full">
        {isCapturing ? 'Processing…' : '📸 Capture'}
      </button>
    </div>
  );
}
