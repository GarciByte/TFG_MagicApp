using System.Text.Json.Serialization;

namespace MagicApp.Services.Scryfall;

public class CardFace
{
    [JsonPropertyName("image_uris")]
    public ImageUris ImageUris { get; set; }
}