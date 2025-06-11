import { CardDetail } from "./card-detail";

export interface DeckResponse{
    id : number;
    name : string;
    description? : string | null;
    userId : number;
    victories : number;
    defeats : number;
    deckCards : CardDetail[];
}