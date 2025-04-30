export interface CardDetail {
    id: string;
    name: string;
    imageUrl: string;
    manaCost: string;
    cmc: number;
    manaSymbolUrls: string[];
    typeLine: string;
    oracleText: string;
    oracleTextHtml: string;
    power?: string;
    toughness?: string;
    colors: string[];
    colorIdentity: string[];
    setName: string;
    collectorNumber: string;
    rarity: string;
    priceEur: string;
    purchaseCardmarket: string;
    keywords: string[];
    legalities: Record<string, string>;
}