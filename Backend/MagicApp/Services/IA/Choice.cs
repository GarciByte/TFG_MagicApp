using Newtonsoft.Json;

namespace MagicApp.Services.IA;

// Respuesta de OpenRouter
public class Choice
{
    [JsonProperty("message")]
    public InnerMessage Message { get; set; } = null!;
}