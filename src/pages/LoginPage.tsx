import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Receipt, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const DEMO_CREDENTIALS = [
    { email: 'admin@email.com', password: 'admin123' },
    { email: 'finance@company.com', password: 'finance123' },
  ];

  const isDemoCredential = (email: string, password: string) =>
    DEMO_CREDENTIALS.some(
      (cred) => cred.email === email.toLowerCase().trim() && cred.password === password
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isDemoCredential(email, password)) {
      setError(
        'This prototype is built for Mosaic Wellness. Please use the demo credentials buttons below to sign in.'
      );
      return;
    }

    setIsLoading(true);

    const success = await login(email, password, rememberMe);
    if (success) {
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  const fillDemoCredentials = (type: 'admin' | 'finance') => {
    if (type === 'admin') {
      setEmail('admin@email.com');
      setPassword('admin123');
    } else {
      setEmail('finance@company.com');
      setPassword('finance123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] dot-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2F8E92] rounded-xl flex items-center justify-center shadow-lg">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-semibold text-2xl text-[#0B0D10]">
              InvoiceAI
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card-elevated p-8 animate-fade-in">
          <div className="text-center mb-8">
            <p className="text-micro text-[#2F8E92] mb-2">AI INVOICE AUDIT</p>
            <h1 className="text-2xl font-display font-semibold text-[#0B0D10] mb-2">
              Welcome back
            </h1>
            <p className="text-[#6B7280] text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0B0D10] mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@company.com"
                className="input-field"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#0B0D10] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B0D10] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[rgba(11,13,16,0.2)] text-[#2F8E92] focus:ring-[#2F8E92]"
                />
                <span className="text-sm text-[#6B7280]">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-[#2F8E92] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 text-center leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Note */}
          <div className="mt-6 p-3 bg-[rgba(47,142,146,0.06)] border border-[rgba(47,142,146,0.15)] rounded-lg">
            <p className="text-xs text-[#2F8E92] text-center leading-relaxed">
              <span className="font-semibold">Note:</span> This prototype is built for{' '}
              <span className="font-semibold">Mosaic Wellness</span>. Please use the demo
              credentials buttons below to sign in.
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 pt-6 border-t border-[rgba(11,13,16,0.08)]">
            <p className="text-xs text-[#6B7280] text-center mb-3">Demo Credentials</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="flex-1 py-2 px-3 text-xs bg-[rgba(47,142,146,0.08)] text-[#2F8E92] rounded-lg hover:bg-[rgba(47,142,146,0.12)] transition-colors"
              >
                Admin Account
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('finance')}
                className="flex-1 py-2 px-3 text-xs bg-[rgba(11,13,16,0.04)] text-[#6B7280] rounded-lg hover:bg-[rgba(11,13,16,0.08)] transition-colors"
              >
                Finance Account
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
