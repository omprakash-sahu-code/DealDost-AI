import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const ChatWorkspace = dynamic(() => import('@/components/dashboard/ChatWorkspace'), {
  loading: () => <LoadingSpinner message="Initializing Chat Workspace..." />,
});

export default function ChatPage() {
  return <ChatWorkspace />;
}
