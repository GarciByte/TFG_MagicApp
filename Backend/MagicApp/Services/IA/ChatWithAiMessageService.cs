using MagicApp.Models.Database;
using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos.IA;
using MagicApp.Models.Mappers;

namespace MagicApp.Services.IA;

public class ChatWithAiMessageService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly ChatWithAiMessageMapper _chatWithAiMessageMapper;

    // Límite máximo de mensajes guardados por usuario
    private const int MaxMessages = 25;

    public ChatWithAiMessageService(UnitOfWork unitOfWork, ChatWithAiMessageMapper chatWithAiMessageMapper)
    {
        _unitOfWork = unitOfWork;
        _chatWithAiMessageMapper = chatWithAiMessageMapper;
    }

    // Guardar un nuevo mensaje
    public async Task<ChatWithAiMessageDto> InsertMessageAsync(ChatWithAiMessageDto dto)
    {
        int messages = await _unitOfWork.ChatWithAiMessageRepository.CountMessagesForUserAsync(dto.UserId);

        // Límite de mensajes
        if (messages >= MaxMessages)
        {
            var allMessages = await _unitOfWork.ChatWithAiMessageRepository.GetMessagesByUserAsync(dto.UserId);
            var older = allMessages.First();
            _unitOfWork.ChatWithAiMessageRepository.DeleteMessage(older);
        }

        var message = new ChatWithAiMessage
        {
            UserId = dto.UserId,
            Role = dto.Role,
            Content = dto.Content,
            Timestamp = DateTime.UtcNow
        };

        await _unitOfWork.ChatWithAiMessageRepository.InsertMessageAsync(message);
        await _unitOfWork.SaveAsync();

        return _chatWithAiMessageMapper.ToDto(message); ;
    }

    // Obtener los últimos n mensajes de un usuario
    public async Task<List<ChatWithAiMessageDto>> GetLastMessagesAsync(int userId, int n)
    {
        var messages = await _unitOfWork.ChatWithAiMessageRepository.GetLastMessagesAsync(userId, n);
        return _chatWithAiMessageMapper.ToDto(messages).ToList();
    }

    // Obtener todos los mensajes del chat
    public async Task<List<ChatWithAiMessageDto>> GetAllMessagesByUserAsync(int userId)
    {
        var messages = await _unitOfWork.ChatWithAiMessageRepository.GetMessagesByUserAsync(userId);
        return _chatWithAiMessageMapper.ToDto(messages).ToList();
    }
}