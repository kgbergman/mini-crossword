// OnScreenKeyboard.tsx
import React from "react";

interface OnScreenKeyboardProps {
  keyPressed: (key: string) => void;
}

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ keyPressed }) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%",
    userSelect: "none",
    padding: "0.5rem",
    backgroundColor: '#ccc',
    borderBottomRightRadius: '1.5rem',
    borderBottomLeftRadius: '1.5rem',
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "0.25rem",
  };

  const buttonStyle: React.CSSProperties = {
    flex: "0 0 auto", // don’t shrink, auto width
    padding: "0.5rem 0.75rem",
    backgroundColor: "#f7f7f7",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    fontSize: "1rem",
    cursor: "pointer",
    color: 'black'
  };

  return (
    <div style={containerStyle}>
      {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, rowIndex) => (
        <div key={rowIndex} style={rowStyle}>
          {row.split("").map((key) => (
            <button
              key={key}
              style={buttonStyle}
              onClick={() => keyPressed(key)}
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              style={buttonStyle}
              onClick={() => keyPressed("Backspace")}
            >
              ←
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default OnScreenKeyboard;
