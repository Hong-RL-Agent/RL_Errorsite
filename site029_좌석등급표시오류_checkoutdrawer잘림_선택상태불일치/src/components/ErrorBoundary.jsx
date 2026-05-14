import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell">
          <div className="fatal-panel">
            <h1>PulseTicket 화면을 불러오지 못했습니다.</h1>
            <p>{this.state.error.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
