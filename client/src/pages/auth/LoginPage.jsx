import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await login({ email, password });
      toast.success(`Welcome back, ${user.name}!`);
      const roleRoutes = { admin: '/admin', donor: '/donor', ngo: '/ngo', volunteer: '/volunteer' };
      navigate(roleRoutes[user.role] || '/');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-surface-50">
      {/* Global Ambient Background */}
      <div className="bg-ambient pointer-events-none" />

      {/* Left: Interactive Splash Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-950/80 backdrop-blur-3xl border-r border-white/10 items-center justify-center p-16 animate-fade-in z-10 overflow-hidden">
        {/* Animated Mesh Gradients within Dark Panel */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary-900 rounded-full blur-[120px] opacity-60 animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-900 rounded-full blur-[100px] opacity-40 animate-pulse-soft" style={{ animationDelay: '-5s' }} />

        <div className="relative z-10 text-white max-w-lg">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-5xl font-black mb-10 shadow-[0_0_40px_rgba(0,230,118,0.3)] animate-scale-in">
            R
          </div>
          <h1 className="text-6xl font-black mb-6 leading-[1.1] heading-font tracking-tight">
            Stop Waste. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-300">
              Start Saving.
            </span>
          </h1>
          <p className="text-xl text-surface-300 mb-12 leading-relaxed font-medium">
            Join the most advanced, real-time food redistribution network globally. Connect instantly with those in need.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center stagger-children">
            <div className="bg-surface-900/50 border border-surface-800 backdrop-blur-xl rounded-3xl p-6 hover:bg-surface-800 transition-colors">
              <p className="text-3xl font-black text-primary-400 heading-font mb-1">10K+</p>
              <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">Meals</p>
            </div>
            <div className="bg-surface-900/50 border border-surface-800 backdrop-blur-xl rounded-3xl p-6 hover:bg-surface-800 transition-colors">
              <p className="text-3xl font-black text-primary-400 heading-font mb-1">500+</p>
              <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">Donors</p>
            </div>
            <div className="bg-surface-900/50 border border-surface-800 backdrop-blur-xl rounded-3xl p-6 hover:bg-surface-800 transition-colors">
              <p className="text-3xl font-black text-primary-400 heading-font mb-1">200+</p>
              <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">NGOs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Refined Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <div className="w-full max-w-[440px] animate-slide-left glass-panel p-8 lg:p-12 rounded-[2.5rem]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl font-black text-surface-950 mx-auto mb-4 shadow-lg">
              R
            </div>
            <h1 className="text-3xl font-black heading-font text-surface-900">ResQFood</h1>
          </div>

          <div className="mb-10 lg:mb-12">
            <h2 className="text-4xl font-black text-surface-950 mb-3 heading-font tracking-tight">Welcome back.</h2>
            <p className="text-surface-500 font-medium text-lg">Sign in to your dashboard to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<HiMail />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<HiLockClosed />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-4"
              size="xl"
              isLoading={isLoading}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <p className="text-center font-semibold text-surface-600 mt-10">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 underline decoration-2 underline-offset-4 decoration-primary-500/30 hover:decoration-primary-500 transition-all">
              Create one
            </Link>
          </p>

          {/* Demo accounts - Restyled */}
          <div className="mt-10 p-6 bg-surface-950 text-white rounded-3xl shadow-xl">
            <p className="text-sm font-bold text-primary-400 mb-4 heading-font flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" /> Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-mono">
              <div className="bg-surface-900 p-3 rounded-xl">
                <span className="text-surface-400 block mb-1">Admin</span>
                <span className="text-primary-300">admin@</span>
              </div>
              <div className="bg-surface-900 p-3 rounded-xl">
                <span className="text-surface-400 block mb-1">Donor</span>
                <span className="text-primary-300">donor@</span>
              </div>
              <div className="bg-surface-900 p-3 rounded-xl">
                <span className="text-surface-400 block mb-1">NGO</span>
                <span className="text-primary-300">ngo@</span>
              </div>
              <div className="bg-surface-900 p-3 rounded-xl">
                <span className="text-surface-400 block mb-1">Volunteer</span>
                <span className="text-primary-300">volunteer@</span>
              </div>
            </div>
            <p className="text-center text-[11px] text-surface-500 font-medium mt-4 pt-4 border-t border-surface-800">
              Suffix: <span className="text-white">resqfood.com</span> • Pass: <span className="text-white">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;