import { CardType } from "./enums/card-type";
import { Color } from "./enums/color";
import { Rarity } from "./enums/rarity";

export interface CardFilter {
    Page: number;
    Name: string;
    Colors: Color[];
    Rarity: Rarity;
    Types: CardType[];
}