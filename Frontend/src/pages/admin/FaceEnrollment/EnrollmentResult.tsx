// interface Props {
//   result: { success: boolean; message: string; embedding_id?: number } | null;
// }

// export default function EnrollmentResult({ result }: Props) {
//   if (!result) return null;

//   return (
//     <div className={`mt-4 p-4 rounded-xl border ${result.success
//       ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400'
//       : 'bg-red-900/20 border-red-800 text-red-400'}`}>
//       <div className="flex items-center gap-2">
//         <span className="text-lg">{result.success ? '✅' : '❌'}</span>
//         <p className="font-medium">{result.message}</p>
//       </div>
//       {result.embedding_id && (
//         <p className="text-xs mt-1 opacity-70">Embedding ID: #{result.embedding_id}</p>
//       )}
//     </div>
//   );
// }


// import { useRef, useCallback, useState } from 'react';
// import Webcam from 'react-webcam';

// interface Props {
//   onCapture: (base64: string) => void;
//   isCapturing: boolean;
//   mode?: 'single' | 'multi';
// }

// export default function WebcamCapture({ onCapture, isCapturing, mode = 'single' }: Props) {
//   const webcamRef = useRef<Webcam>(null);
//   const [hasCamera, setHasCamera] = useState(true);

//   const capture = useCallback(() => {
//     const screenshot = webcamRef.current?.getScreenshot();
//     if (screenshot) {
//       const base64 = screenshot.split(',')[1];
//       onCapture(base64);
//     }
//   }, [onCapture]);

//   if (!hasCamera) {
//     return (
//       <div className="flex items-center justify-center bg-surface rounded-xl h-64 border border-surface-border">
//         <p className="text-slate-500 text-sm">Camera not available</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       <div className="relative rounded-xl overflow-hidden border border-surface-border bg-black aspect-video">
//         <Webcam
//           ref={webcamRef}
//           screenshotFormat="image/jpeg"
//           videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
//           onUserMediaError={() => setHasCamera(false)}
//           className="w-full h-full object-cover"
//         />

//         {/* Loading overlay */}
//         {isCapturing && (
//           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
//             <div className="animate-spin rounded-full border-4 border-white border-t-transparent w-10 h-10" />
//           </div>
//         )}

//         {/* Single face — oval guide */}
//         {mode === 'single' && !isCapturing && (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <div className="w-40 h-48 border-2 border-primary-400/60 rounded-full" />
//           </div>
//         )}

//         {/* Multi face — corner bracket guides */}
//         {mode === 'multi' && !isCapturing && (
//           <div className="absolute inset-0 pointer-events-none">
//             <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary-400/80 rounded-tl" />
//             <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-400/80 rounded-tr" />
//             <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-400/80 rounded-bl" />
//             <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary-400/80 rounded-br" />
//             <div className="absolute bottom-6 left-0 right-0 flex justify-center">
//               <span className="text-xs text-primary-300/80 bg-black/40 px-3 py-1 rounded-full">
//                 Fit all faces within frame
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       <button onClick={capture} disabled={isCapturing} className="btn-primary w-full">
//         {isCapturing ? 'Processing…' : '📸 Capture'}
//       </button>
//     </div>
//   );
// }



```tsx
interface EnrollmentResultData {
  success: boolean;
  message: string;
  embedding_id?: number;
}

interface Props {
  result: EnrollmentResultData | null;
}

export default function EnrollmentResult({ result }: Props) {
  if (!result) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        result.success
          ? 'border-emerald-800/50 bg-emerald-900/10'
          : 'border-red-800/50 bg-red-900/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">
          {result.success ? '✅' : '❌'}
        </span>

        <div>
          <p
            className={`font-medium ${
              result.success
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {result.success
              ? 'Enrollment Successful'
              : 'Enrollment Failed'}
          </p>

          <p className="text-slate-400 mt-1">
            {result.message}
          </p>

          {result.embedding_id && (
            <p className="text-xs text-slate-500 mt-1">
              Embedding ID: {result.embedding_id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```
