// Cell.jsx

import React from 'react';

// Removed: import type { KeyboardEvent, Ref } from 'react';
// Removed: import type { ActiveCell } from './types';
// Removed: interface CellProps { ... }
// Removed: React.FC<CellProps>

const Cell = ({
    r,
    c,
    cellValue,
    clueNumber,
    solutionCell,
    activeCell,
    isSolved,
    isHighlighted,
    inputRef,
    handleClick,
    handleChange,
    handleKeyDown,
}) => {
    // If the solution dictates this is a black cell, we just render the block
    if (solutionCell === "#") {
        return <div key={`${r}-${c}`} className="w-14 h-14 bg-gray-800"></div>;
    }

    const isActive = activeCell?.r === r && activeCell?.c === c;

    return (
        <div key={`${r}-${c}`} className="relative w-14 h-14">
            {/* Clue Number Overlay */}
            {clueNumber > 0 && (
                <span className="absolute top-0.5 left-1 text-xs font-bold text-gray-700 z-10">
                    {clueNumber}
                </span>
            )}
            <input
                ref={inputRef}
                maxLength={1}
                value={cellValue}
                onChange={(e) => handleChange(r, c, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, r, c)}
                onClick={() => handleClick(r, c)}
                onFocus={() => {
                    // Ensure highlight is set if focus moves via tab/shift+tab
                    if (!activeCell || activeCell.r !== r || activeCell.c !== c) {
                        handleClick(r, c);
                    }
                }}
                className={`
                    w-full h-full text-center text-lg font-semibold 
                    text-gray-800 
                    focus:outline-none focus:ring-0
                    border-t border-l border-gray-300
                    ${isSolved ? 'bg-green-100 text-green-700' : ''}
                    ${isActive ? 'bg-yellow-300' : isHighlighted ? 'bg-yellow-100' : 'bg-white'}
                    transition-colors duration-100
                `}
                disabled={isSolved}
            />
        </div>
    );
};

export default Cell;