using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;

public class ChatWithAiMessageRepository : Repository<ChatWithAiMessage, int>
{
    public ChatWithAiMessageRepository(MagicAppContext context): base(context) { }

    // Guardar un nuevo mensaje
    public async Task<ChatWithAiMessage> InsertMessageAsync(ChatWithAiMessage message)
    {
        await InsertAsync(message);
        return message;
    }

    // Obtener todos los mensajes de un usuario
    public async Task<List<ChatWithAiMessage>> GetMessagesByUserAsync(int userId)
    {
        return await GetQueryable()
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
    }

    // Obtener los últimos N mensajes de un usuario
    public async Task<List<ChatWithAiMessage>> GetLastMessagesAsync(int userId, int n)
    {
        var sublist = await GetQueryable()
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.Timestamp)
            .Take(n)
            .ToListAsync();

        return sublist
            .OrderBy(m => m.Timestamp)
            .ToList();
    }

    // Eliminar un mensaje
    public void DeleteMessage(ChatWithAiMessage message)
    {
        Delete(message);
    }

    // Contar cuántos mensajes tiene un usuario
    public async Task<int> CountMessagesForUserAsync(int userId)
    {
        return await GetQueryable()
            .Where(m => m.UserId == userId)
            .CountAsync();
    }
}