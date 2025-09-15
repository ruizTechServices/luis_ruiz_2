import NavBar from "@/components/app/landing_page/Navbar";
import { items } from "@/components/app/landing_page/Navbar";
import Hero from "../components/app/landing_page/Hero"


export default function Home() {
  return (
    <div className="w-full h-[300vh] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <NavBar items={items} />
      <Hero />
    </div>
  )
}
