"use client";
import Navbar from './components/Navbar/Navbar';  // Corrected the import path
import HeroSection from './home/HeroSection';
import FeatureSection from './home/FeatureSection';
import ProcessSection from './home/ProcessSection';
import TestimonialSection  from './home/TestimonialSection';
import CTASection from './home/CTASection';

function HomePage() {

  return (
    <div>
      <Navbar />
          <main>
      <HeroSection />
      <FeatureSection />
      <ProcessSection />
<TestimonialSection />
<CTASection/>
    </main>

    </div>
  );
}

export default HomePage;
