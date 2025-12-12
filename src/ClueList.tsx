// ClueList.tsx

import React from 'react';
import type { WordData } from './types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './ClueList.css';

interface ClueListProps {
    activeClue: WordData;
    leftClicked: () => void;
    rightClicked: () => void;
}

const ClueList: React.FC<ClueListProps> = ({ activeClue, leftClicked, rightClicked }) => {
    const containerStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        marginBottom: '0.5rem'
    };

    const textStyle: React.CSSProperties = {
        color: '#4b5563', // gray-600
        fontSize: '1.125rem',
        flex: 1
    };

    const clueBoxStyle: React.CSSProperties = {
        backgroundColor: '#bfdbfe', // blue-200
        borderRadius: '0.5rem',
        height: '3.5rem',
        display: 'flex',
        alignItems: 'center',
        lineHeight: '1.25rem',
        overflow: 'hidden',
    };

    const clueTextStyle: React.CSSProperties = {
        flex: 1
    };

    const clueNumberStyle: React.CSSProperties = {
        fontWeight: 800,
        marginRight: '0.5rem'
    };

    if (activeClue) {
        return (
            <div style={containerStyle}>
                <div style={textStyle}>
                    <div style={clueBoxStyle}>
                        <button onClick={leftClicked} className='clue-button'>
                            <ChevronLeftIcon />
                        </button>
                        <div style={clueTextStyle}>
                            <span style={clueNumberStyle}>{activeClue.number}.</span>
                            <span>{activeClue.clue}</span>
                        </div>
                        <button onClick={rightClicked} className='clue-button'>
                            <ChevronRightIcon />
                        </button>
                    </div>

                </div>
            </div>
        );
    }
    else {
        return (
            <div style={containerStyle}>
                <div style={textStyle}>
                    <div style={clueBoxStyle}>
                        <button onClick={leftClicked} className='clue-button'>
                            <ChevronLeftIcon />
                        </button>
                        <div style={clueTextStyle}>
                            <span>...</span>
                        </div>
                        <button onClick={rightClicked} className='clue-button'>
                            <ChevronRightIcon />
                        </button>
                    </div>

                </div>
            </div>
        );
    }
};

export default ClueList;
