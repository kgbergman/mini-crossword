import React, { useState } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin }) {
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [confirmation, setConfirmation] = useState(null);
    const [loading, setLoading] = useState(false);

    const auth = getAuth();

    const startRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: () => console.log("reCAPTCHA solved"),
                }
            );
        }
        return window.recaptchaVerifier;
    };

    const handleSendCode = async () => {
        let formatted = phone.trim();

        // Remove all spaces, dashes, parentheses
        formatted = formatted.replace(/[\s\-()]/g, "");

        // Ensure it starts with "+"
        if (!formatted.startsWith("+")) {
            formatted = "+1" + formatted; // default to US, or ask user
        }

        try {
            setLoading(true);
            const appVerifier = startRecaptcha();
            const result = await signInWithPhoneNumber(auth, formatted, appVerifier);
            setConfirmation(result);
        } catch (err) {
            console.error("SMS error:", err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyCode = async () => {
        if (!code.trim()) return;

        try {
            setLoading(true);
            const res = await confirmation.confirm(code);
            onLogin(res.user);
        } catch (err) {
            console.error("Verification error:", err);
            alert("Invalid code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">

                <h1 className="login-title">Mini Crossword</h1>

                {!confirmation ? (
                    <>
                        <input
                            type="tel"
                            placeholder="+1 555 123 4567"
                            className="login-input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        <button
                            onClick={handleSendCode}
                            disabled={loading}
                            className="login-button primary"
                        >
                            {loading ? "Sending..." : "Send Code"}
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Enter verification code"
                            className="login-input code-input"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />

                        <button
                            onClick={handleVerifyCode}
                            disabled={loading}
                            className="login-button success"
                        >
                            {loading ? "Verifying..." : "Verify Code"}
                        </button>
                    </>
                )}

                <div id="recaptcha-container"></div>
            </div>
        </div>
    );
}
