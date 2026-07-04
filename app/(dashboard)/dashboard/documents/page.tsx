'use client';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';

const DocsWorkspace = dynamic(() => import('@/components/dashboard/DocsWorkspace'), {
  loading: () => <LoadingSpinner message="Loading Documents Workspace..." />,
});

export default function DocumentsPage() {
  const router = useRouter();
  return <DocsWorkspace onNavigate={(view: string) => router.push(`/dashboard/${view}`)} />;
}
