import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">404 — Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-md">
        The page or resource you are looking for does not exist in Lumer OS.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-full bg-zinc-900 text-white font-bold text-xs shadow-md hover:bg-zinc-800 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
