import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import heroImage from '../assets/pipeline_1.jpg'

const STEPS = [
  { n: '1', title: 'Data Layer', body: 'Pipeline segment records, inspection history, incident reports, environmental and geographic data.' },
  { n: '2', title: 'Risk Engine', body: 'Expert-defined rules combined with an AI/ML model produce a score and its contributing factors.' },
  { n: '3', title: 'Operations Dashboard', body: 'An interactive map and ranked lists make high-risk sections visible at a glance.' },
  { n: '4', title: 'Response Workflow', body: 'A new anomaly or incident triggers reassessment and a recommended action for review.' },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Nav */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5">
          <div className="flex-none">
            <Logo />
          </div>
          <div className="flex-1" />
          <div className="hidden items-center gap-7 text-[15px] text-gray-700 lg:flex">
            <a href="#problem" className="text-gray-700">Problem</a>
            <a href="#solution" className="text-gray-700">Solution</a>
            <a href="#how" className="text-gray-700">How it Works</a>
          </div>
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link to="/login" className="rounded-lg border border-forest-600 bg-white px-4.5 py-2.5 text-sm font-semibold text-forest-600">Sign In</Link>
            <Link to="/login" className="rounded-lg border border-forest-600 bg-forest-600 px-4.5 py-2.5 text-sm font-semibold text-white">Request Demo</Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white text-lg text-forest-800 lg:hidden"
            style={{ width: 46, height: 46 }}
          >
            ☰
          </button>
        </div>
        {menuOpen && (
          <div className="grid gap-1 border-t border-gray-200 bg-white px-5 pb-5 pt-3 lg:hidden">
            <a href="#problem" onClick={() => setMenuOpen(false)} className="border-b border-gray-100 px-1.5 py-4 text-[17px] text-gray-700">Problem</a>
            <a href="#solution" onClick={() => setMenuOpen(false)} className="border-b border-gray-100 px-1.5 py-4 text-[17px] text-gray-700">Solution</a>
            <a href="#how" onClick={() => setMenuOpen(false)} className="border-b border-gray-100 px-1.5 py-4 text-[17px] text-gray-700">How it Works</a>
            <Link to="/login" className="mt-3 rounded-lg border border-forest-600 bg-white px-4 py-4 text-center text-base font-semibold text-forest-600">Sign In</Link>
            <Link to="/login" className="rounded-lg border border-forest-600 bg-forest-600 px-4 py-4 text-center text-base font-semibold text-white">Request Demo</Link>
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-18 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 font-mono text-[13px] font-semibold tracking-wide text-forest-600">
              NIGER DELTA · PIPELINE RISK INTELLIGENCE
            </div>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-tight text-forest-800 lg:text-[58px]" style={{ letterSpacing: '-1.6px' }}>
              See pipeline risk before it becomes a crisis.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              TerraShield is an AI-powered pipeline risk intelligence and decision-support platform for the Niger Delta — moving operations from reactive response to proactive protection.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="rounded-xl border border-forest-600 bg-forest-600 px-6.5 py-4 text-base font-semibold text-white">Request a Demo</Link>
              <Link to="/dashboard" className="rounded-xl border border-gray-300 bg-white px-6.5 py-4 text-base font-semibold text-forest-800">Explore the Dashboard</Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl ">
            <img
              src={heroImage}
              alt="Pipeline infrastructure in the Niger Delta"
              className="block h-full max-h-[420px] w-full object-cover"
            />
            
          </div>
        </div>
      </div>

      {/* Problem */}
      <div id="problem" className="border-b border-gray-200 bg-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="font-mono text-xs font-semibold tracking-wider text-forest-600">THE PROBLEM</div>
          <h2 className="mt-3.5 max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-forest-800 lg:text-[40px]">
            Pipelines in the Niger Delta are failing faster than inspection teams can reach them.
          </h2>
          <p className="mt-4.5 max-w-2xl text-lg leading-relaxed text-gray-600">
            Ageing infrastructure, corrosion, erosion and flooding compound with vandalism, crude theft and third-party interference. Failures are discovered after the spill, not before it.
          </p>
          <div className="mt-11 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
            <div className="rounded-2xl border border-gray-200 bg-white p-7.5">
              <div className="text-5xl font-bold leading-none tracking-tight text-risk-high">$14 billion</div>
              <div className="mt-3.5 text-base leading-relaxed text-gray-600">Estimated annual cost of pipeline vandalism in the Niger Delta to the Nigerian state and oil companies.</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-7.5">
              <div className="text-5xl font-bold leading-none tracking-tight text-risk-medium">$894 million</div>
              <div className="mt-3.5 text-base leading-relaxed text-gray-600">Value of roughly 10 million barrels of crude lost to pipeline vandalisation between 2009 and 2011.</div>
            </div>
            <div className="flex items-center rounded-2xl border border-forest-800 bg-forest-800 p-7.5">
              <div className="text-2xl font-semibold leading-snug text-white">Where will the next problem emerge — and which pipeline deserves attention first?</div>
            </div>
          </div>
        </div>
      </div>

      {/* Solution */}
      <div id="solution" className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="font-mono text-xs font-semibold tracking-wider text-forest-600">THE SOLUTION</div>
          <h2 className="mt-3.5 max-w-2xl text-[30px] font-bold leading-tight tracking-tight text-forest-800 lg:text-[40px]">
            Three questions, answered for every pipeline segment.
          </h2>
          <div className="mt-11 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))' }}>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7.5">
              <div className="font-mono text-[13px] text-gray-500">01</div>
              <div className="mt-3 text-2xl font-bold text-forest-800">Where is the risk?</div>
              <div className="mt-3 text-base leading-relaxed text-gray-600">Sensor readings, inspection records, CCTV, incident history, environmental and geographic data brought together into one risk score per pipeline segment.</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7.5">
              <div className="font-mono text-[13px] text-gray-500">02</div>
              <div className="mt-3 text-2xl font-bold text-forest-800">Why is it risky?</div>
              <div className="mt-3 text-base leading-relaxed text-gray-600">Explainable AI shows the contributing factors behind every score — previous vandalism, proximity to roads, elevation, coating condition — not just a label.</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7.5">
              <div className="font-mono text-[13px] text-gray-500">03</div>
              <div className="mt-3 text-2xl font-bold text-forest-800">What should we do first?</div>
              <div className="mt-3 text-base leading-relaxed text-gray-600">A recommended priority action for each segment: schedule an inspection, investigate an anomaly, or escalate an incident.</div>
            </div>
          </div>
          <div className="mt-6 max-w-3xl border-l-[3px] border-forest-600 py-1.5 pl-5.5 text-lg leading-relaxed text-gray-700">
            TerraShield is not intended to replace engineers — it gives them a clearer picture, earlier warning, and a better basis for deciding where limited resources should go.
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how" className="border-b border-gray-200 bg-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="font-mono text-xs font-semibold tracking-wider text-forest-600">HOW IT WORKS</div>
          <h2 className="mt-3.5 text-[30px] font-bold leading-tight tracking-tight text-forest-800 lg:text-[40px]">
            From raw field data to a decision.
          </h2>
          <div className="mt-11 grid gap-3.5 lg:grid-cols-4 lg:gap-2.5">
            {STEPS.map((s, i) => (
              <div key={s.n} className="grid items-stretch gap-3.5 lg:grid-cols-[1fr_auto]">
                <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6.5">
                  <div className="flex items-center justify-center rounded-lg bg-forest-800 font-mono text-sm font-semibold text-forest-400" style={{ width: 34, height: 34 }}>
                    {s.n}
                  </div>
                  <div className="mt-4 text-lg font-bold text-forest-800">{s.title}</div>
                  <div className="mt-2.5 text-[15px] leading-relaxed text-gray-600">{s.body}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden items-center justify-center text-xl text-gray-400 lg:flex">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="font-mono text-xs font-semibold tracking-wider text-forest-600">HUMAN IN THE LOOP</div>
            <div className="mt-4 text-[30px] font-bold leading-tight tracking-tight text-forest-800 lg:text-[40px]">
              The system recommends. Qualified personnel decide.
            </div>
          </div>
          <div className="text-[17px] leading-relaxed text-gray-600">
            <p className="m-0">Every high-risk assessment can be reviewed by qualified personnel before any action is taken. Recommendations are explained, traceable and overridable.</p>
            <p className="mt-4">The MVP clearly distinguishes real, public and simulated data, so engineers always know what a score is built on.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-forest-800">
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: 'repeating-linear-gradient(115deg,#123526 0 26px,#0f2d21 26px 52px)' }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-21 text-center">
          <div className="mx-auto max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-white lg:text-[40px]">
            Know which pipeline deserves attention first.
          </div>
          <div className="mx-auto mt-4.5 max-w-xl text-lg leading-relaxed text-forest-100">
            Request a walkthrough with your own pipeline network, or sign in to the operations dashboard.
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="rounded-xl border border-forest-400 bg-forest-400 px-7 py-4 text-base font-bold text-forest-950">Request Demo</Link>
            <Link to="/login" className="rounded-xl border border-forest-600 bg-transparent px-7 py-4 text-base font-semibold text-white">Sign In</Link>
          </div>
          <div className="mt-8.5 font-mono text-[11px] tracking-wide text-forest-200">
            [ PIPELINE RIGHT-OF-WAY PHOTOGRAPH — DROP IMAGE HERE ]
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-forest-950">
        <div className="mx-auto grid max-w-6xl items-start gap-7 px-6 py-11 lg:grid-cols-[auto_1fr_auto]">
          <div>
            <div className="text-[17px] font-bold text-white">TERRA<span className="text-forest-400">SHIELD</span></div>
            <div className="mt-2 font-mono text-[11px] tracking-wide text-forest-200">PIPELINE RISK INTELLIGENCE PLATFORM</div>
          </div>
          <div className="flex flex-wrap gap-5.5 text-sm">
            <a href="#problem" className="text-forest-100">Problem</a>
            <a href="#solution" className="text-forest-100">Solution</a>
            <a href="#how" className="text-forest-100">How it Works</a>
            <a href="#problem" className="text-forest-100">Data sources</a>
          </div>
          <div className="text-[13px] text-forest-200/80">© 2026 TerraShield. MVP — simulated and public data.</div>
        </div>
      </div>
    </div>
  )
}
