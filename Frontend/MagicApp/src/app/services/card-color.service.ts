import { Injectable } from '@angular/core';
import { Color } from '../models/enums/color';

@Injectable({
  providedIn: 'root'
})
export class CardColorService {
   colors: Color[] = [];
 
   constructor() { }
 
   cardColor(color: Color, isSelected: boolean): Color[] {
     const index = this.colors.indexOf(color);
 
     if (isSelected && index === -1) {
       this.colors.push(color);
     } else if (!isSelected && index !== -1) {
       this.colors.splice(index, 1);
     }
 
     console.log(this.colors);
     return this.colors;
   }
}
