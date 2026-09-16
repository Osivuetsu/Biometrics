interface Props {
  result: { success: boolean; message: string; embedding_id?: number } | null;
}

export default function EnrollmentResult({ result }: Props) {
  if (!result) return null;

  return (
    <div className={`mt-4 p-4 rounded-xl border ${result.success
      ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400'
      : 'bg-red-900/20 border-red-800 text-red-400'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{result.success ? '✅' : '❌'}</span>
        <p className="font-medium">{result.message}</p>
      </div>
      {result.embedding_id && (
        <p className="text-xs mt-1 opacity-70">Embedding ID: #{result.embedding_id}</p>
      )}
    </div>
  );
}
