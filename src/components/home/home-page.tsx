export function HomePage() {
  return (
    <div className="container py-12">
      <div className="space-y-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Favely</h1>
          <p className="text-xl text-muted-foreground">
            Create, share, and discover curated lists of your favorite things.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Create Lists</h2>
            <p className="text-muted-foreground">
              Organize your interests into beautiful, shareable collections.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Share</h2>
            <p className="text-muted-foreground">
              Share your curated lists with friends or the community.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Discover</h2>
            <p className="text-muted-foreground">
              Find new inspiration from other users&apos; collections.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
} 
