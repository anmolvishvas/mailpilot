import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground text-sm">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/">
            <Button variant="default" className="gap-2 shadow-sm">
              <ArrowLeft className="h-4 w-4" /> Return to Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
