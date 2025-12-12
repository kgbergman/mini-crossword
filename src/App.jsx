import React, { useEffect, useState } from "react";
import LoginScreen from "./LoginScreen";
import OnboardingScreen from "./OnboardingScreen";
import MiniCrossword from "./CrosswordScreen";
import { auth, onAuthStateChanged, db, ref, set, update } from "./firebase";
import Loading from "./Loading";
import { updateUserFields, setUserData } from "./firebaseUtil";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("loading");

  // Persist login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Save user info to Realtime Database
        update(ref(db, `users/${firebaseUser.uid}`), {
          phone: firebaseUser.phoneNumber,
          lastLogin: Date.now(),
        });

        setScreen("onboarding"); // Or "crossword" if already onboarded
      } else {
        setUser(null);
        setScreen("login");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (firebaseUser) => {
    setUser(firebaseUser);

    updateUserFields(firebaseUser.uid, {
      phone: firebaseUser.phoneNumber,
      lastLogin: Date.now(),
    });

    setScreen("onboarding");
  };

  if (screen === "login")
    return <LoginScreen onLogin={handleLogin} />;

  if (screen === "onboarding")
    return <OnboardingScreen onComplete={() => setScreen("crossword")} />;

  if (screen === "crossword") {
    return <MiniCrossword user={user} />;
  }

  return <Loading />
}
