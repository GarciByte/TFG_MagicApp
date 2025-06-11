using System.Text.Json.Serialization;

namespace MagicApp.Services.Scryfall;

public class CardFace
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("image_uris")]
    public ImageUris ImageUris { get; set; }

    [JsonPropertyName("oracle_text")]
    public string OracleText { get; set; }

    [JsonPropertyName("flavor_text")]
    public string FlavorText { get; set; }
}