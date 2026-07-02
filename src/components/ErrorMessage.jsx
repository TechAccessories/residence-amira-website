// Purpose: Render friendly error feedback for data and booking failures.
export function ErrorMessage({ message }) {
  return <div className="error-state" role="alert">{message}</div>
}
