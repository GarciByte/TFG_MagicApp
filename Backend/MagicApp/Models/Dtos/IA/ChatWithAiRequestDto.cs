using System.Text.Json.Serialization;

namespace MagicApp.Models.Dtos.IA;

public class ChatWithAiRequestDto
{
    [JsonPropertyName("userId")]
    public int UserId { get; set; }

    [JsonPropertyName("prompt")]
    public string Prompt { get; set; }
}