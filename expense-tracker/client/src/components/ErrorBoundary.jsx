import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("react_error_boundary", { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-950">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500">Refresh the page. Your saved expenses remain in the database.</p>
            <button
              className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
