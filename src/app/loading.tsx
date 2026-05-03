export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: 'rgba(249,115,22,0.15)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#f97316' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
        Loading VoteSaathi…
      </p>
    </div>
  );
}
