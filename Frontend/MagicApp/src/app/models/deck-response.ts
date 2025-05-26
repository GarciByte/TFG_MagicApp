import { CardDetail } from "./card-detail";
import { User } from "./user";

export interface DeckResponse{
    Id : number;
    Name : string;
    Description : string;
    User : User;
    Victories : number;
    Defeats : number;
    Color: string;
    DeckIcon: string;
    DeckCards : CardDetail[];
}