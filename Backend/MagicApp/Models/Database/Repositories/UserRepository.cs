using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;

public class UserRepository : Repository<User, int>
{
    public UserRepository(MagicAppContext context) : base(context) { }

    // Obtener usuario por nickname
    public async Task<User> GetUserByNickname(string nickname)
    {
        return await GetQueryable()
            .FirstOrDefaultAsync(user => user.Nickname.ToLower() == nickname.ToLower());
    }

    // Obtener usuario por email
    public async Task<User> GetUserByEmail(string email)
    {
        return await GetQueryable()
            .FirstOrDefaultAsync(user => user.Email == email);
    }

    // Obtener usuario por id
    public async Task<User> GetUserById(int id)
    {
        return await GetQueryable()
            .FirstOrDefaultAsync(user => user.Id == id);
    }

    // Crear un nuevo usuario
    public async Task<User> InsertUserAsync(User newUser)
    {
        await InsertAsync(newUser);
        return newUser;
    }

    // Obtener todos los usuarios
    public async Task<List<User>> GetAllUsersAsync()
    {
        return await GetQueryable()
            .ToListAsync();
    }
}