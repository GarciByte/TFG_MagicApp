using Newtonsoft.Json;

namespace MagicApp.Services.IA;

// Mapea la respuesta global de OpenRouter
public class ChatCompletionResponse
{
    [JsonProperty("choices")]
    public Choice[] Choices { get; set; } = Array.Empty<Choice>();
}