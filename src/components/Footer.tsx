export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        <p>No file size limits • No signup • No ads on tools • Files never uploaded</p>
        <p className="mt-2">© {new Date().getFullYear()} PDFFree — All tools run 100% in your browser.</p>
      </div>
    </footer>
  );
}
