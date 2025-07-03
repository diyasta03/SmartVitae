"use client";
import Navbar from './components/Navbar/Navbar';  // Corrected the import path
import HeroSection from './home/HeroSection';
import FeatureSection from './home/FeatureSection';
import ProcessSection from './home/ProcessSection';
import TestimonialSection  from './home/TestimonialSection';
import CTASection from './home/CTASection';
import Footer from './components/Footer/Footer';
import AIChatbot from './components/AIChatbot/AIChatbot'; // Import Chatbot Anda

function HomePage() {

  return (
    <div>
      <Navbar />
          <main>
                  <AIChatbot /> {/* Tambahkan komponen chatbot di sini */}

      <HeroSection />
      <FeatureSection />
      <ProcessSection />
<TestimonialSection />
<CTASection/>
    </main>
        <Footer />

    </div>
  );
}

export default HomePage;
