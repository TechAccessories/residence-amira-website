// Purpose: Display a clear error screen when Supabase environment variables are missing.
export function ConfigError() {
  return (
    <div className="error-state" role="alert">
      <h1>Configuration required</h1>
      <p>
        The Supabase connection is not configured yet. Please verify the VITE_SUPABASE_URL and
        VITE_SUPABASE_ANON_KEY values in your environment file.
      </p>
    </div>
  )
}
