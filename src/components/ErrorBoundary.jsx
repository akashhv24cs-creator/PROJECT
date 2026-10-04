import React from "react";
import ErrorPage from "../pages/ErrorPage";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SAFE DIAGNOSTIC LOG — ErrorBoundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          errorCode="500"
          errorMessage="We encountered an unexpected issue while rendering this view. Please try again."
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
