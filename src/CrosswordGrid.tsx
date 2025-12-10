// CrosswordGrid.tsx
import React, { type RefObject, type KeyboardEvent, useState, useEffect } from 'react';
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
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (isSolved) {
            setShowOverlay(true);
        } else {
            setShowOverlay(false);
        }
    }, [isSolved]);

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
        <div style={{ position: 'relative' }}>
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
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: '0.5rem',
                padding: '0.75rem',
                width: '100%',
                textAlign: 'center',
                zIndex: 999,
                backgroundColor: 'rgba(187, 247, 208, 0.90)',
                color: '#166534',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: showOverlay ? 1 : 0,
                transform: showOverlay ? 'scale(1)' : 'scale(0.8)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                gap: '0.75rem',
                pointerEvents: showOverlay ? 'auto' : 'none',
            }}>
                <div>
                    {"🎉 You solved the puzzle!"}
                </div>
                <div>
                    {"Unfortunately, you failed to solve it in the required time."}
                </div>
                <button style={{
                    backgroundColor: 'darkslategray', // Tailwind emerald-500
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '0.5rem 1.25rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                }}>
                    Next Puzzle
                </button>
            </div>
        </div>
    );
};

export default CrosswordGrid;