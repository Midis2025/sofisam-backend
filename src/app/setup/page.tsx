'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SetupPage() {
  const router = useRouter();

  // Registration fields: Full Name, Email, Password, Confirm Password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [registrationClosed, setRegistrationClosed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check on mount if registration is available
  useEffect(() => {
    let isMounted = true;
    async function checkAvailability() {
      try {
        const res = await fetch('/api/admin/setup-status');
        const data = await res.json();
        if (isMounted) {
          if (!data.registrationAvailable) {
            setRegistrationClosed(true);
            setTimeout(() => {
              router.push('/login');
            }, 2500);
          }
        }
      } catch {
        // Fallback for configuration phase
      } finally {
        if (isMounted) setCheckingStatus(false);
      }
    }

    checkAvailability();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score += 1;
    if (passwordCriteria.upper) score += 1;
    if (passwordCriteria.lower) score += 1;
    if (passwordCriteria.number) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return '';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore === 3) return 'Moderate';
    return 'Strong';
  }, [strengthScore, password.length]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    if (strengthScore < 4) {
      setError('Password must meet all 4 institutional complexity requirements.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Super Admin registration failed.');
      }

      setSuccess(true);

      // Redirect into dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during Super Admin registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-4">
        <div className="flex items-center gap-3 text-xs text-[#7C8795]">
          <span className="w-4 h-4 border-2 border-[#14243A] border-t-transparent rounded-full animate-spin" />
          <span>Verifying Super Admin registration availability...</span>
        </div>
      </div>
    );
  }

  if (registrationClosed) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E9EF] p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#182536]">Registration Unavailable</h2>
          <p className="text-xs text-[#7C8795] mt-2">
            Super Administrator registration is closed for this system. Only authorized administrators may sign in.
          </p>
          <p className="text-xs text-[#B99A62] mt-4 font-semibold">
            Redirecting to sign in portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#14243A] items-center justify-center text-[#B99A62] font-serif font-bold text-2xl shadow-lg border border-[#B99A62]/30 mb-3">
            S
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#14243A]">
            SOFISAM
          </h1>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B99A62]/10 border border-[#B99A62]/30 text-[#8D703D] text-[11px] font-semibold mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B99A62]" />
            First-Time Super Admin Registration
          </div>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl border border-[#E5E9EF] p-6 sm:p-8 shadow-[0_10px_25px_rgba(20,36,58,0.06)]">
          <div className="mb-6 pb-4 border-b border-[#E5E9EF]">
            <h2 className="text-base font-bold text-[#182536]">Register Super Administrator</h2>
            <p className="text-xs text-[#7C8795] mt-1">
              Create your primary corporate administrator account. Once registered, this account is granted the Super Admin authority and public registration is permanently disabled.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-semibold">Super Administrator registered successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Establishing your authenticated session and redirecting to the Executive Dashboard...
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#182536] mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                icon={<User className="w-4 h-4" />}
                placeholder="e.g. Alexander Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#182536] mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder="your.name@sofisam.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#182536]">
                  Master Password
                </label>
                {strengthLabel && (
                  <span
                    className={`text-[10px] font-bold ${
                      strengthScore <= 2
                        ? 'text-rose-600'
                        : strengthScore === 3
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {strengthLabel}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="Min 8 characters with uppercase, lowercase & numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8795] hover:text-[#182536] p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="grid grid-cols-4 gap-1 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-colors ${
                          step <= strengthScore
                            ? strengthScore <= 2
                              ? 'bg-rose-500'
                              : strengthScore === 3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-[#7C8795]">
                    <span className="flex items-center gap-1">
                      {passwordCriteria.length ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      At least 8 characters
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordCriteria.upper ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      Uppercase letter
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordCriteria.lower ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      Lowercase letter
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordCriteria.number ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      Number (0-9)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#182536] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="Re-enter master password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={!passwordsMatch ? 'border-rose-400 focus:border-rose-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8795] hover:text-[#182536] p-1 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-[11px] text-rose-600 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 bg-[#14243A] hover:bg-[#1C3250]"
              isLoading={isLoading}
              disabled={success || !passwordsMatch || strengthScore < 4}
            >
              <span>Create Super Admin Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5E9EF] text-center text-[11px] text-[#7C8795]">
            Already set up?{' '}
            <a href="/login" className="font-semibold text-[#B99A62] hover:underline">
              Sign In to Admin Portal
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#7C8795] mt-6">
          © {new Date().getFullYear()} SOFISAM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
