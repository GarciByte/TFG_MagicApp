import { Injectable } from '@angular/core';
import { CardType } from '../models/enums/card-type';

@Injectable({
  providedIn: 'root'
})
export class CardTypeService {
  types: CardType[] = [];

  constructor() { }

  cardType(type: CardType, isSelected: boolean): CardType[] {
    const index = this.types.indexOf(type);

    if (isSelected && index === -1) {
      this.types.push(type);
    } else if (!isSelected && index !== -1) {
      this.types.splice(index, 1);
    }

    return this.types;
  }
}