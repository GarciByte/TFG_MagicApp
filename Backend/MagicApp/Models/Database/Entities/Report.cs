using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicApp.Models.Database.Entities;

public class Report
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int ReporterId { get; set; }

    public User Reporter { get; set; } = null!;

    public int ReportedUserId { get; set; }

    public User ReportedUser { get; set; } = null!;

    public string Reason { get; set; } = null!;

    public string Status { get; set; } = null!;
}