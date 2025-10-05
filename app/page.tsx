//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\page.tsx
import Hero from "../components/app/landing_page/Hero";
import About from "../components/app/landing_page/about";
import TechSection from "../components/app/landing_page/techSection";

export default function Home() {
  return (
    <div className="w-full h-[300vh] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Hero />
      <p className="text-3xl font-bold text-center">
        I push production forward while scaling systems
      </p>
      <About />
      <TechSection />

    </div>
  )
}
