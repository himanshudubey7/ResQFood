import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiOfficeBuilding, HiPhone, HiLocationMarker } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    phone: '',
    // Org details
    organizationName: '',
    address: '',
    registrationNumber: '',
  });

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        return toast.error('Please fill in all basic details');
      }
      if (formData.password.length < 6) {
        return toast.error('Password must be at least 6 characters');
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role !== 'volunteer' && (!formData.organizationName || !formData.address || !formData.phone)) {
      return toast.error('Please fill in all organization details');
    }
    if (formData.role === 'volunteer' && !formData.phone) {
      return toast.error('Please provide a contact number');
    }

    try {
      const { user } = await register(formData);
      toast.success(`Account created successfully! Welcome ${user.name}`);
      const roleRoutes = { admin: '/admin', donor: '/donor', ngo: '/ngo', volunteer: '/volunteer' };
      navigate(roleRoutes[user.role] || '/');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-surface-50">
      {/* Global Ambient Background */}
      <div className="bg-ambient pointer-events-none" />

      {/* Right: Split Graphic Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-surface-950/80 backdrop-blur-3xl border-l border-white/10 items-center justify-center p-16 animate-fade-in z-10 overflow-hidden order-last">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-accent-900 rounded-full blur-[120px] opacity-50 animate-pulse-soft" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary-900 rounded-full blur-[100px] opacity-40 animate-pulse-soft" style={{ animationDelay: '-5s' }} />

        <div className="relative z-10 text-white max-w-lg">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center text-5xl font-black mb-10 shadow-[0_0_40px_rgba(0,180,216,0.4)] animate-bounce-in">
            R
          </div>
          <h1 className="text-6xl font-black mb-6 leading-[1.1] heading-font tracking-tight">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-primary-400">Movement.</span>
          </h1>
          <p className="text-xl text-surface-300 mb-8 leading-relaxed font-medium">
            Whether you're a restaurant with surplus food, an NGO feeding the hungry, or a volunteer ready to drive — you belong here.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 bg-surface-900/50 p-4 rounded-2xl border border-surface-800 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center text-xl">🍽️</div>
              <div>
                <p className="font-bold text-white">Donors</p>
                <p className="text-sm text-surface-400">List leftover food in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface-900/50 p-4 rounded-2xl border border-surface-800 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-warning-500/20 text-warning-400 flex items-center justify-center text-xl">🏘️</div>
              <div>
                <p className="font-bold text-white">NGOs</p>
                <p className="text-sm text-surface-400">Claim food exactly when needed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface-900/50 p-4 rounded-2xl border border-surface-800 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-info-500/20 text-info-400 flex items-center justify-center text-xl">🚚</div>
              <div>
                <p className="font-bold text-white">Volunteers</p>
                <p className="text-sm text-surface-400">Drive the impact home</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-[500px] animate-slide-right glass-panel p-8 lg:p-12 rounded-[2.5rem]">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center text-3xl font-black text-surface-950 mx-auto mb-4 shadow-lg">
              R
            </div>
            <h1 className="text-3xl font-black heading-font text-surface-900">ResQFood</h1>
          </div>

          <div className="mb-8 select-none">
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-1/2 h-1.5 rounded-full ${step >= 1 ? 'bg-primary-500 shadow-[0_0_10px_rgba(0,230,118,0.5)]' : 'bg-surface-200'}`} />
              <span className={`w-1/2 h-1.5 rounded-full ${step >= 2 ? 'bg-primary-500 shadow-[0_0_10px_rgba(0,230,118,0.5)]' : 'bg-surface-200'}`} />
            </div>
            <h2 className="text-4xl font-black text-surface-950 mb-2 heading-font tracking-tight">
              {step === 1 ? 'Create Account' : 'Final Details'}
            </h2>
            <p className="text-surface-500 font-medium text-lg">
              {step === 1 ? 'Start your journey below.' : 'Tell us a bit about your organization.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <div className="space-y-5 animate-fade-in">
                <div className="flex space-x-2 p-1.5 bg-surface-100 rounded-2xl mb-8">
                  {['donor', 'ngo', 'volunteer'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all duration-300 heading-font ${formData.role === r
                        ? 'bg-white text-primary-600 shadow-md transform scale-[1.02]'
                        : 'text-surface-500 hover:text-surface-900 hover:bg-surface-200'
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<HiUser />}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<HiMail />}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  icon={<HiLockClosed />}
                />

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full mt-4"
                  size="xl"
                >
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {(formData.role === 'donor' || formData.role === 'ngo') && (
                  <>
                    <Input
                      label="Organization / Restaurant Name"
                      placeholder="e.g. Fresh Foods Ltd"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      icon={<HiOfficeBuilding />}
                    />
                    <Input
                      label="Registration Number (Optional)"
                      placeholder="Gov Reg No."
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    />
                    <Input
                      label="Full Address"
                      placeholder="123 Street Name, City"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      icon={<HiLocationMarker />}
                    />
                  </>
                )}

                <Input
                  label="Phone Number"
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<HiPhone />}
                />

                <div className="flex gap-4 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="w-1/3"
                    size="xl"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                    size="xl"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center font-semibold text-surface-600 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 underline decoration-2 underline-offset-4 decoration-primary-500/30 hover:decoration-primary-500 transition-all">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;