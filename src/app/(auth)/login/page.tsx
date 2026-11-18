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
    <div className="bg-white rounded-2xl border border-[#E5E9EF] p-8 shadow-[0_10px_25px_rgba(20,36,58,0.06)]">
      <div className="mb-6">
        <h2 className="text-base font-bold text-[#182536]">Executive Sign In</h2>
        <p className="text-xs text-[#7C8795] mt-1">
          Authorized administrator access only. All sessions are audited.
        </p>
      </div>

      {setupAvailable && (
        <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#B99A62]" />
            First-time Super Admin setup required.
          </span>
          <Link href="/setup" className="font-bold underline text-[#8D703D]">
            Set Up Now
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#182536] mb-1.5">
            Administrator Email
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
          <label className="block text-xs font-semibold text-[#182536] mb-1.5">
            Password
          </label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8795] hover:text-[#182536] p-1 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 bg-[#14243A] hover:bg-[#1C3250]"
          isLoading={isLoading}
        >
          Sign In to Admin Dashboard
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#E5E9EF] flex items-center justify-between text-[11px] text-[#7C8795]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#B99A62]" />
          <span>256-bit encrypted session</span>
        </div>
        <Link href="/setup" className="font-medium text-[#B99A62] hover:underline">
          First-time setup
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#14243A] items-center justify-center text-[#B99A62] font-serif font-bold text-2xl shadow-lg border border-[#B99A62]/30 mb-4">
            S
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#14243A]">
            SOFISAM
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#B99A62] font-semibold mt-1">
            Enterprise Administration Portal
          </p>
        </div>

        {/* Form wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-[#E5E9EF] p-8 text-center text-xs text-[#7C8795]">
              Loading secure portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-xs text-[#7C8795] mt-6">
          © {new Date().getFullYear()} SOFISAM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
