"use client";
import Navbar from './components/Navbar/Navbar';  // Corrected the import path
import HeroSection from './home/HeroSection';
import Testimonials from './home/Testimonials';
import HowItWorks from './home/HowItWorks';

function HomePage() {

  return (
    <div>
      <Navbar />
      <main>
        <HeroSection />
        <Testimonials />
        <HowItWorks />
      </main>
    </div>
  );
}

export default HomePage;
