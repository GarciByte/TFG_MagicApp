using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicApp.Models.Database.Entities;

public class ChatWithAiMessage
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    public string Role { get; set; } = null!;

    [Required]
    public string Content { get; set; } = null!;

    public DateTime Timestamp { get; set; }
}