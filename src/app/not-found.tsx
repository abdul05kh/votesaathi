import Link from 'next/link';
import { Home, Vote } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-[120px] font-black leading-none mb-4"
        style={{ background: 'linear-gradient(135deg,#f97316,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
        Page Not Found
      </h2>
      <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--foreground-muted)' }}>
        This page doesn&apos;t exist. Let&apos;s get you back to learning about India&apos;s democratic process.
      </p>
      <div className="flex gap-3">
        <Link href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
          <Home size={16} />
          Go Home
        </Link>
        <Link href="/#practice-zone"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
          style={{ background: 'rgba(0,212,170,0.10)', border: '1px solid rgba(0,212,170,0.25)', color: '#00d4aa' }}>
          <Vote size={16} />
          Practice Voting
        </Link>
      </div>
    </div>
  );
}
