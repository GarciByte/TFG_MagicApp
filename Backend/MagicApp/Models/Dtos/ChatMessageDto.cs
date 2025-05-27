namespace MagicApp.Models.Dtos;

public class ChatMessageDto
{
    public int SenderId { get; set; }

    public string SenderNickname { get; set; }

    public int ReceiverId { get; set; }

    public string ReceiverNickname { get; set; }

    public string Content { get; set; }
}