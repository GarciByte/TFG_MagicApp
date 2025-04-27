using MagicApp.Helpers;
using MagicApp.Models.Database.Entities;

namespace MagicApp.Models.Database;

public class Seeder
{
    private readonly MagicAppContext _context;

    public Seeder(MagicAppContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        await SeedUsersAsync();
        await _context.SaveChangesAsync();
    }

    private async Task SeedUsersAsync()
    {
        const string IMAGES_FOLDER = "avatars/";

        // Crear usuarios
        User[] users = [
        new User {
            Nickname = "Admin",
            Email = "admin@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "Admin",
            AvatarUrl = $"{IMAGES_FOLDER}Ajani.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Usuario",
            Email = "usuario@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Gideon.jpg",
            IsBanned = false,
        }
    ];

        await _context.User.AddRangeAsync(users);
        await _context.SaveChangesAsync();
    }
}