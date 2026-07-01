import SmoothScroll from '@/components/landing/SmoothScroll';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      {children}
    </SmoothScroll>
  );
}
