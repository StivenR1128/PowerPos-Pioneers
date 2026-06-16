'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, usuario, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !usuario) {
      router.push('/login');
    }
  }, [hydrated, token, usuario]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-orange-500 text-xl font-bold animate-pulse">
          Power<span className="text-white">POS</span>
        </div>
      </div>
    );
  }

  if (!token || !usuario) return null;

  return <>{children}</>;
}