namespace MagicApp.Models.Dtos;

public class ConversationRequest
{
    public int OtherUserId { get; set; }

    public string OtherUserNickname { get; set; }
}