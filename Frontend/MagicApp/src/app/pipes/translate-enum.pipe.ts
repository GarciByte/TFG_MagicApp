import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateEnum',
  standalone: true
})
export class TranslateEnumPipe implements PipeTransform { // Traducir 'Tipo de carta' y 'Rareza'

  private genderMap: Record<string, 'm' | 'f'> = {
    CREATURE: 'f',
    INSTANT: 'm',
    SORCERY: 'm',
    ENCHANTMENT: 'm',
    ARTIFACT: 'm',
    LAND: 'f',
    PLANESWALKER: 'm',
    TRIBAL: 'm'
  };

  constructor(private translate: TranslateService) { }

  private agree(text: string, gender: 'm' | 'f'): string {
    if (gender === 'm' && text.endsWith('a')) {
      return text.slice(0, -1) + 'o';
    }
    if (gender === 'f' && text.endsWith('o')) {
      return text.slice(0, -1) + 'a';
    }
    return text;
  }

  transform(
    value: string,
    namespace: 'RARITY' | 'CARD_TYPE' | 'SUPERTYPE' | 'SUBTYPE'
  ): string {
    if (!value) return '';

    // Rareza
    if (namespace === 'RARITY') {
      return this.translate.instant(`RARITY.${value.toUpperCase()}`);
    }

    // Tipos de carta
    const [mainPart, subPart] = value.split('—').map(s => s.trim());
    const tokens = mainPart.split(/\s+/);

    const mapped = tokens.map(tok => {

      const upper = tok.toUpperCase();
      const superKey = `SUPERTYPE.${upper}`;
      const sup = this.translate.instant(superKey);

      if (sup !== superKey) {
        return { kind: 'super' as const, key: upper, text: sup };
      }

      const typeKey = `CARD_TYPE.${upper}`;
      const typ = this.translate.instant(typeKey);

      if (typ !== typeKey) {
        return { kind: 'type' as const, key: upper, text: typ };
      }

      return { kind: 'other' as const, key: upper, text: tok };
    });

    const firstType = mapped.find(m => m.kind === 'type');
    const gender: 'm' | 'f' = firstType ? this.genderMap[firstType.key] || 'm' : 'm';

    const lang = this.translate.currentLang;
    let ordered: string[];

    if (namespace === 'CARD_TYPE' && lang === 'es') {

      const types = mapped.filter(m => m.kind === 'type').map(m => m.text);
      const sups = mapped
        .filter(m => m.kind === 'super')
        .map(m => this.agree(m.text, gender));

      const others = mapped.filter(m => m.kind === 'other').map(m => m.text);
      ordered = [...types, ...sups, ...others];

    } else {
      ordered = mapped.map(m => m.text);
    }

    const translatedMain = ordered.join(' ');

    if (subPart) {
      const translatedSub = subPart
        .split(/\s+/)
        .map(tok => {
          const subKey = `SUBTYPE.${tok.toUpperCase()}`;
          const tr = this.translate.instant(subKey);
          return tr !== subKey ? tr : tok;
        })
        .join(' ');
      return `${translatedMain} — ${translatedSub}`;
    }

    return translatedMain;
  }
}
