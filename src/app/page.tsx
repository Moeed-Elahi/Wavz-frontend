import { TokenList } from '@/components/tokens/TokenList';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroSection />
      <StatsBar />
      <TokenList />
    </div>
  );
}
