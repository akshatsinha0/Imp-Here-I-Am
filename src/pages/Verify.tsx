import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function Verify() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("supabase.auth.token")) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-400 to-yellow-200 dark:from-blue-900 dark:via-fuchsia-900 dark:to-amber-800 relative overflow-hidden p-mobile safe-area-inset">
      <div className="absolute -inset-0 bg-gradient-to-r from-white/60 to-yellow-50/30 dark:from-card/80 dark:to-amber-950/5 blur-3xl z-0 pointer-events-none"></div>
      <main className="relative z-10 w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-white/80 dark:bg-card/90 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col items-center gap-4 sm:gap-6 backdrop-blur-lg mx-4">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="sm:w-12 sm:h-12 mb-1 animate-bounce">
          <circle cx="12" cy="12" r="10" fill="#39A7FF" />
          <path d="M8 13l2.8 2.8 5.2-5.6" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-responsive-xl font-bold text-transparent bg-gradient-to-r from-purple-700 via-blue-600 to-yellow-500 bg-clip-text text-center mb-1 drop-shadow-glow">
          Email Verified!
        </h2>
        <p className="text-responsive-base text-gray-900 dark:text-gray-200 text-center">
          <span className="block">Success! Your email has been verified.</span>
          <span className="block mt-2">You can now log in with your credentials and start using the app.</span>
        </p>
        <Button
          size="lg"
          className="mt-3 w-full sm:w-auto bg-gradient-to-tr from-blue-500 via-pink-400 to-yellow-400 hover:from-blue-600 hover:to-yellow-500 text-white font-semibold text-responsive-base px-6 py-3 rounded-xl shadow-xl transition-all touch-target"
          onClick={() => navigate("/auth")}
        >
          Go to Log In
        </Button>
      </main>
      <style>{`
        .drop-shadow-glow { filter: drop-shadow(0 0 10px #39A7FF88); }
      `}</style>
    </div>
  );
}