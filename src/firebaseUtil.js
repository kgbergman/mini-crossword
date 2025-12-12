// firebaseDb.js
import { db } from "./firebase";
import { ref, update, set, get, onValue } from "firebase/database";

// --- User Data ---

export function updateUserFields(uid, fields) {
  return update(ref(db, `users/${uid}`), fields);
}

export function setUserData(uid, data) {
  return set(ref(db, `users/${uid}`), data);
}

export function listenToUser(uid, callback) {
  const userRef = ref(db, `users/${uid}`);
  return onValue(userRef, snapshot => {
    callback(snapshot.val());
  });
}

export function getUser(uid) {
  return get(ref(db, `users/${uid}`));
}

// --- Crossword-specific functions ---

export function updateCurrentPuzzle(uid, puzzleNumber) {
  return update(ref(db, `users/${uid}`), {
    currentPuzzle: puzzleNumber
  });
}

export function updateCurrentTime(uid, seconds) {
  return update(ref(db, `users/${uid}`), {
    currentTime: seconds,
    lastTimestamp: Date.now(),
  });
}

export function listenToCurrentPuzzle(uid, callback) {
  return onValue(ref(db, `users/${uid}/currentPuzzle`), snapshot =>
    callback(snapshot.val())
  );
}

export function initializePuzzleTime(uid) {
  const now = Date.now();
  return update(ref(db, `users/${uid}`), {
    started: now,
    lastTimestamp: now,
  });
}

export function updateLastTimestamp(uid) {
  update(ref(db, `users/${uid}`), {
    lastTimestamp: Date.now()
  });
}

export function getElapsed(uid) {
  return get(ref(db, `users/${uid}/elapsed`));
}

export function setElapsed(uid, seconds) {
  return update(ref(db, `users/${uid}`), { elapsed: seconds });
}

export const savePuzzleGrid = (uid, puzzleId, grid2D) => {
  const flat = flattenGrid(grid2D);
  return update(ref(db, `users/${uid}/puzzles/${puzzleId}`), {
    solution: flat
  });
};

export const loadPuzzleGrid = async (uid, puzzleId) => {
  const snapshot = await get(ref(db, `users/${uid}/puzzles/${puzzleId}/solution`));
  if (!snapshot.exists()) return null;

  return unflattenGrid(snapshot.val());
};

export const flattenGrid = grid => grid.flat();

export const unflattenGrid = arr => {
  const size = 5;
  const grid = [];
  for (let i = 0; i < size; i++) {
    grid.push(arr.slice(i * size, i * size + size));
  }
  return grid;
};

export const markPuzzleSolved = (uid, puzzleId) => {
  return update(ref(db, `users/${uid}/solvedPuzzles`), {
    [puzzleId]: true
  });
};

export const loadSolvedPuzzles = async (uid) => {
  const snapshot = await get(ref(db, `users/${uid}/solvedPuzzles`));
  return snapshot.exists() ? snapshot.val() : {};
};

import crosswordData from './crossword.json';
export const openNextPuzzle = async (uid) => {
  // Load solved puzzle list
  const solvedSnap = await get(ref(db, `users/${uid}/solvedPuzzles`));
  const solvedVal = solvedSnap.exists() ? solvedSnap.val() : {};

  // Get all puzzle IDs from crosswordData
  const allPuzzleIds = Object.keys(crosswordData);

  // Build list of unsolved puzzles
  const unsolved = allPuzzleIds.filter(puzzleId => !solvedVal[puzzleId]);

  // If all puzzles are solved, either restart or return null
  if (unsolved.length === 0) {
    console.warn("All puzzles solved!");
    return null;
  }

  // Pick a random unsolved puzzle
  const newPuzzleId = unsolved[Math.floor(Math.random() * unsolved.length)];

  // Reset puzzle fields in Firebase
  const updates = {
    currentPuzzle: newPuzzleId,
    [`puzzles/${newPuzzleId}/solution`]: Array(25).fill(""),
  };

  await update(ref(db, `users/${uid}`), updates);

  return newPuzzleId;
};

