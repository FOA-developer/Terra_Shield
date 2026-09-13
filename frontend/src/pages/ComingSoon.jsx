import { useNavigate } from 'react-router-dom'

export default function ComingSoon({ title }) {
  const navigate = useNavigate()
  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">{title}</div>
      <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <div className="font-mono text-[11px] tracking-widest text-gray-500">NOT IN MVP SCOPE</div>
        <div className="mt-3 text-lg font-semibold text-forest-800">{title} is coming soon</div>
        <div className="mx-auto mt-2 max-w-md text-[15px] text-gray-500">
          Risk scoring, mapping and response workflows ship first. This section arrives in a later release.
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-5.5 h-12 rounded-xl border border-forest-600 bg-forest-600 px-5.5 text-[15px] font-semibold text-white"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}
