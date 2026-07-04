import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const SettingsWorkspace = dynamic(() => import('@/components/dashboard/SettingsWorkspace'), {
  loading: () => <LoadingSpinner message="Opening Settings Panel..." />,
});

export default function SettingsPage() {
  return <SettingsWorkspace />;
}
