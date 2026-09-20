// Shared loading / cold-start / error panel for pages backed by the API.
// - coldStart: the first request after the backend has been idle can take
//   30-50s on Render's free tier; show a reassuring message instead of a
//   spinner that looks stuck.
// - error: renders the shared error message with a retry action.
export default function DataState({ loading, coldStart, error, onRetry }) {
  if (error) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-[15px] font-semibold text-forest-800">Couldn’t load this data</div>
        <div className="max-w-sm text-sm text-gray-500">{error.message}</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 h-11 rounded-lg border border-forest-600 bg-forest-600 px-5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3.5 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-forest-600" />
        {coldStart ? (
          <div className="max-w-sm">
            <div className="text-[15px] font-semibold text-forest-800">Waking up the server…</div>
            <div className="mt-1 text-sm text-gray-500">This can take up to a minute on the first request. Hang tight.</div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Loading…</div>
        )}
      </div>
    )
  }

  return null
}
