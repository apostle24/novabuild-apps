export default function Home() {
  return (
    <main className="min-h-screen bg-[#080B14] text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">
          NOVA<span className="text-violet-500">BUILD</span>
        </h1>

        <div className="hidden md:flex gap-8 text-gray-400">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#about">About</a>
        </div>

        <button className="rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500">
          Get Started
        </button>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-28 text-center">
        <div className="mb-8 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm text-violet-300">
          ✨ Your ideas. Powered by AI.
        </div>

        <h2 className="text-5xl font-bold leading-tight md:text-7xl">
          Build Anything.
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            With AI.
          </span>
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-400">
          Turn your ideas into powerful websites and applications.
          Describe what you want. Let AI help you build it.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#111625] p-3 shadow-2xl md:flex-row">
          <input
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-gray-500"
            placeholder="Describe the application you want to build..."
          />

          <button className="rounded-xl bg-violet-600 px-7 py-3 font-semibold hover:bg-violet-500">
            Start Building →
          </button>
        </div>

        <p className="mt-5 text-sm text-gray-500">
          No coding experience required.
        </p>
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: "✦",
            title: "AI App Builder",
            description: "Transform natural language prompts into application code.",
          },
          {
            icon: "⌘",
            title: "Intelligent Coding",
            description: "Generate, understand, and improve your projects with AI.",
          },
          {
            icon: "↗",
            title: "Deploy Anywhere",
            description: "Take your finished projects from development to production.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-violet-500/50"
          >
            <div className="mb-5 text-3xl text-violet-400">{feature.icon}</div>
            <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
            <p className="leading-7 text-gray-400">{feature.description}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 NOVABUILD AI. Build beyond limits.
      </footer>
    </main>
  );
}