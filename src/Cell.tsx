// Cell.tsx

import React, { type Ref } from 'react';
import type { ActiveCell } from './types';

interface CellProps {
    r: number;
    c: number;
    cellValue: string;
    clueNumber: number;
    solutionCell: string;
    activeCell: ActiveCell | null;
    isHighlighted: boolean;
    isSolved: boolean;
    inputRef: Ref<HTMLInputElement>;
    handleClick: (r: number, c: number) => void;
}

const Cell: React.FC<CellProps> = ({
    r,
    c,
    cellValue,
    clueNumber,
    solutionCell,
    activeCell,
    isHighlighted,
    isSolved,
    inputRef,
    handleClick
}) => {
    if (solutionCell === "#") {
        const blackCellStyle: React.CSSProperties = {
            display: 'flex',
            flex: 1,
            backgroundColor: '#1f2937' // Tailwind gray-800
        };
        return <div key={`${r}-${c}`} style={blackCellStyle}></div>;
    }

    const isActive = activeCell?.r === r && activeCell?.c === c;
    const backgroundColor = isActive ? '#fcd34d' : isHighlighted ? '#93c5fd' : '#ffffff';
    const solvedStyle = isSolved ? { backgroundColor: '#d1fae5', color: '#047857' } : {};

    const cellContainerStyle: React.CSSProperties = {
        position: 'relative',
        display: 'flex',
        flex: 1
    };

    const clueNumberStyle: React.CSSProperties = {
        position: 'absolute',
        top: '0.125rem',
        left: '0.25rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#374151', // gray-700
        zIndex: 10
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: 600,
        color: '#1f2937',
        borderTop: '1px solid #d1d5db',
        borderLeft: '1px solid #d1d5db',
        outline: 'none',
        backgroundColor,
        transition: 'background-color 0.1s',
        ...solvedStyle
    };

    return (
        <div key={`${r}-${c}`} style={cellContainerStyle}>
            {clueNumber > 0 && (
                <span style={clueNumberStyle}>{clueNumber}</span>
            )}
            <input
                ref={inputRef}
                maxLength={1}
                tabIndex={-1}
                value={cellValue}
                onClick={() => handleClick(r, c)}
                style={inputStyle}
                disabled={isSolved}
            />
        </div>
    );
};

export default Cell;
