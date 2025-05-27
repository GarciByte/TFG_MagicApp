using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MagicApp.Models.Database.Entities;

public enum ReportStatus
{
    InReview,
    Completed
}

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

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ReportStatus Status { get; set; }
}