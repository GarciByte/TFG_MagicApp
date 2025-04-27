using System.Text.Json.Serialization;

namespace MagicApp.Services.Scryfall;

public class ImageUris
{
    [JsonPropertyName("normal")]
    public string Normal { get; set; }
}