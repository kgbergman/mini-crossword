// MiniCrossword.jsx (The main file)

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import CrosswordGrid from './CrosswordGrid';
import ClueList from './ClueList';
import crosswordData from './crossword.json';
import OnScreenKeyboard from "./OnScreenKeyboard";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { updateCurrentTime, listenToCurrentPuzzle, getUser, updateLastTimestamp, initializePuzzleTime, updateUserFields, loadPuzzleGrid, savePuzzleGrid, markPuzzleSolved, openNextPuzzle } from "./firebaseUtil";

const GRID_SIZE = 5;

// MiniCrossword.jsx
const createEmptyGrid = (fillChar = "") =>
    Array(GRID_SIZE).fill(0).map(() =>
        Array(GRID_SIZE).fill(fillChar)
    );

export default function MiniCrossword({ user }) {

    const [current, setCurrent] = useState("2014-08-21");

    useEffect(() => {
        if (!user) return;

        const unsubscribe = listenToCurrentPuzzle(user.uid, (puzzleNum) => {
            if (puzzleNum) setCurrent(puzzleNum);
        });

        return unsubscribe;
    }, [user]);

    // Assume crosswordData structure is correct based on the external file
    const data = useMemo(() => {
        return crosswordData[current] || [];
    }, [current]);

    // --- Data Generation ---
    const { solution, numbers, acrossWords, downWords } = useMemo(() => {
        const generatedSolution = createEmptyGrid("#");
        const generatedNumbers = createEmptyGrid(0);

        const acrossWordsMap = new Map();
        const downWordsMap = new Map();
        data.forEach(clue => {
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

        for (const clue of data) {
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

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Find the first Across clue first, otherwise the first Down clue.
        const firstAcross = data.find(c => c.direction === "ACROSS");
        const firstDown = data.find(c => c.direction === "DOWN");

        const first = firstAcross || firstDown;
        if (!first) return;

        setCurrDirection(first.direction);
        setActiveCell({
            r: first.row,
            c: first.col,
            direction: first.direction
        });
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
        if (!user || !current) return;

        loadPuzzleGrid(user.uid, current).then((savedGrid) => {
            if (savedGrid) {
                setGrid(savedGrid);
            }
        });
    }, [user, current]);

    useEffect(() => {
        if (!user) return;

        getUser(user.uid).then(snapshot => {
            const data = snapshot.val();
            const saved = data?.time ?? 0;

            setElapsed(saved);

            // reset local timer start
            startRef.current = Date.now() - saved;
        });
    }, [user]);

    useEffect(() => {
        // Don't run until the puzzle has started
        if (!startRef.current) return;

        const id = setInterval(() => {
            const now = Date.now();
            const intervalElapsedMs = now - startRef.current;

            const total = elapsed + intervalElapsedMs;

            // Push new elapsed to database
            updateUserFields(user.uid, { time: total });

            // Update local baseline
            setElapsed(Math.floor(total / 1000));

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
                setIsSolved(true);// Mark solved in Firebase
                markPuzzleSolved(user.uid, current);
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
        if (activeClue) {
            for (let i = 0; i < activeClue.answer.length; i++) {
                if (activeClue.direction === "ACROSS") {
                    retArray[activeClue.row][activeClue.col + i] = true;
                }
                else {
                    retArray[activeClue.row + i][activeClue.col] = true;
                }
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

        const copy = grid.map(row => [...row]);
        copy[r][c] = val.toUpperCase();

        setGrid(copy);

        if (user && current) {
            savePuzzleGrid(user.uid, current, copy);
        }

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
        const allClues = data;
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

    const leftClicked = () => {
        const prevClue = getPrevClue(activeClue);
        if (prevClue) {
            if (prevClue.direction === "ACROSS") {
                setActiveCell({ r: prevClue.row, c: prevClue.col, direction: prevClue.direction });
            }
            else {
                setActiveCell({ r: prevClue.row, c: prevClue.col, direction: prevClue.direction });
            }
        }
    }

    const rightClicked = () => {
        //If there is no more room in the active clue, move to the next clue
        const nextClue = getNextClue(activeClue);
        if (nextClue) {
            setActiveCell({ r: nextClue.row, c: nextClue.col, direction: nextClue.direction });
        }
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

    const TOTAL_PUZZLES = 10;
    const handleNextPuzzle = async () => {
        if (!user) return;

        const nextId = await openNextPuzzle(user.uid, TOTAL_PUZZLES);
        setCurrent(nextId);         // switch UI
        setGrid(Array(5).fill().map(() => Array(5).fill(""))); // reset local grid
        setElapsed(0);
        setIsSolved(false);
        startRef.current = Date.now();
    };

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
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                maxWidth: '75vh'
            }}>

                {/* Timer */}
                <div style={{
                    fontSize: '1.25rem',
                    fontFamily: 'monospace',
                    color: '#374151',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    marginTop: '0.25rem',
                    marginBottom: '0.25rem',
                    display: 'flex'
                }}>
                    ⏱️ {formatTime(elapsed)}
                </div>

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
                    handleNextPuzzle={handleNextPuzzle}
                />


                {/* Clue List Component */}
                <ClueList
                    activeClue={activeClue}
                    leftClicked={leftClicked}
                    rightClicked={rightClicked}
                />


                {/* On-screen QWERTY keyboard */}
                <OnScreenKeyboard
                    keyPressed={keyPressed}
                />
            </div>
        </div>
    )
}