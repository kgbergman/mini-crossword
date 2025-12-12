import React from "react";
import "./OnboardingScreen.css";

export default function OnboardingScreen({ onComplete }) {
  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Welcome!</h1>

        <p className="onboarding-text">
          You have the chance to win a prize if you complete any of the following puzzles in under 10 seconds. Good luck!
        </p>

        <button className="onboarding-button" onClick={onComplete}>
          Start Puzzle
        </button>
      </div>
    </div>
  );
}
