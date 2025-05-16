namespace MagicApp.Models.Dtos;

public class ChatListDto
{
    public int ReceiverId { get; set; }

    public string ReceiverNickname { get; set; }

    public string LastMessage { get; set; }

    public DateTime LastTimestamp { get; set; }
}