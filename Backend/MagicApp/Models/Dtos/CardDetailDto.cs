namespace MagicApp.Models.Dtos;

public class CardDetailDto
{
    public string Id { get; set; }

    public string Name { get; set; }

    public string ImageUrl { get; set; }

    public string ManaCost { get; set; }

    public decimal Cmc { get; set; }

    public List<string> ManaSymbolUrls { get; set; }

    public string TypeLine { get; set; }

    public string OracleText { get; set; }

    public string OracleTextHtml { get; set; }

    public string Power { get; set; }

    public string Toughness { get; set; }

    public List<string> Colors { get; set; }

    public List<string> ColorIdentity { get; set; }

    public string SetName { get; set; }

    public string CollectorNumber { get; set; }

    public string Rarity { get; set; }

    public string PriceEur { get; set; }

    public string PurchaseCardmarket { get; set; }

    public List<string> Keywords { get; set; }

    public Dictionary<string, string> Legalities { get; set; }
}