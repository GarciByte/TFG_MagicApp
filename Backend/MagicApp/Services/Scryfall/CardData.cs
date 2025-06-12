using System.Text.Json.Serialization;

namespace MagicApp.Services.Scryfall
{
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

        [JsonPropertyName("colors")]
        public List<string> Colors { get; set; }

        [JsonPropertyName("rarity")]
        public string Rarity { get; set; }

        [JsonPropertyName("type_line")]
        public string TypeLine { get; set; }

        [JsonPropertyName("set_name")]
        public string SetName { get; set; }
    }
}
