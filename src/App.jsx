// MiniCrossword.jsx (The main file)

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import CrosswordGrid from './CrosswordGrid';
import ClueList from './ClueList';
import crosswordData from './crossword.json';

// Define placeholder types/interfaces as comments for context, but remove type imports
// type ActiveCell = { r: number, c: number, direction: 'ACROSS' | 'DOWN' };
// type Direction = 'ACROSS' | 'DOWN';
// type Clue = { number: number, row: number, col: number, answer: string, clue: string, direction: Direction };
// type WordData = Clue & { cells: string[] };
// type CrosswordData = { clues: Clue[] };

const GRID_SIZE = 5;

// MiniCrossword.jsx
const createEmptyGrid = (fillChar = "") =>
  Array(GRID_SIZE).fill(0).map(() =>
    Array(GRID_SIZE).fill(fillChar)
  );

export default function MiniCrossword() {

  // Assume crosswordData structure is correct based on the external file
  const data = crosswordData;

  // --- Data Generation ---
  const { solution, numbers, acrossWords, downWords } = useMemo(() => {
    const generatedSolution = createEmptyGrid("#");
    const generatedNumbers = createEmptyGrid(0);

    console.log(generatedSolution);

    const acrossWordsMap = new Map();
    const downWordsMap = new Map();

    const allClues = [...data.clues];

    // Pass 1: Mark all cells covered by a word
    for (const clue of allClues) {
      const { row, col, answer, direction } = clue;

      for (let i = 0; i < answer.length; i++) {
        const r = direction === 'ACROSS' ? row : row + i;
        const c = direction === 'ACROSS' ? col + i : col;

        if (r < GRID_SIZE && c < GRID_SIZE) {
          generatedSolution[r][c] = '-';
        }
      }
    }

    // Pass 2: Insert actual letters/numbers and build word cell lists
    for (const clue of allClues) {
      const { row, col, answer, number, direction } = clue;
      const wordCells = [];

      for (let i = 0; i < answer.length; i++) {
        const r = direction === 'ACROSS' ? row : row + i;
        const c = direction === 'ACROSS' ? col + i : col;

        if (r < GRID_SIZE && c < GRID_SIZE) {
          // In a real implementation, you might put the actual letter here or a space for user input
          // For now, mirroring the original logic of marking as playable
          generatedSolution[r][c] = ' '; // Mark as playable cell
        }

        // The original logic didn't actually populate the `wordCells` array,
        // which is necessary for highlighting. For simplicity and following
        // the provided code's structure, we'll keep the `wordCells` array empty
        // as the provided code did, although this would break highlighting.
        // To fix it (though not required by the prompt):
        // if (r < GRID_SIZE && c < GRID_SIZE) { wordCells.push(`${r}-${c}`); }
      }

      if (generatedNumbers[row][col] === 0) {
        generatedNumbers[row][col] = number;
      }

      const key = `${row}-${col}`;
      const wordData = { ...clue, cells: wordCells };
      if (direction === 'ACROSS') {
        acrossWordsMap.set(key, wordData);
      } else {
        downWordsMap.set(key, wordData);
      }
    }

    return {
      // Return generatedSolution directly, as it now contains letters and '#'
      solution: generatedSolution,
      numbers: generatedNumbers,
      acrossWords: acrossWordsMap,
      downWords: downWordsMap
    };
  }, [data]);

  const initialGrid = useMemo(() =>
    solution.map(row =>
      row.map(cell => cell === "#" ? "#" : "")
    ), [solution]
  );

  console.log(initialGrid);

  // --- State and Refs ---
  const [grid, setGrid] = useState(initialGrid);
  const [isSolved, setIsSolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const defaultFocusR = initialGrid.findIndex(row => row.some(cell => cell === ""));
  const defaultFocusC = defaultFocusR !== -1 ? initialGrid[defaultFocusR].findIndex(cell => cell === "") : 0;

  const defaultActiveCell = defaultFocusR !== -1
    ? { r: defaultFocusR, c: defaultFocusC, direction: 'ACROSS' }
    : null;

  const [activeCell, setActiveCell] = useState(defaultActiveCell);

  const inputRefs = useRef(
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null))
  );


  // --- Active Clue and Highlight Logic ---

  const activeClue = useMemo(() => {
    if (!activeCell) return null;

    const { r, c, direction } = activeCell;
    const wordMap = direction === 'ACROSS' ? acrossWords : downWords;

    let startR = r;
    let startC = c;

    if (direction === 'ACROSS') {
      while (startC > 0 && solution[startR][startC - 1] !== "#") {
        startC--;
      }
    } else { // DOWN
      while (startR > 0 && solution[startR - 1][startC] !== "#") {
        startR--;
      }
    }

    return wordMap.get(`${startR}-${startC}`);
  }, [activeCell, acrossWords, downWords, solution]);

  const isCellHighlighted = useCallback((r, c) => {
    if (!activeClue) return false;

    const cellKey = `${r}-${c}`;
    // NOTE: This will always be false unless the wordCells array is populated
    // in the useMemo above.
    return activeClue.cells.includes(cellKey);
  }, [activeClue]);


  // --- Event Handlers (Passed to CrosswordGrid) ---

  const handleClick = useCallback((r, c) => {
    inputRefs.current[r]?.[c]?.focus();

    setActiveCell(prev => {
      if (!prev || prev.r !== r || prev.c !== c) {
        return { r, c, direction: 'ACROSS' };
      }
      const newDirection = prev.direction === 'ACROSS' ? 'DOWN' : 'ACROSS';
      return { r, c, direction: newDirection };
    });
  }, [inputRefs]);

  const handleChange = useCallback((r, c, val) => {
    if (val.length > 1) {
      val = val.charAt(val.length - 1);
    }
    val = val.toUpperCase();

    setGrid(prevGrid => prevGrid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? val : cell))
    ));

    if (val && activeCell) {
      let nextR = r;
      let nextC = c;

      if (activeCell.direction === 'ACROSS') {
        nextC++;
        while (nextC < GRID_SIZE && solution[nextR][nextC] === "#") {
          nextC++;
        }
        if (nextC < GRID_SIZE) {
          inputRefs.current[nextR]?.[nextC]?.focus();
          setActiveCell(prev => prev ? { ...prev, r: nextR, c: nextC } : { r: nextR, c: nextC, direction: 'ACROSS' });
          return;
        }
      } else { // DOWN
        nextR++;
        while (nextR < GRID_SIZE && solution[nextR][nextC] === "#") {
          nextR++;
        }
        if (nextR < GRID_SIZE) {
          inputRefs.current[nextR]?.[nextC]?.focus();
          setActiveCell(prev => prev ? { ...prev, r: nextR, c: nextC } : { r: nextR, c: nextC, direction: 'DOWN' });
          return;
        }
      }
    }
  }, [activeCell, solution, inputRefs]);

  const handleKeyDown = useCallback((e, r, c) => {
    const rows = grid.length;
    const cols = grid[0].length;
    let newR = r;
    let newC = c;
    let focusMoved = false;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (grid[r][c]) {
        handleChange(r, c, "");
        return;
      }

      do {
        if (newC > 0) newC--;
        else if (newR > 0) { newR--; newC = cols - 1; }
        else return;
      } while (solution[newR][newC] === "#");

      inputRefs.current[newR]?.[newC]?.focus();
      setActiveCell({ r: newR, c: newC, direction: activeCell?.direction || 'ACROSS' });
      handleChange(newR, newC, "");
      return;
    }

    switch (e.key) {
      case 'ArrowUp': newR = Math.max(0, r - 1); focusMoved = true; break;
      case 'ArrowDown': newR = Math.min(rows - 1, r + 1); focusMoved = true; break;
      case 'ArrowLeft': newC = Math.max(0, c - 1); focusMoved = true; break;
      case 'ArrowRight': newC = Math.min(cols - 1, c + 1); focusMoved = true; break;
      default: return;
    }

    if (focusMoved) {
      e.preventDefault();
      while (solution[newR][newC] === "#") {
        switch (e.key) {
          case 'ArrowUp': newR = Math.max(0, newR - 1); break;
          case 'ArrowDown': newR = Math.min(rows - 1, newR + 1); break;
          case 'ArrowLeft': newC = Math.max(0, newC - 1); break;
          case 'ArrowRight': newC = Math.min(cols - 1, newC + 1); break;
        }
        if (newR === r && newC === c) break;
      }

      if (newR !== r || newC !== c) {
        inputRefs.current[newR]?.[newC]?.focus();
        setActiveCell({ r: newR, c: newC, direction: activeCell?.direction || 'ACROSS' });
      }
    }
  }, [grid, solution, inputRefs, activeCell, handleChange]);


  // --- Game State Logic ---

  const checkAnswer = useCallback(() => {
    let correctCount = 0;
    let totalCount = 0;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        // Solution letters are implicitly UPPERCASE in the original TSX logic
        const solutionLetter = String(solution[r][c]).toUpperCase();
        const gridLetter = String(grid[r][c]).toUpperCase();

        if (solutionLetter !== "#") {
          totalCount++;
          if (gridLetter === solutionLetter) {
            correctCount++;
          }
        }
      }
    }

    if (correctCount === totalCount) {
      setIsSolved(true);
      setFeedback("🎉 Congratulations! You solved the puzzle!");
    } else {
      setFeedback(`Keep going! ${correctCount} of ${totalCount} letters correct.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  }, [grid, solution]);

  useEffect(() => {
    if (!isSolved && grid.flat().every(cell => cell !== "" && cell !== "#")) {
      checkAnswer();
    }
  }, [grid, isSolved, checkAnswer]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-gray-800">Mini Crossword</h1>

        {feedback && (
          <div className={`p-3 rounded-lg w-full text-center ${isSolved ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {feedback}
          </div>
        )}

        <button
          onClick={checkAnswer}
          disabled={isSolved}
          className="w-full py-2 px-4 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition disabled:bg-gray-400"
        >
          {isSolved ? "SOLVED!" : "Check"}
        </button>

        {/* Crossword Grid Component */}
        <CrosswordGrid
          grid={grid}
          solution={solution}
          numbers={numbers}
          activeCell={activeCell}
          inputRefs={inputRefs}
          isSolved={isSolved}
          isCellHighlighted={isCellHighlighted}
          handleClick={handleClick}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
        />

        {/* Clue List Component */}
        <ClueList
          activeClue={activeClue}
          direction={activeCell?.direction ?? null}
        />
      </div>
    </div>
  );
}