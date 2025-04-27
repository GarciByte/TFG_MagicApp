using System.Text.Json.Serialization;

namespace MagicApp.Services.Scryfall;

public class CardData
{
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("image_uris")]
    public ImageUris ImageUris { get; set; }

    [JsonPropertyName("card_faces")]
    public List<CardFace> CardFaces { get; set; }
}