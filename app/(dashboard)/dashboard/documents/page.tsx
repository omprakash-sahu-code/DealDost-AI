'use client';
import DocsWorkspace from '@/components/dashboard/DocsWorkspace';
import { useRouter } from 'next/navigation';

export default function DocumentsPage() {
  const router = useRouter();
  return <DocsWorkspace onNavigate={(view: string) => router.push(`/dashboard/${view}`)} />;
}
