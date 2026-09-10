import Navbar from './components/Navbar'
import HeroSection from './sections/HeroSection'
import AboutSection from './sections/AboutSection'
import ServicesSection from './sections/ServicesSection'
import ProjectsSection from './sections/ProjectsSection'
import SkillsSection from './sections/SkillsSection'
import ContactSection from './sections/ContactSection'
import CursorGlow from './components/CursorGlow'

export default function App() {
  return (
    <main
      className="min-h-screen bg-[#F4F5F7] font-sans"
      style={{ overflowX: 'clip' }}
    >
      <CursorGlow />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
  )
}
