import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const publicRoutes = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

const appRoutes = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Ollama", href: "/ollama" },
  { label: "Round Robin", href: "/round-robin" },
  { label: "Login", href: "/login" },
];

function RouteList({
  title,
  routes,
}: {
  title: string;
  routes: Array<{ label: string; href: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {routes.map((route) => (
            <li key={route.href}>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={route.href}>{route.label}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="ss-container flex flex-col gap-8 py-10">
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-normal">Luis Ruiz</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Public routes and working application surfaces.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/projects">Projects</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-2">
          <RouteList title="Public" routes={publicRoutes} />
          <RouteList title="Application" routes={appRoutes} />
        </section>
      </div>
    </main>
  );
}
