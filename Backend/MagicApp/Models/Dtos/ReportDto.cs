using MagicApp.Models.Database.Entities;
using System.Text.Json.Serialization;

namespace MagicApp.Models.Dtos;

public class ReportDto
{
    public int Id { get; set; }

    public int ReporterId { get; set; }

    public string ReporterNickname { get; set; }

    public int ReportedUserId { get; set; }

    public string ReportedUserNickname { get; set; }

    public string Reason { get; set; } = null!;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ReportStatus Status { get; set; }
}