//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\page.tsx
import Hero from "../components/app/landing_page/Hero";
import TechSection from "../components/app/landing_page/techSection";
import Quote from "../components/app/landing_page/quotes";  

export default function Home() {
  return (
    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Hero />
      <Quote />
      <TechSection />

    </div>
  )
}
