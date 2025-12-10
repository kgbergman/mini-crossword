// CrosswordGrid.tsx

import React, { type RefObject, type KeyboardEvent } from 'react';
import type { ActiveCell } from './types';
import Cell from './Cell';

interface CrosswordGridProps {
    grid: string[][];
    solution: string[][];
    numbers: number[][];
    activeCell: ActiveCell | null;
    highlightedCells: boolean[][];
    inputRefs: RefObject<(HTMLInputElement | null)[][]>;
    isSolved: boolean;
    handleClick: (r: number, c: number) => void;
    handleChange: (r: number, c: number, val: string) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => void;
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
    grid,
    solution,
    numbers,
    activeCell,
    highlightedCells,
    inputRefs,
    isSolved,
    handleClick
}) => {
    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        borderWidth: '2px',
        borderColor: '#374151', // Tailwind gray-700
        backgroundColor: '#ffffff',
        aspectRatio: 1,
        marginBottom: '0.5rem',
        height: '45vh'
    };

    return (
        <div style={gridStyle}>
            {grid.map((row, r) =>
                row.map((cellValue, c) => (
                    <Cell
                        key={`${r}-${c}`}
                        r={r}
                        c={c}
                        cellValue={cellValue}
                        solutionCell={solution[r][c]}
                        clueNumber={numbers[r][c] as number}
                        activeCell={activeCell}
                        isHighlighted={highlightedCells[r][c]}
                        isSolved={isSolved}
                        inputRef={(el: HTMLInputElement | null) => {
                            if (inputRefs.current?.[r]) {
                                inputRefs.current[r][c] = el;
                            }
                        }}
                        handleClick={handleClick}
                    />
                ))
            )}
        </div>
    );
};

export default CrosswordGrid;