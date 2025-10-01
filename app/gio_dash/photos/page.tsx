import NavBar from "@/components/app/landing_page/Navbar";
import { items } from "@/components/app/landing_page/navbarItems";
import PhotosClient from "./PhotosClient";

export default function PhotosListPage() {
  return (
    <>
      <NavBar items={items} />
      <PhotosClient />
    </>
  );
}
