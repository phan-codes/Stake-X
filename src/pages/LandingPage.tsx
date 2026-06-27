import HeroSection from '../components/landing/HeroSection';
import TickerBar from '../components/landing/TickerBar';
import AboutSection from '../components/landing/AboutSection';
import AdvantageSection from '../components/landing/AdvantageSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import BitcoinSection from '../components/landing/BitcoinSection';
import InvestmentPlansSection from '../components/landing/InvestmentPlansSection';
import PartnersSection from '../components/landing/PartnersSection';
import CTASection from '../components/landing/CTASection';
import LiveStatsSection from '../components/landing/LiveStatsSection';
import NFPAndLoanSection from '../components/landing/NFPAndLoanSection';
import FAQSection from '../components/landing/FAQSection';
import SEOHead from '../components/SEOHead';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full relative min-h-screen">
      <SEOHead
        title={null}
        description="StakeX is a digital platform for cryptocurrency services, forex trading, CFD trading, binary options, futures, and cloud mining. Secure operations, clear account management, and dependable tools for both new and experienced users."
        path="/"
      />
      <HeroSection />
      <TickerBar />
      <AboutSection />
      <AdvantageSection />
      <HowItWorksSection />
      <LiveStatsSection />
      <BitcoinSection />
      <InvestmentPlansSection />
      <NFPAndLoanSection />
      <PartnersSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
