using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;

public class ThreadSubscriptionRepository : Repository<ThreadSubscription, int>
{
    public ThreadSubscriptionRepository(MagicAppContext context) : base(context) { }

    // Comprueba si existe la suscripción
    public async Task<bool> ExistsAsync(int threadId, int userId)
    {
        return await GetQueryable()
            .AnyAsync(s => s.ThreadId == threadId && s.UserId == userId);
    }

    // Insertar una suscripción de usuario a un hilo
    public async Task<ThreadSubscription> InsertSubscriptionAsync(ThreadSubscription newSub)
    {
        await InsertAsync(newSub);
        return newSub;
    }

    // Obtener una suscripción concreta
    public async Task<ThreadSubscription> GetSubscriptionAsync(int threadId, int userId)
    {
        return await GetQueryable()
            .FirstOrDefaultAsync(s => s.ThreadId == threadId && s.UserId == userId);
    }

    // Borrar una suscripción
    public async Task DeleteSubscriptionAsync(ThreadSubscription sub)
    {
        await base.Delete(sub);
    }
}