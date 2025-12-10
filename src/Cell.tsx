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
        flex: 1,
        aspectRatio: 1
    };

    const clueNumberStyle: React.CSSProperties = {
        position: 'absolute',
        top: '0.125rem',
        left: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: '#374151', // gray-700
        zIndex: 10
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 600,
        color: '#1f2937',
        borderTop: '1px solid #d1d5db',
        borderLeft: '1px solid #d1d5db',
        outline: 'none',
        backgroundColor,
        transition: 'background-color 0.1s',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...solvedStyle
    };

    return (
        <div key={`${r}-${c}`} style={cellContainerStyle}>
            {clueNumber > 0 && (
                <span style={clueNumberStyle}>{clueNumber}</span>
            )}
            <div
                ref={inputRef}
                tabIndex={-1}
                onClick={() => handleClick(r, c)}
                style={inputStyle}
            >
                {cellValue[0]}
            </div>
        </div>
    );
};

export default Cell;
