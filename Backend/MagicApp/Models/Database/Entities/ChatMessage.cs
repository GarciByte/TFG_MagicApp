using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicApp.Models.Database.Entities;

public class ChatMessage
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int SenderId { get; set; }

    public string SenderNickname { get; set; }

    public User Sender { get; set; } = null!;

    public int ReceiverId { get; set; }

    public string ReceiverNickname { get; set; }

    public User Receiver { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    public bool SenderDeleted { get; set; } = false;

    public bool ReceiverDeleted { get; set; } = false;
}