import { DeckCard } from "./deck-card";

export interface DeckRequest{
    Name : string;
    Description : string;
    UserId : number;
    DeckCards : DeckCard[];
}