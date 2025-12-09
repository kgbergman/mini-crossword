// ClueList.jsx

import React from 'react';

// Removed: import type { WordData, Direction } from './types';
// Removed: interface ClueListProps { ... }
// Removed: React.FC<ClueListProps>

const ClueList = ({ activeClue, direction }) => {
    return (
        <div className="w-full flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-700">
                {/* Use 'direction' if it exists, otherwise default to 'ACROSS' */}
                {direction || 'ACROSS'}
            </h2>

            <div className="text-gray-600 text-lg">
                {activeClue ? (
                    <div className="bg-yellow-100 p-2 rounded-lg">
                        <span className="font-extrabold mr-2">{activeClue.number}.</span>
                        {activeClue.clue}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">Select a cell to begin.</p>
                )}
            </div>
        </div>
    );
};

export default ClueList;