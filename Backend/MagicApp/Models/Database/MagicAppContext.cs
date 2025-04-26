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

    public DbSet<ChatMessage> ChatMessage { get; set; }

    public DbSet<Deck> Deck { get; set; }

    public DbSet<DeckCard> DeckCard { get; set; }

    public DbSet<ForumThread> ForumThread { get; set; }

    public DbSet<ForumComment> ForumComment { get; set; }

    public DbSet<ThreadSubscription> ThreadSubscription { get; set; }

    public DbSet<Report> Report { get; set; }

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