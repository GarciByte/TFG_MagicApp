using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicApp.Models.Database.Entities;

[Index(nameof(Email), IsUnique = true)]
[Index(nameof(Nickname), IsUnique = true)]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Nickname { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string AvatarUrl { get; set; } = null!;

    public bool IsBanned { get; set; }

    [InverseProperty(nameof(ChatMessage.Sender))]
    public List<ChatMessage> SentMessages { get; set; } = new List<ChatMessage>();

    [InverseProperty(nameof(ChatMessage.Receiver))]
    public List<ChatMessage> ReceivedMessages { get; set; } = new List<ChatMessage>();

    [InverseProperty(nameof(Report.Reporter))]
    public List<Report> ReportsSent { get; set; } = new List<Report>();

    [InverseProperty(nameof(Report.ReportedUser))]
    public List<Report> ReportsReceived { get; set; } = new List<Report>();

    public List<Deck> Decks { get; set; } = new List<Deck>();

    public List<ForumThread> ForumThreads { get; set; } = new List<ForumThread>();

    public List<ForumComment> ForumComments { get; set; } = new List<ForumComment>();

    public List<ThreadSubscription> ThreadSubscriptions { get; set; } = new List<ThreadSubscription>();
}