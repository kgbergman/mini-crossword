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
        gap: "0.375rem",
    };

    const spacingStyle: React.CSSProperties = {
        width: '1rem'
    };

    const buttonStyle: React.CSSProperties = {
        flex: "0 1 auto", // shrink if needed, don't force fill
        padding: "0.5rem 0.75rem",
        backgroundColor: "#f7f7f7",
        borderRadius: "0.75rem",
        height: '6vh',
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        fontSize: "0.75rem",
        cursor: "pointer",
        color: 'black',
        minWidth: "2rem"
    };

    const backspaceSpacingStyle: React.CSSProperties = {
        flex: "1",
        padding: "0.5rem 0.75rem",
        backgroundColor: "transparent",
        borderRadius: "0.75rem",
        fontSize: "1rem",
        fontWeight: 'bold',
        color: 'transparent'
    };

    const backspaceStyle: React.CSSProperties = {
        flex: "1",
        padding: "0.5rem 0.75rem",
        backgroundColor: "#999",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        fontSize: "1rem",
        fontWeight: 'bold',
        cursor: "pointer",
        color: 'black'
    };

    return (
        <div style={containerStyle}>
            <div key={0} style={rowStyle}>
                {"QWERTYUIOP".split("").map((key) => (
                    <button
                        key={key}
                        style={buttonStyle}
                        onClick={() => keyPressed(key)}
                    >
                        {key}
                    </button>
                ))}
            </div>
            <div key={1} style={rowStyle}>
                <div style={spacingStyle} />
                {"ASDFGHJKL".split("").map((key) => (
                    <button
                        key={key}
                        style={buttonStyle}
                        onClick={() => keyPressed(key)}
                    >
                        {key}
                    </button>
                ))}
                <div style={spacingStyle} />
            </div>
            <div key={2} style={rowStyle}>
                <div
                    style={backspaceSpacingStyle}
                >
                    ←
                </div>
                {"ZXCVBNM".split("").map((key) => (
                    <button
                        key={key}
                        style={buttonStyle}
                        onClick={() => keyPressed(key)}
                    >
                        {key}
                    </button>
                ))}
                <button
                    style={backspaceStyle}
                    onClick={() => keyPressed("Backspace")}
                >
                    ←
                </button>
            </div>
        </div>
    );
};

export default OnScreenKeyboard;
