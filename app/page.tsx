export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          YouTube Transcript Tool
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Get clean, formatted transcripts from YouTube videos instantly
        </p>
        <div className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-secondary px-6 py-3 text-text-secondary">
          <span className="text-accent-primary font-medium">Coming soon</span>
          <span>&mdash; paste a YouTube URL to get started</span>
        </div>
      </div>
    </main>
  );
}
