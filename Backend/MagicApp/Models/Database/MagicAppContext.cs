using MagicApp.Models.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database;

public class MagicAppContext : DbContext
{
    private const string DATABASE_PATH = "MagicApp.db";

    private readonly Settings _settings;

    public MagicAppContext(Settings settings)
    {
        _settings = settings;
    }

    public DbSet<User> User { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
#if DEBUG
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        optionsBuilder.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
#else

        optionsBuilder.UseMySql(_settings.DatabaseConnection, ServerVersion.AutoDetect(_settings.DatabaseConnection));
#endif
    }
}