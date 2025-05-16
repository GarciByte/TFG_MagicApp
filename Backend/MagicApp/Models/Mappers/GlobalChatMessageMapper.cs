using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;

namespace MagicApp.Models.Mappers;

public class GlobalChatMessageMapper
{
    public GlobalChatMessageDto GlobalChatMessageToDto(GlobalChatMessage globalChatMessage)
    {
        return new GlobalChatMessageDto
        {
            UserId = globalChatMessage.SenderId,
            Nickname = globalChatMessage.SenderNickname,
            Content = globalChatMessage.Content,
        };
    }

    public IEnumerable<GlobalChatMessageDto> GlobalChatMessagesToDto(IEnumerable<GlobalChatMessage> globalChatMessages)
    {
        return globalChatMessages.Select(globalChatMessage => GlobalChatMessageToDto(globalChatMessage));
    }
}