import React from "react";
import LandingNav from "./LandingNav";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import SecuritySection from "./SecuritySection";
import FAQSection from "./FAQSection";
import CTASection from "./CTASection";
import LandingFooter from "./LandingFooter";

const Landing = () => (
  <div className="min-h-screen">
    <LandingNav />
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <FAQSection />
      <CTASection />
    </main>
    <LandingFooter />
  </div>
);

export default Landing;
