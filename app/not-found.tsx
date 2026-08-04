import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6 font-sans antialiased">
      <div className="max-w-[480px] w-full text-center space-y-6">
        <h1 className="text-3xl font-medium tracking-tight text-zinc-900">404</h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          The requested security module could not be located.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
