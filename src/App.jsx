// MiniCrossword.jsx (The main file)

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import CrosswordGrid from './CrosswordGrid';
import ClueList from './ClueList';
import crosswordData from './crossword.json';
import OnScreenKeyboard from "./OnScreenKeyboard";

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

    const acrossWordsMap = new Map();
    const downWordsMap = new Map();
    data.clues.forEach(clue => {
      generatedNumbers[clue.row][clue.col] = clue.number;
      for (let i = 0; i < clue.answer.length; i++) {
        if (clue.direction === "ACROSS") {
          generatedSolution[clue.row][clue.col + i] = clue.answer[i];
        }
        else {
          generatedSolution[clue.row + i][clue.col] = clue.answer[i];
        }
      }
    })

    for (const clue of data.clues) {
      const { row, col, direction } = clue;
      const wordCells = [];

      const key = `${row}-${col}`;
      const wordData = { ...clue, cells: wordCells };
      if (direction === 'ACROSS') {
        acrossWordsMap.set(key, wordData);
      } else {
        downWordsMap.set(key, wordData);
      }
    }

    return {
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
  const [currDirection, setCurrDirection] = useState("ACROSS");

  const inputRefs = useRef(
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null))
  );

  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    // Don't run until the puzzle has started
    if (!startRef.current) return;

    const id = setInterval(() => {
      // 1. Update elapsed time
      const now = Date.now();
      setElapsed(Math.floor((now - startRef.current) / 1000));

      // 2. Check if the puzzle is solved
      let solved = true;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const sol = solution[r][c];
          if (sol === "#") continue;

          const gridChar = String(grid[r][c]).toUpperCase();
          const solChar = String(sol).toUpperCase();

          if (gridChar !== solChar) {
            solved = false;
            break;
          }
        }
        if (!solved) break;
      }

      // 3. If solved, stop timer & set state
      if (solved) {
        setIsSolved(true);
        setFeedback("🎉 You solved the puzzle!");
        clearInterval(id);
      }
    }, 100); // runs 10× per second

    return () => clearInterval(id);
  }, [grid, solution]);


  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

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

  const highlightedCells = useMemo(() => {
    const retArray = createEmptyGrid(false);
    for (let i = 0; i < activeClue.answer.length; i++) {
      if (activeClue.direction === "ACROSS") {
        retArray[activeClue.row][activeClue.col + i] = true;
      }
      else {
        retArray[activeClue.row + i][activeClue.col] = true;
      }
    }
    return retArray;
  }, [activeClue]);


  // --- Event Handlers ---
  const handleClick = (r, c) => {
    console.log("HANDLING CLICK");
    setActiveCell(prev => {
      if (prev.r === r && prev.c === c) {
        console.log("CLICKED ACTIVE CELL", currDirection);
        setCurrDirection(currDirection === "ACROSS" ? "DOWN" : "ACROSS");
        return { r, c, direction: currDirection === "ACROSS" ? "DOWN" : "ACROSS" };
      }
      else {
        return { r, c, direction: currDirection };
      }
    });
  };

  const handleChange = useCallback((r, c, val) => {
    updateCell(r, c, val);
  }, [activeCell, solution, inputRefs]);

  const updateCell = (r, c, val) => {
    if (val.length > 1) {
      val = val.charAt(val.length - 1);
    }
    val = val.toUpperCase();

    setGrid(prevGrid => prevGrid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? val : cell))
    ));

    if (val !== "") {
      moveToNextCell(r, c);
    }
    else {
      moveToPrevCell(r, c);
    }
  }

  const moveToNextCell = (fromR, fromC) => {
    //Move to the next space in the active clue if there is one
    if (currDirection === "ACROSS" && activeClue.col + activeClue.answer.length - 1 > fromC) {
      setActiveCell({ r: fromR, c: fromC + 1, direction: currDirection });
      return;
    }
    else if (currDirection === "DOWN" && activeClue.row + activeClue.answer.length - 1 > fromR) {
      setActiveCell({ r: fromR + 1, c: fromC, direction: currDirection });
      return;
    }

    //If there is no more room in the active clue, move to the next clue
    const nextClue = getNextClue(activeClue);
    if (nextClue) {
      setActiveCell({ r: nextClue.row, c: nextClue.col, direction: nextClue.direction });
    }
  }

  const moveToPrevCell = (fromR, fromC) => {
    //Move to the prev space in the active clue if there is one
    if (currDirection === "ACROSS" && fromC > activeClue.col) {
      setActiveCell({ r: fromR, c: fromC - 1, direction: currDirection });
      return;
    }
    else if (currDirection === "DOWN" && fromR > activeClue.row) {
      setActiveCell({ r: fromR - 1, c: fromC, direction: currDirection });
      return;
    }

    //If there is no more room in the active clue, move to last space the prev clue
    const prevClue = getPrevClue(activeClue);
    if (prevClue) {
      if (prevClue.direction === "ACROSS") {
        setActiveCell({ r: prevClue.row, c: prevClue.col + prevClue.answer.length - 1, direction: prevClue.direction });
      }
      else {
        setActiveCell({ r: prevClue.row + prevClue.answer.length - 1, c: prevClue.col, direction: prevClue.direction });
      }
    }
  }

  const getNextClue = (prevClue) => {
    const allClues = data.clues;
    const acrossClues = allClues.filter(clue => clue.direction == "ACROSS");
    const downClues = allClues.filter(clue => clue.direction == "DOWN");

    if (prevClue.direction === "ACROSS") {
      //Find that clue and grab the next one sequentially
      for (let i = 0; i < acrossClues.length; i++) {
        const thisClue = acrossClues[i];
        if (thisClue.answer === prevClue.answer && thisClue.number === prevClue.number) {
          if (i !== acrossClues.length - 1) {
            return acrossClues[i + 1];
          }
        }
      }

      //If we didn't find a clue, go to the first clue in the other direction
      setCurrDirection("DOWN");
      return downClues[0];
    }
    else if (prevClue.direction === "DOWN") {
      //Find that clue and grab the next one sequentially
      for (let i = 0; i < downClues.length; i++) {
        const thisClue = downClues[i];
        if (thisClue.answer === prevClue.answer && thisClue.number === prevClue.number) {
          if (i !== downClues.length - 1) {
            return downClues[i + 1];
          }
        }
      }

      //If we didn't find a clue, go to the first clue in the other direction
      setCurrDirection("ACROSS");
      return acrossClues[0];
    }

    return false;
  }

  const getPrevClue = (currClue) => {
    const allClues = data.clues;
    const acrossClues = allClues.filter(clue => clue.direction == "ACROSS");
    const downClues = allClues.filter(clue => clue.direction == "DOWN");

    if (currClue.direction === "ACROSS") {
      //Find that clue and grab the prev one sequentially
      for (let i = acrossClues.length - 1; i >= 0; i--) {
        const thisClue = acrossClues[i];
        if (thisClue.answer === currClue.answer && thisClue.number === currClue.number) {
          if (i !== 0) {
            return acrossClues[i - 1];
          }
        }
      }

      //If we didn't find a clue, go to the first clue in the other direction
      setCurrDirection("DOWN");
      return downClues[downClues.length - 1];
    }
    else if (currClue.direction === "DOWN") {
      //Find that clue and grab the next one sequentially
      for (let i = downClues.length - 1; i >= 0; i--) {
        const thisClue = downClues[i];
        if (thisClue.answer === currClue.answer && thisClue.number === currClue.number) {
          if (i !== 0) {
            return downClues[i - 1];
          }
        }
      }

      //If we didn't find a clue, go to the first clue in the other direction
      setCurrDirection("ACROSS");
      return acrossClues[acrossClues.length - 1];
    }

    return false;
  }

  const handleKeyDown = (e) => {
    e.preventDefault();
    keyPressed(e.key);
  };

  const keyPressed = (key) => {
    if (isSolved) return;
    const rows = grid.length;
    const cols = grid[0].length;
    let newR = activeCell.r;
    let newC = activeCell.c;
    const r = activeCell.r;
    const c = activeCell.c;
    let focusMoved = false;

    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    if (key === 'Backspace' || key === 'Delete') {
      handleChange(r, c, "");
      return;
    }
    else if (key.includes("Arrow")) {
      switch (key) {
        case 'ArrowUp': newR = Math.max(0, r - 1); focusMoved = true; break;
        case 'ArrowDown': newR = Math.min(rows - 1, r + 1); focusMoved = true; break;
        case 'ArrowLeft': newC = Math.max(0, c - 1); focusMoved = true; break;
        case 'ArrowRight': newC = Math.min(cols - 1, c + 1); focusMoved = true; break;
        default: return;
      }

      if (focusMoved) {
        if (grid[newR][newC] === "#") return;

        if (newR !== r || newC !== c) {
          setActiveCell({ r: newR, c: newC, direction: activeCell?.direction || 'ACROSS' });
        }
      }
    }
    else if (alphabet.includes(key.toUpperCase())) {
      updateCell(r, c, key.toUpperCase());
    }
  }

  useEffect(() => {
    const listener = (e) => handleKeyDown(e);
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [handleKeyDown]);

  // --- Render ---

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(to bottom, #7c3aed, #4f46e5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        aspectRatio: 11 / 18
      }}>

        {/* Timer */}
        <div style={{
          fontSize: '1.25rem',
          fontFamily: 'monospace',
          color: '#374151',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          marginTop: '0.25rem',
          marginBottom: '0.25rem'
        }}>
          ⏱️ {formatTime(elapsed)}
        </div>
        {feedback && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            width: '100%',
            textAlign: 'center',
            backgroundColor: isSolved ? '#bbf7d0' : '#fef3c7',
            color: isSolved ? '#166534' : '#78350f'
          }}>
            {feedback}
          </div>
        )}

        {/* Crossword Grid Component */}
        <CrosswordGrid
          grid={grid}
          solution={solution}
          numbers={numbers}
          activeCell={activeCell}
          inputRefs={inputRefs}
          isSolved={isSolved}
          highlightedCells={highlightedCells}
          handleClick={handleClick}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
        />


        {/* Clue List Component */}
        <ClueList
          activeClue={activeClue}
          direction={activeCell?.direction ?? null}
        />


        {/* On-screen QWERTY keyboard */}
        <OnScreenKeyboard
          keyPressed={keyPressed}
        />
      </div>
    </div>
  )
}