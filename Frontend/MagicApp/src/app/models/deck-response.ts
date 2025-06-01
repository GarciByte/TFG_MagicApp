import { DeckCard } from "./deck-card";
import { User } from "./user";

export interface DeckResponse{
    id : number;
    name : string;
    description? : string | null;
    userId : number;
    victories : number;
    defeats : number;
    deckCards : DeckCard[];
}