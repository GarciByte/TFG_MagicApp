using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;

public class ForumThreadRepository : Repository<ForumThread, int>
{
    public ForumThreadRepository(MagicAppContext context) : base(context) { }

    // Obtener todos los hilos con sus comentarios y suscripciones
    public async Task<List<ForumThread>> GetAllWithDetailsAsync()
    {
        return await GetQueryable()
            .Include(t => t.User)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.Subscriptions)
            .OrderByDescending(t => t.Comments.Max(c => c.CreatedAt))
            .ToListAsync();
    }

    // Obtener un hilo por ID con sus comentarios y suscripciones
    public async Task<ForumThread> GetByIdWithDetailsAsync(int threadId)
    {
        return await GetQueryable()
            .Include(t => t.User)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.Subscriptions)
            .FirstOrDefaultAsync(t => t.Id == threadId);
    }

    // Crear un nuevo hilo
    public async Task<ForumThread> InsertThreadAsync(ForumThread newThread)
    {
        await InsertAsync(newThread);
        return newThread;
    }

    // Cambia el estado de un hilo ha cerrado
    public async Task CloseThreadAsync(int threadId)
    {
        var thread = await GetByIdAsync(threadId);
        if (thread != null)
        {
            thread.IsClosed = true;
            await base.Update(thread);
        }
    }

    // Cambia el estado de un hilo ha abierto
    public async Task OpenThreadAsync(int threadId)
    {
        var thread = await GetByIdAsync(threadId);
        if (thread != null)
        {
            thread.IsClosed = false;
            await base.Update(thread);
        }
    }

    // Borrar un hilo por ID
    public async Task DeleteThreadAsync(int threadId)
    {
        var thread = await GetByIdAsync(threadId);
        if (thread != null)
        {
            await base.Delete(thread);
        }
    }
}