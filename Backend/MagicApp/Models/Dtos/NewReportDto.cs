namespace MagicApp.Models.Dtos;

public class NewReportDto
{
    public int ReportedUserId { get; set; }

    public string Reason { get; set; } = null!;
}