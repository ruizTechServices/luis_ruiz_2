import NavBar from "../components/app/landing_page/Navbar"

const items = [
  { label: "Home", href: "/" },
]

export default function Home() {
  return (
    <div className="w-full h-[300vh] overflow-hidden">
      <NavBar items={items} />
    </div>
  )
}
