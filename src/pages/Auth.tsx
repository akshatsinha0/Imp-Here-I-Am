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
  return (
    <div
      className="flex min-h-screen items-center justify-center relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, rgb(116,42,100) 0%, rgb(181,17,99) 20%, rgb(54,51,106) 40%, rgb(81,70,119) 60%, rgb(202,12,112) 80%, rgb(96,39,176) 90%, rgb(6,119,144) 100%)',
        backgroundAttachment: "fixed" 
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 sphere-gradient animate-float-sphere-1 opacity-20"></div>
        <div className="absolute top-40 right-32 w-24 h-24 sphere-gradient-2 animate-float-sphere-2 opacity-25" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 sphere-gradient-3 animate-float-sphere-3 opacity-15" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 sphere-gradient animate-float-sphere-1 opacity-30" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 sphere-gradient-2 animate-float-sphere-2 opacity-20" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-18 h-18 sphere-gradient-3 animate-float-sphere-3 opacity-25" style={{ animationDelay: '5s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-14 h-14 sphere-gradient animate-float-sphere-1 opacity-15" style={{ animationDelay: '6s' }}></div>
        <div className="absolute top-1/4 right-1/6 w-22 h-22 sphere-gradient-2 animate-float-sphere-2 opacity-20" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/5 left-1/2 w-12 h-12 sphere-gradient-3 animate-float-sphere-3 opacity-30" style={{ animationDelay: '7s' }}></div>
        <div className="absolute bottom-1/5 left-1/2 w-10 h-10 sphere-gradient animate-float-sphere-1 opacity-25" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-1/2 left-1/12 w-8 h-8 sphere-gradient-2 animate-float-sphere-2 opacity-20" style={{ animationDelay: '4.5s' }}></div>
        <div className="absolute top-1/2 right-1/12 w-6 h-6 sphere-gradient-3 animate-float-sphere-3 opacity-35" style={{ animationDelay: '3.5s' }}></div>
        <div className="absolute top-1/6 right-1/3 w-4 h-4 sphere-gradient animate-float-sphere-1 opacity-40" style={{ animationDelay: '8s' }}></div>
        <div className="absolute bottom-1/6 left-1/3 w-5 h-5 sphere-gradient-2 animate-float-sphere-2 opacity-30" style={{ animationDelay: '9s' }}></div>
        <div className="absolute top-3/4 left-1/8 w-7 h-7 sphere-gradient-3 animate-float-sphere-3 opacity-25" style={{ animationDelay: '10s' }}></div>
        <div className="absolute bottom-1/4 right-1/8 w-9 h-9 sphere-gradient animate-float-sphere-1 opacity-20" style={{ animationDelay: '11s' }}></div>
      </div>
      <div className="flex w-full max-w-6xl mx-auto bg-white/90 dark:bg-card/90 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
            alt="Person using laptop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-yellow-400/20"></div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          <div className="absolute top-10 left-10 w-6 h-6 sphere-gradient animate-float-sphere-1 opacity-40" style={{ animationDelay: '12s' }}></div>
          <div className="absolute top-20 right-10 w-8 h-8 sphere-gradient-2 animate-float-sphere-2 opacity-35" style={{ animationDelay: '13s' }}></div>
          <div className="absolute bottom-10 left-10 w-5 h-5 sphere-gradient-3 animate-float-sphere-3 opacity-45" style={{ animationDelay: '14s' }}></div>
          <div className="absolute bottom-20 right-10 w-7 h-7 sphere-gradient animate-float-sphere-1 opacity-30" style={{ animationDelay: '15s' }}></div>
          
          <form
            onSubmit={showForgot ? handleForgot : handleAuth}
            className="relative bg-transparent flex flex-col gap-6 w-full max-w-md hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="absolute -inset-1 rounded-3xl pointer-events-none z-0 bg-gradient-to-tr from-blue-400/20 via-indigo-400/20 to-purple-400/20 blur-lg opacity-60 animate-pulse-slow"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-black tracking-tight text-transparent bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text drop-shadow-glow animate-scale-in">
                {showForgot
                  ? "Forgot Password"
                  : authType === "signin"
                  ? "Welcome Back"
                  : "Create Account"}
              </h2>
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              {!showForgot && authType === "signup" && (
                <Input
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={loading}
                  className={"shadow-none border-blue-300/50 focus:border-indigo-400 text-base hover:border-indigo-300/70 transition-colors bg-white/90 backdrop-blur-sm text-black"}
                  style={{ color: '#ff6600' }}
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className={"shadow-none border-blue-300/50 focus:border-indigo-400 text-base hover:border-indigo-300/70 transition-colors bg-white/90 backdrop-blur-sm text-black"}
                style={{ color: '#ff6600' }}
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
                      "shadow-none border-blue-300/50 focus:border-indigo-400 hover:border-indigo-300/70 text-base pr-10 transition-colors bg-white/90 backdrop-blur-sm text-black"
                    }
                    style={{ color: '#ff6600' }}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-indigo-600 hover:scale-110 transition-all"
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
                className="text-sm text-blue-300 hover:text-indigo-300 hover:underline z-10 text-left transition-colors"
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
              className="mt-1 relative z-10 w-full text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-100 transition-all shadow-xl group overflow-hidden"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
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
              </span>
            </Button>
            {!showForgot && (
              <Button
                type="button"
                variant="ghost"
                className="relative z-10 text-xs text-blue-300 hover:text-indigo-300 transition-colors"
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
                className="relative z-10 text-xs text-blue-300 hover:text-indigo-300 transition-colors"
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
              <div className="text-green-300 text-sm mt-1 text-center z-10 font-semibold">
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
        
        .sphere-gradient {
          border-radius: 50%;
          position: relative;
          background: 
            radial-gradient(ellipse at 25% 25%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 20%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(0, 0, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 30%, rgba(255, 255, 255, 0.05) 60%, rgba(0, 0, 0, 0.1) 100%);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 8px 25px rgba(0, 0, 0, 0.2),
            inset -15px -15px 30px rgba(0, 0, 0, 0.2),
            inset 15px 15px 30px rgba(255, 255, 255, 0.3),
            inset -5px -5px 15px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .sphere-gradient-2 {
          border-radius: 50%;
          position: relative;
          background: 
            radial-gradient(ellipse at 25% 25%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 20%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(0, 0, 0, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.03) 60%, rgba(0, 0, 0, 0.08) 100%);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.25),
            0 8px 25px rgba(0, 0, 0, 0.15),
            inset -15px -15px 30px rgba(0, 0, 0, 0.15),
            inset 15px 15px 30px rgba(255, 255, 255, 0.25),
            inset -5px -5px 15px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .sphere-gradient-3 {
          border-radius: 50%;
          position: relative;
          background: 
            radial-gradient(ellipse at 25% 25%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.25) 20%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(0, 0, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.02) 60%, rgba(0, 0, 0, 0.05) 100%);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 8px 25px rgba(0, 0, 0, 0.1),
            inset -15px -15px 30px rgba(0, 0, 0, 0.1),
            inset 15px 15px 30px rgba(255, 255, 255, 0.2),
            inset -5px -5px 15px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .sphere-gradient::before,
        .sphere-gradient-2::before,
        .sphere-gradient-3::before {
          content: '';
          position: absolute;
          top: 15%;
          left: 20%;
          width: 30%;
          height: 30%;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%);
          filter: blur(2px);
          pointer-events: none;
        }
        
        .sphere-gradient::after,
        .sphere-gradient-2::after,
        .sphere-gradient-3::after {
          content: '';
          position: absolute;
          bottom: 10%;
          right: 15%;
          width: 20%;
          height: 20%;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          filter: blur(1px);
          pointer-events: none;
        }
        
        @keyframes float-sphere-1 {
          0%, 100% { 
            transform: translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); 
            filter: brightness(1) blur(0px);
          }
          25% { 
            transform: translate3d(-25px, -35px, 15px) rotateX(20deg) rotateY(30deg) rotateZ(10deg) scale(1.05); 
            filter: brightness(1.1) blur(0.5px);
          }
          50% { 
            transform: translate3d(10px, -20px, -10px) rotateX(-15deg) rotateY(-20deg) rotateZ(-5deg) scale(0.95); 
            filter: brightness(0.9) blur(1px);
          }
          75% { 
            transform: translate3d(20px, -10px, 20px) rotateX(25deg) rotateY(15deg) rotateZ(15deg) scale(1.1); 
            filter: brightness(1.2) blur(0px);
          }
        }
        .animate-float-sphere-1 { 
          animation: float-sphere-1 12s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        @keyframes float-sphere-2 {
          0%, 100% { 
            transform: translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); 
            filter: brightness(1) blur(0px);
          }
          30% { 
            transform: translate3d(30px, -25px, 25px) rotateX(-25deg) rotateY(35deg) rotateZ(-10deg) scale(1.08); 
            filter: brightness(1.15) blur(0.3px);
          }
          60% { 
            transform: translate3d(-15px, -40px, -15px) rotateX(30deg) rotateY(-25deg) rotateZ(20deg) scale(0.92); 
            filter: brightness(0.85) blur(1.2px);
          }
          85% { 
            transform: translate3d(5px, -15px, 30px) rotateX(-10deg) rotateY(40deg) rotateZ(-15deg) scale(1.12); 
            filter: brightness(1.25) blur(0px);
          }
        }
        .animate-float-sphere-2 { 
          animation: float-sphere-2 15s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        @keyframes float-sphere-3 {
          0%, 100% { 
            transform: translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); 
            filter: brightness(1) blur(0px);
          }
          20% { 
            transform: translate3d(-20px, -30px, 35px) rotateX(35deg) rotateY(-40deg) rotateZ(25deg) scale(1.15); 
            filter: brightness(1.3) blur(0px);
          }
          45% { 
            transform: translate3d(25px, -15px, -20px) rotateX(-20deg) rotateY(45deg) rotateZ(-30deg) scale(0.88); 
            filter: brightness(0.8) blur(1.5px);
          }
          70% { 
            transform: translate3d(-10px, -35px, 10px) rotateX(15deg) rotateY(-15deg) rotateZ(35deg) scale(1.2); 
            filter: brightness(1.4) blur(0.2px);
          }
        }
        .animate-float-sphere-3 { 
          animation: float-sphere-3 18s ease-in-out infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        @keyframes sphere-glow-1 {
          0%, 100% { 
            box-shadow: 
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 8px 25px rgba(0, 0, 0, 0.2),
              inset -15px -15px 30px rgba(0, 0, 0, 0.2),
              inset 15px 15px 30px rgba(255, 255, 255, 0.3);
          }
          50% { 
            box-shadow: 
              0 30px 90px rgba(0, 0, 0, 0.4),
              0 15px 40px rgba(0, 0, 0, 0.3),
              inset -20px -20px 40px rgba(0, 0, 0, 0.3),
              inset 20px 20px 40px rgba(255, 255, 255, 0.4);
          }
        }
        
        @keyframes sphere-glow-2 {
          0%, 100% { 
            box-shadow: 
              0 20px 60px rgba(0, 0, 0, 0.25),
              0 8px 25px rgba(0, 0, 0, 0.15),
              inset -15px -15px 30px rgba(0, 0, 0, 0.15),
              inset 15px 15px 30px rgba(255, 255, 255, 0.25);
          }
          50% { 
            box-shadow: 
              0 30px 90px rgba(0, 0, 0, 0.35),
              0 15px 40px rgba(0, 0, 0, 0.25),
              inset -20px -20px 40px rgba(0, 0, 0, 0.25),
              inset 20px 20px 40px rgba(255, 255, 255, 0.35);
          }
        }
        
        @keyframes sphere-glow-3 {
          0%, 100% { 
            box-shadow: 
              0 20px 60px rgba(0, 0, 0, 0.2),
              0 8px 25px rgba(0, 0, 0, 0.1),
              inset -15px -15px 30px rgba(0, 0, 0, 0.1),
              inset 15px 15px 30px rgba(255, 255, 255, 0.2);
          }
          50% { 
            box-shadow: 
              0 30px 90px rgba(0, 0, 0, 0.3),
              0 15px 40px rgba(0, 0, 0, 0.2),
              inset -20px -20px 40px rgba(0, 0, 0, 0.2),
              inset 20px 20px 40px rgba(255, 255, 255, 0.3);
          }
        }
        
        .sphere-gradient { animation: sphere-glow-1 4s ease-in-out infinite; }
        .sphere-gradient-2 { animation: sphere-glow-2 5s ease-in-out infinite; }
        .sphere-gradient-3 { animation: sphere-glow-3 6s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};
export default Auth;