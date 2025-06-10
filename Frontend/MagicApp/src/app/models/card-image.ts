import { CardType } from "./enums/card-type";
import { Color } from "./enums/color";
import { Rarity } from "./enums/rarity";

export interface CardImage {
    id: string;
    name: string;
    imageUrl: string;
    colors: Color[];
    Rarity: Rarity;
    Types: CardType[];
    Set: string;
}