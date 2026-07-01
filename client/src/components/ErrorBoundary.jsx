import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
            <span style={{ fontSize: "3rem" }}>☀️</span>
            <h1 style={{ color: "var(--text)", margin: "1rem 0" }}>Something went wrong</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="search-btn"
              style={{ marginTop: "1.5rem" }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
