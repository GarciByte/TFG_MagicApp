using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicApp.Models.Database.Entities;

public class ThreadSubscription
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public int ThreadId { get; set; }

    public ForumThread Thread { get; set; } = null!;
}