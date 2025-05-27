using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;

public class GlobalChatMessageRepository : Repository<GlobalChatMessage, int>
{
    public GlobalChatMessageRepository(MagicAppContext context) : base(context) { }

    // Guardar un nuevo mensaje
    public async Task<GlobalChatMessage> InsertGlobalMessageAsync(GlobalChatMessage message)
    {
        await InsertAsync(message);
        return message;
    }

    // Obtener todos los mensajes
    public async Task<List<GlobalChatMessage>> GetAllGlobalMessagesAsync()
    {
        return await GetQueryable()
            .ToListAsync();
    }

    // Eliminar un mensaje
    public void DeleteGlobalMessage(GlobalChatMessage message)
    {
        base.Delete(message);
    }
}