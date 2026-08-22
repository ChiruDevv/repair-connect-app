export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">MERN + Next.js</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Full stack application ready for development.
      </p>
      <div className="flex gap-4">
        <a
          href="/api/health"
          className="rounded-lg bg-black dark:bg-white px-6 py-3 text-white dark:text-black font-medium hover:opacity-90 transition-opacity"
        >
          API Health Check
        </a>
      </div>
    </main>
  );
}
