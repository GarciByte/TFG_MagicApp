namespace MagicApp.Services.IA;

// Mensaje individual que se envía a OpenRouter
public class Message
{
    public string Role { get; set; } = null!;

    public string Content { get; set; } = null!;
}