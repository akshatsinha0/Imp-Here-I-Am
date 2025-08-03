import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
const Auth = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [authType, setAuthType] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const sendWelcomeEmail = async (email: string, fullName: string) => {
    try {
      await fetch(
        "https://cktwbottjgkdjhiithgp.functions.supabase.co/send-welcome-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, fullName }),
        }
      );
    } catch (e) {
      console.error("Error sending welcome email:", e);
    }
  };
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, []);
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(false);
    if (!email) {
      toast({ title: "Please enter your email." });
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message });
    } else {
      setForgotSent(true);
      toast({ title: "Password reset email sent!", description: "Check your inbox for instructions." });
    }
  };
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!email || !password || (authType === "signup" && !fullName)) {
      toast({ title: "Please fill all fields." });
      setLoading(false);
      return;
    }
    if (authType === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        toast({ title: error.message });
      } else {
        navigate("/");
      }
    } else {
      const redirectUrl = `${window.location.origin}/verify`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: redirectUrl,
        },
      });
      setLoading(false);
      if (error) {
        toast({ title: error.message });
      } else {
        toast({
          title: "Sign up successful",
          description: "Check your email to confirm your registration.",
        });
        setAuthType("signin");
        sendWelcomeEmail(email, fullName);
      }
    }
  };
  const colorfulBg =
    "bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 dark:from-blue-900 dark:via-fuchsia-900 dark:to-amber-800";
  return (
    <div
      className={"flex min-h-screen items-center justify-center " + colorfulBg + " transition-colors duration-500"}
      style={{ backgroundAttachment: "fixed" }}
    >
      <div className="flex w-full max-w-6xl mx-auto bg-white/90 dark:bg-card/90 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
            alt="Person using laptop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-yellow-400/20"></div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <form
            onSubmit={showForgot ? handleForgot : handleAuth}
            className="relative bg-transparent flex flex-col gap-6 w-full max-w-md"
          >
            <div className="absolute -inset-1 rounded-3xl pointer-events-none z-0 bg-gradient-to-tr from-pink-200/40 via-purple-200/40 to-yellow-200/40 blur-lg opacity-60"></div>
            <h2 className="relative z-10 text-3xl font-black tracking-tight text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-yellow-500 bg-clip-text text-center drop-shadow-glow animate-scale-in">
              {showForgot
                ? "Forgot Password"
                : authType === "signin"
                ? "Sign In"
                : "Sign Up"}
            </h2>
            <div className="flex flex-col gap-3 relative z-10">
              {!showForgot && authType === "signup" && (
                <Input
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={loading}
                  className={"shadow-none border-pink-300 focus:border-purple-400 text-base"}
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className={"shadow-none border-pink-300 focus:border-purple-400 text-base"}
              />
              {!showForgot && (
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    minLength={6}
                    autoComplete={
                      authType === "signin" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className={
                      "shadow-none border-pink-300 focus:border-purple-400 text-base pr-10"
                    }
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>
            {!showForgot && authType === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setForgotSent(false);
                }}
                className="text-sm text-purple-700 hover:underline z-10 text-left"
                style={{ marginTop: "-14px" }}
                tabIndex={-1}
                disabled={loading}
              >
                Forgot password?
              </button>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-1 relative z-10 w-full text-lg font-bold rounded-xl bg-gradient-to-tr from-purple-500 via-pink-400 to-yellow-400 hover:from-purple-600 hover:to-yellow-500 hover:scale-105 active:scale-100 transition-all shadow-xl drop-shadow-glow"
              disabled={loading}
            >
              {loading
                ? showForgot
                  ? "Sending..."
                  : authType === "signin"
                  ? "Signing In..."
                  : "Signing Up..."
                : showForgot
                ? forgotSent
                  ? "Sent!"
                  : "Send Reset Link"
                : authType === "signin"
                ? "Sign In"
                : "Sign Up"}
            </Button>
            {!showForgot && (
              <Button
                type="button"
                variant="ghost"
                className="relative z-10 text-xs text-purple-600 hover:text-fuchsia-600 transition-colors"
                onClick={() => setAuthType(a => (a === "signin" ? "signup" : "signin"))}
                disabled={loading}
              >
                {authType === "signin"
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            )}
            {showForgot && (
              <Button
                type="button"
                variant="ghost"
                className="relative z-10 text-xs text-purple-600 hover:text-fuchsia-600 transition-colors"
                onClick={() => {
                  setShowForgot(false);
                  setForgotSent(false);
                }}
                disabled={loading}
              >
                Back to {authType === "signin" ? "Sign In" : "Sign Up"}
              </Button>
            )}
            {showForgot && forgotSent && (
              <div className="text-green-700 text-sm mt-1 text-center z-10 font-semibold">
                Password reset link sent! Please check your email.
              </div>
            )}
          </form>
        </div>
      </div>
      <style>
        {`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 12px #d946ef) drop-shadow(0 0 30px #fcd34d70);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.75,.53,.37,1.33) both;}
        @keyframes scale-in {
          from { transform: scale(0.97); opacity: 0.5;}
          to { transform: scale(1); opacity: 1;}
        }
        .animate-scale-in { animation: scale-in 0.55s cubic-bezier(.31,1.27,.82,1.06) both;}
        `}
      </style>
    </div>
  );
};
export default Auth;