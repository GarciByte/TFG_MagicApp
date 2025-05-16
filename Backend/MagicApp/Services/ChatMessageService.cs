using MagicApp.Models.Database;
using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories;
using MagicApp.Models.Dtos;
using MagicApp.Models.Mappers;

namespace MagicApp.Services;

public class ChatMessageService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly ChatMessageMapper _chatMessageMapper;

    public ChatMessageService(UnitOfWork unitOfWork,
        ChatMessageMapper chatMessageMapper)
    {
        _unitOfWork = unitOfWork;
        _chatMessageMapper = chatMessageMapper;
    }

    // Obtener todos los mensajes de todos los chats
    public async Task<List<ChatMessageDto>> GetAllMessagesAsync()
    {
        var messages = await _unitOfWork.ChatMessageRepository.GetAllMessagesAsync();
        return _chatMessageMapper.ChatMessagesToDto(messages).ToList();
    }

    // Guardar un nuevo mensaje
    public async Task<ChatMessageDto> InsertMessageAsync(ChatMessageDto chatMessageDto)
    {
        var allMessages = await _unitOfWork.ChatMessageRepository.GetConversationAsync(chatMessageDto.SenderId, chatMessageDto.ReceiverId);

        // Límite de 50 mensajes, mantiene solo los mensajes más recientes
        if (allMessages.Count >= 50)
        {
            var oldest = allMessages
                .OrderBy(m => m.Timestamp)
                .First();
            _unitOfWork.ChatMessageRepository.DeleteMessage(oldest);
        }

        var newMessage = new ChatMessage
        {
            SenderId = chatMessageDto.SenderId,
            SenderNickname = chatMessageDto.SenderNickname,
            ReceiverId = chatMessageDto.ReceiverId,
            ReceiverNickname = chatMessageDto.ReceiverNickname,
            Content = chatMessageDto.Content,
            Timestamp = DateTime.Now
        };

        await _unitOfWork.ChatMessageRepository.InsertMessageAsync(newMessage);
        await _unitOfWork.SaveAsync();

        return _chatMessageMapper.ChatMessageToDto(newMessage);
    }

    // Obtener la lista de chats para un usuario
    public async Task<List<ChatListDto>> GetChatListAsync(int userId)
    {
        return await _unitOfWork.ChatMessageRepository.GetChatListAsync(userId);
    }

    // Obtener todos los mensajes entre dos usuarios
    public async Task<List<ChatMessageDto>> GetConversationAsync(int userId, int otherUserId)
    {
        var messages = await _unitOfWork.ChatMessageRepository.GetConversationAsync(userId, otherUserId);
        return _chatMessageMapper.ChatMessagesToDto(messages).ToList();
    }

    // Borrar conversación de un usuario
    public async Task SoftDeleteConversationAsync(int userId, int otherUserId)
    {
        var messages = await _unitOfWork.ChatMessageRepository.GetConversationAsync(userId, otherUserId);
        
        foreach (var m in messages)
        {
            bool changed = false;

            if (m.SenderId == userId && !m.SenderDeleted)
            {
                m.SenderDeleted = true;
                changed = true;
            }

            if (m.ReceiverId == userId && !m.ReceiverDeleted)
            {
                m.ReceiverDeleted = true;
                changed = true;
            }

            if (changed)
            {
                _unitOfWork.ChatMessageRepository.Update(m);
            }

            if (m.SenderDeleted && m.ReceiverDeleted)
            {
                await _unitOfWork.ChatMessageRepository.Delete(m);
            }
        }

        await _unitOfWork.SaveAsync();
    }
}