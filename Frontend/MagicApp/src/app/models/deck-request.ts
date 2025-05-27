import { CardDetail } from "./card-detail";

export interface DeckRequest{
    Name : string;
    Description : string;
    UserId : number;
    DeckCards : CardDetail[];
}