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

    public DbSet<GlobalChatMessage> GlobalChatMessage { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
#if DEBUG
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        optionsBuilder.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
#else

        optionsBuilder.UseMySql(_settings.DatabaseConnection, ServerVersion.AutoDetect(_settings.DatabaseConnection));
#endif
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Al borrar un ForumThread se borrarán en cascada todos sus ForumComments
        modelBuilder.Entity<ForumComment>()
            .HasOne(c => c.Thread)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);

        // Al borrar un ForumThread se borrarán en cascada todos sus ThreadSubscriptions
        modelBuilder.Entity<ThreadSubscription>()
            .HasOne(s => s.Thread)
            .WithMany(t => t.Subscriptions)
            .HasForeignKey(s => s.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}