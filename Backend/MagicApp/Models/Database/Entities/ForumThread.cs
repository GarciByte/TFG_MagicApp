using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicApp.Models.Database.Entities;

public class ForumThread
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public bool IsClosed { get; set; }

    public List<ForumComment> Comments { get; set; } = new List<ForumComment>();

    public List<ThreadSubscription> Subscriptions { get; set; } = new List<ThreadSubscription>();
}