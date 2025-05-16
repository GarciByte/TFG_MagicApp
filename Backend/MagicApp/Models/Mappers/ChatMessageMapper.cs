using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;

namespace MagicApp.Models.Mappers;

public class ChatMessageMapper
{
    public ChatMessageDto ChatMessageToDto(ChatMessage chatMessage)
    {
        return new ChatMessageDto
        {
            SenderId = chatMessage.SenderId,
            SenderNickname = chatMessage.SenderNickname,
            ReceiverId = chatMessage.ReceiverId,
            ReceiverNickname = chatMessage.ReceiverNickname,
            Content = chatMessage.Content,
        };
    }

    public IEnumerable<ChatMessageDto> ChatMessagesToDto(IEnumerable<ChatMessage> chatMessages)
    {
        return chatMessages.Select(chatMessage => ChatMessageToDto(chatMessage));
    }
}