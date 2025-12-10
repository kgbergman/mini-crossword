// CrosswordGrid.jsx

import React from 'react';
import Cell from './Cell'; // Import the new Cell component

// The original component used a complex interface.
// In JSX, we define a functional component without explicit types.

const CrosswordGrid = ({
    grid,
    solution,
    numbers,
    activeCell,
    inputRefs,
    isSolved,
    isCellHighlighted,
    handleClick,
    handleChange,
    handleKeyDown,
}) => {
    return (
        <div className="grid grid-cols-5 w-fit border-2 border-gray-700">
            {grid.map((row, r) =>
                row.map((cellValue, c) => (
                    <Cell
                        key={`${r}-${c}`}
                        r={r}
                        c={c}
                        cellValue={cellValue}
                        solutionCell={solution[r][c]}
                        clueNumber={numbers[r][c]} // Removed 'as number' assertion
                        activeCell={activeCell}
                        isSolved={isSolved}
                        isHighlighted={isCellHighlighted(r, c)}
                        // Pass the specific ref for this cell
                        inputRef={(el) => { // Removed type annotation for 'el'
                            // The inputRefs is a RefObject pointing to a 2D array of input elements.
                            // We must safely assign the element (el) to the current ref object.
                            if (inputRefs.current?.[r]) {
                                inputRefs.current[r][c] = el;
                            }
                        }}
                        // Pass all necessary handlers down
                        handleClick={handleClick}
                        handleChange={handleChange}
                        handleKeyDown={handleKeyDown}
                    />
                ))
            )}
        </div>
    );
};

export default CrosswordGrid;