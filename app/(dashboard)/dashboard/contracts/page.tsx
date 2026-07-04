import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const ContractWorkspace = dynamic(() => import('@/components/dashboard/ContractWorkspace'), {
  loading: () => <LoadingSpinner message="Initializing Contract Workspace..." />,
});

export default function ContractsPage() {
  return <ContractWorkspace />;
}
