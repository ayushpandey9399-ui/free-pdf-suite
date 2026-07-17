import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FileText className="h-4 w-4" />
          </span>
          <span>PDFFree</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            All tools
          </Link>
        </nav>
      </div>
    </header>
  );
}
