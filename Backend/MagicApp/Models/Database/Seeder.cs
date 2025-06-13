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
            Password = PasswordHelper.Hash("magichub"),
            Role = "Admin",
            AvatarUrl = $"{IMAGES_FOLDER}Ajani.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "David",
            Email = "david@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "Admin",
            AvatarUrl = $"{IMAGES_FOLDER}Ajani.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Noe",
            Email = "noe@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "Admin",
            AvatarUrl = $"{IMAGES_FOLDER}Gideon.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Usuario",
            Email = "usuario@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Teferi.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Samuel",
            Email = "samuel@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Bolas.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Manolo",
            Email = "manolo@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Nissa.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Pedro",
            Email = "pedro@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Liliana.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Daniel",
            Email = "daniel@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Gideon.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Alicia",
            Email = "alicia@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Bolas.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Antonia",
            Email = "antonia@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Ajani.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Juan",
            Email = "juan@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Teferi.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Roberto",
            Email = "roberto@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Nissa.jpg",
            IsBanned = false,
        },
        new User {
            Nickname = "Eva",
            Email = "eva@gmail.com",
            Password = PasswordHelper.Hash("123456"),
            Role = "User",
            AvatarUrl = $"{IMAGES_FOLDER}Liliana.jpg",
            IsBanned = false,
        }
    ];

        await _context.User.AddRangeAsync(users);
        await _context.SaveChangesAsync();
    }
}