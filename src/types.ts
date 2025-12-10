// types.ts

export type Direction = 'ACROSS' | 'DOWN';

export interface Clue {
    number: number;
    clue: string;
    row: number;
    col: number;
    answer: string;
    direction: string;
}

export interface WordData extends Clue {
    cells: string[]; // e.g., ["0-3", "0-4", "0-5"]
}

export interface ActiveCell {
    r: number;
    c: number;
    direction: Direction;
}

// Defines the shape of the data structure from crossword.json
export interface CrosswordData {
    clues: Clue[]
}