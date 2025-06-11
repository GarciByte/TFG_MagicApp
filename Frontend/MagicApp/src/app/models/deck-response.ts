import { CardDetail } from "./card-detail";
import { User } from "./user";

export interface DeckResponse{
    id : number;
    name : string;
    description? : string | null;
    userId : number;
    victories : number;
    defeats : number;
    deckCards : CardDetail[];
}