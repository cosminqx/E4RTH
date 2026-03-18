import MapView from "@/components/MapView";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">E4RTH</span>
        <nav className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
          <a href="#map" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Map</a>
          <a href="#dashboard" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Dashboard</a>
          <a href="#volunteer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Volunteer</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6 flex-1">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
          E4RTH
        </h1>
        <p className="max-w-xl text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          An integrated platform addressing the{" "}
          <strong className="text-neutral-900 dark:text-neutral-100">Triple Planetary Crisis</strong>
          {" "}— climate change, pollution, and biodiversity loss — through geospatial
          data, AI insights, and community-driven action.
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="#volunteer"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Join as Volunteer
          </a>
          <a
            href="#map"
            className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Explore the Map
          </a>
        </div>
      </section>

      {/* Environmental map */}
      <section id="map" className="px-6 py-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Environmental Data Map</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
            Live PM2.5 and PM10 readings around Iasi with marker levels and layer toggles.
          </p>
          <MapView />
        </div>
      </section>

      {/* Data dashboard placeholder */}
      <section id="dashboard" className="px-6 py-16 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Data Dashboard</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
            Real-time environmental indicators and trend analysis — coming soon.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["CO₂ Levels", "Biodiversity Index", "Pollution Score"].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 flex flex-col gap-2"
              >
                <span className="text-xs uppercase tracking-wider text-neutral-400">{label}</span>
                <span className="text-3xl font-bold text-neutral-300 dark:text-neutral-600">—</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-action for volunteers */}
      <section id="volunteer" className="px-6 py-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold">Get Involved</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-lg">
            Join our global community of volunteers helping to monitor, report, and
            restore the health of our planet.
          </p>
          <a
            href="mailto:volunteer@e4rth.org"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Become a Volunteer
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-6 text-center text-xs text-neutral-400 dark:text-neutral-600">
        © {new Date().getFullYear()} E4RTH. Building a healthier planet, together.
      </footer>
    </main>
  );
}
