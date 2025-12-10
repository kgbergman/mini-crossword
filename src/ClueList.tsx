// ClueList.tsx

import React from 'react';
import type { WordData, Direction } from './types';

interface ClueListProps {
    activeClue: WordData | null | undefined;
    direction: Direction | null;
}

const ClueList: React.FC<ClueListProps> = ({ activeClue }) => {
    const containerStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    };

    const textStyle: React.CSSProperties = {
        color: '#4b5563', // gray-600
        fontSize: '1.125rem' // text-lg
    };

    const clueBoxStyle: React.CSSProperties = {
        backgroundColor: '#bfdbfe', // blue-200
        padding: '0.5rem',
        borderRadius: '0.5rem',
        height: '3.5rem',
        display: 'flex',
        alignItems: 'center',
        lineHeight: '1.25rem',
        overflow: 'hidden',
    };

    const clueNumberStyle: React.CSSProperties = {
        fontWeight: 800,
        marginRight: '0.5rem'
    };

    const placeholderStyle: React.CSSProperties = {
        color: '#9ca3af', // gray-400
        fontStyle: 'italic'
    };

    return (
        <div style={containerStyle}>
            <div style={textStyle}>
                {activeClue ? (
                    <div style={clueBoxStyle}>
                        <span style={clueNumberStyle}>{activeClue.number}.</span>
                        <span>{activeClue.clue}</span>
                    </div>
                ) : (
                    <p style={placeholderStyle}>Select a cell to begin.</p>
                )}
            </div>
        </div>
    );
};

export default ClueList;
