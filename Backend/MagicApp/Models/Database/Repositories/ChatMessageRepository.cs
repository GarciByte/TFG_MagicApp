using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using MagicApp.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;

public class ChatMessageRepository : Repository<ChatMessage, int>
{
    public ChatMessageRepository(MagicAppContext context) : base(context) { }

    // Guardar un nuevo mensaje
    public async Task<ChatMessage> InsertMessageAsync(ChatMessage message)
    {
        await InsertAsync(message);
        return message;
    }

    // Obtener todos los mensajes de todos los chats
    public async Task<List<ChatMessage>> GetAllMessagesAsync()
    {
        return await GetQueryable()
            .ToListAsync();
    }

    // Obtener todos los mensajes entre dos usuarios
    public async Task<List<ChatMessage>> GetConversationAsync(int userId, int otherUserId)
    {
        return await GetQueryable()
            .Where(m =>
                (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                (m.SenderId == otherUserId && m.ReceiverId == userId)
                && !(m.SenderId == userId && m.SenderDeleted)
                && !(m.ReceiverId == userId && m.ReceiverDeleted))
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
    }

    // Eliminar un mensaje
    public void DeleteMessage(ChatMessage message)
    {
        base.Delete(message);
    }

    // Obtener la lista de chats para un usuario
    public async Task<List<ChatListDto>> GetChatListAsync(int userId)
    {
        var userMessages = GetQueryable()
            .Where(m =>
                (m.SenderId == userId && !m.SenderDeleted) ||
                (m.ReceiverId == userId && !m.ReceiverDeleted)
            );

        var projected = userMessages
            .Select(m => new
            {
                OtherUserId = m.SenderId == userId ? m.ReceiverId : m.SenderId,
                OtherUserNickname = m.SenderId == userId ? m.ReceiverNickname : m.SenderNickname,
                m.Content,
                m.Timestamp
            });

        var grouped = projected
            .GroupBy(x => new { x.OtherUserId, x.OtherUserNickname });

        var messagesList = await grouped
            .Select(g => new ChatListDto
            {
                ReceiverId = g.Key.OtherUserId,
                ReceiverNickname = g.Key.OtherUserNickname,
                LastMessage = g
                    .OrderByDescending(x => x.Timestamp)
                    .First().Content,
                LastTimestamp = g.Max(x => x.Timestamp)
            })
            .OrderByDescending(dto => dto.LastTimestamp)
            .ToListAsync();

        return messagesList;
    }
}