import NavBar from "@/components/app/landing_page/Navbar";
import { items } from "@/components/app/landing_page/navbarItems";
import UploadClient from "./UploadClient";

export default function UploadPhotosPage() {
  return (
    <>
      <NavBar items={items} />
      <UploadClient />
    </>
  );
}
