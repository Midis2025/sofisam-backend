'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupAvailable, setSetupAvailable] = useState(false);

  // If no Super Admin exists, redirect directly to /setup
  useEffect(() => {
    let isMounted = true;
    async function checkSetupStatus() {
      try {
        const res = await fetch('/api/admin/setup-status');
        const data = await res.json();
        if (data.registrationAvailable && isMounted) {
          setSetupAvailable(true);
          router.push('/setup');
        }
      } catch {
        // Continue standard login
      }
    }
    checkSetupStatus();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Success -> Redirect to intended destination
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DED7CA] p-8 shadow-[0_10px_35px_rgba(40,30,15,0.06)]">
      <div className="mb-6">
        <h2 className="text-base font-bold text-[#171717]">Executive Sign In</h2>
        <p className="text-xs text-[#66625B] mt-1">
          Authorized administrator access only. All sessions are audited.
        </p>
      </div>

      {setupAvailable && (
        <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C7A46A]" />
            First-time Super Admin setup required.
          </span>
          <Link href="/setup" className="font-bold underline text-[#7A5D33]">
            Set Up Now
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-[#9A3F2C] animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1.5">
            Admin Email Address
          </label>
          <Input
            type="email"
            icon={<Mail className="w-4 h-4" />}
            placeholder="admin@sofisam.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#171717]">
              Password
            </label>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66625B] hover:text-[#171717] p-1 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 bg-[#171717] hover:bg-[#2C2A26] font-semibold"
          isLoading={isLoading}
        >
          Sign In to Admin Dashboard
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#DED7CA] flex items-center justify-between text-[11px] text-[#66625B]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#C7A46A]" />
          <span>256-bit encrypted session</span>
        </div>
        <Link href="/setup" className="font-medium text-[#7A5D33] hover:text-[#C7A46A] hover:underline">
          First-time setup
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F6F2EA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://sofisam-seven.vercel.app/logo-dark.png"
              alt="SOFISAM"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#7A5D33] font-semibold mt-2">
            Enterprise Administration Portal
          </p>
        </div>

        {/* Form wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-[#DED7CA] p-8 text-center text-xs text-[#66625B]">
              Loading secure portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-xs text-[#66625B] mt-6">
          &copy; {new Date().getFullYear()} SOFISAM FZCO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
