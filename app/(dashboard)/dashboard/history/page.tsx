import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const HistoryWorkspace = dynamic(() => import('@/components/dashboard/HistoryWorkspace'), {
  loading: () => <LoadingSpinner message="Retrieving History Logs..." />,
});

export default function HistoryPage() {
  return <HistoryWorkspace />;
}
