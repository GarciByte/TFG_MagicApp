using System.Text.Json.Serialization;

namespace MagicApp.Services.Scryfall;

public class CardDetailResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("image_uris")]
    public ImageUris ImageUris { get; set; }

    [JsonPropertyName("mana_cost")]
    public string ManaCost { get; set; }

    [JsonPropertyName("cmc")]
    public decimal Cmc { get; set; }

    [JsonPropertyName("type_line")]
    public string TypeLine { get; set; }

    [JsonPropertyName("oracle_text")]
    public string OracleText { get; set; }

    [JsonPropertyName("power")]
    public string Power { get; set; }

    [JsonPropertyName("toughness")]
    public string Toughness { get; set; }

    [JsonPropertyName("colors")]
    public List<string> Colors { get; set; }

    [JsonPropertyName("color_identity")]
    public List<string> ColorIdentity { get; set; }

    [JsonPropertyName("set_name")]
    public string SetName { get; set; }

    [JsonPropertyName("collector_number")]
    public string CollectorNumber { get; set; }

    [JsonPropertyName("rarity")]
    public string Rarity { get; set; }

    [JsonPropertyName("prices")]
    public Dictionary<string, string> Prices { get; set; }

    [JsonPropertyName("purchase_uris")]
    public Dictionary<string, string> PurchaseUris { get; set; }

    [JsonPropertyName("keywords")]
    public List<string> Keywords { get; set; }

    [JsonPropertyName("legalities")]
    public Dictionary<string, string> Legalities { get; set; }
}