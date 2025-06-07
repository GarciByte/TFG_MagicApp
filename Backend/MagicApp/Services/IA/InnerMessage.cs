using Newtonsoft.Json;

namespace MagicApp.Services.IA;

// Parte interna de la respuesta de OpenRouter
public class InnerMessage
{
    [JsonProperty("role")]
    public string Role { get; set; } = null!;

    [JsonProperty("content")]
    public string Content { get; set; } = null!;
}