namespace MagicApp.Models.Dtos.IA;

public class ChatWithAiMessageDto
{
    public int UserId { get; set; }

    public string Role { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime Timestamp { get; set; }
}