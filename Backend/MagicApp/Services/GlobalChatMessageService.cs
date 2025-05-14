using MagicApp.Models.Database;
using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Models.Mappers;

namespace MagicApp.Services;

public class GlobalChatMessageService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly GlobalChatMessageMapper _globalChatMessageMapper;

    public GlobalChatMessageService(UnitOfWork unitOfWork,
        GlobalChatMessageMapper globalChatMessageMapper)
    {
        _unitOfWork = unitOfWork;
        _globalChatMessageMapper = globalChatMessageMapper;
    }

    // Obtener todos los mensajes
    public async Task<List<GlobalChatMessageDto>> GetAllGlobalMessagesAsync()
    {
        var messages = await _unitOfWork.GlobalChatMessageRepository.GetAllGlobalMessagesAsync();
        return _globalChatMessageMapper.GlobalChatMessagesToDto(messages).ToList();
    }

    // Guardar un nuevo mensaje
    public async Task<GlobalChatMessageDto> InsertGlobalMessageAsync(GlobalChatMessageDto globalChatMessageDto)
    {
        var allMessages = await _unitOfWork.GlobalChatMessageRepository.GetAllGlobalMessagesAsync();

        // Límite de 50 mensajes, mantiene solo los mensajes más recientes
        if (allMessages.Count >= 50)
        {
            var oldest = allMessages
                .OrderBy(m => m.Timestamp)
                .First();
           _unitOfWork.GlobalChatMessageRepository.DeleteGlobalMessage(oldest);
        }

        var newMessage = new GlobalChatMessage
        {
            SenderId = globalChatMessageDto.UserId,
            SenderNickname = globalChatMessageDto.Nickname,
            Content = globalChatMessageDto.Content,
            Timestamp = DateTime.Now
        };

        await _unitOfWork.GlobalChatMessageRepository.InsertGlobalMessageAsync(newMessage);
        await _unitOfWork.SaveAsync();

        return _globalChatMessageMapper.GlobalChatMessageToDto(newMessage);
    }
}