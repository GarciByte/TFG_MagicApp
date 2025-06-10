using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos.IA;

namespace MagicApp.Models.Mappers;

public class ChatWithAiMessageMapper
{
    public ChatWithAiMessageDto ToDto(ChatWithAiMessage msg)
    {
        return new ChatWithAiMessageDto
        {
            UserId = msg.UserId,
            Role = msg.Role,
            Content = msg.Content,
            Timestamp = msg.Timestamp
        };
    }

    public IEnumerable<ChatWithAiMessageDto> ToDto(IEnumerable<ChatWithAiMessage> msgs)
    {
        return msgs.Select(m => ToDto(m));
    }
}