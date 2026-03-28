import { useState } from 'react';
import { useAuth } from '@insforge/react';
import { insforge } from '../lib/insforge';
import { LogIn, UserPlus, Mail, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({ 
        provider,
        redirectTo: window.location.origin
      });
      if (error) {
        setError(error.message);
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'OAuth failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await signIn(email, password);
        if (res && 'error' in res) {
          setError(res.error);
        }
      } else {
        const res = await signUp(email, password);
        if (res && 'error' in res) {
          setError(res.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 canvas-grid relative overflow-hidden px-4 py-12">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-slate-700 shadow-slate-950/80 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 rotate-3 transform transition-transform hover:rotate-6">
            <img
              src="/syncboard-icon.png"
              alt="SyncBoard"
              width={88}
              height={88}
              className="rounded-2xl object-cover shadow-xl shadow-indigo-950/60 ring-1 ring-white/10"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">SyncBoard</h1>
          <p className="text-slate-400 mt-2 text-center">
            {isLogin ? 'Welcome back! Ready to sync?' : 'Join the board and start collaborating.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 py-3 px-4 rounded-2xl text-sm font-bold text-slate-200 transition-all active:scale-95 shadow-sm active:shadow-none disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-white border border-slate-100 py-3 px-4 rounded-2xl text-sm font-bold text-slate-900 transition-all active:scale-95 shadow-md active:shadow-none disabled:opacity-50"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.96.95-2.04 2.22-3.37 2.22-1.3 0-1.74-.84-3.37-.84-1.63 0-2.14.82-3.35.84-1.3.02-2.52-1.44-3.48-2.43C1.5 18.06 0 14.65 0 11.41c0-3.32 2.05-5.07 4-5.07 1.15 0 2.02.66 2.94.66.86 0 1.88-.73 3.23-.73 1.17 0 2.23.51 3 1.4-2.58 1.43-2.14 5.35.53 6.55-1.05 2.5-2.4 4.88-3.65 6.06zM12.03 5.25c-.02-2.13 1.76-4 3.73-4.25.17 2.15-1.76 4.09-3.73 4.25z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900/80 px-4 text-slate-500 font-bold backdrop-blur-sm">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800/80 border border-slate-600 rounded-2xl py-3 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-600 rounded-2xl py-3 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-950/40 border border-red-900/60 text-red-400 px-4 py-2 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transform transition-all active:scale-95 mt-4"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-700 pt-6">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
