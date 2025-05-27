using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;

namespace MagicApp.Models.Mappers;

public class ReportMapper
{
    public ReportDto ReportToDto(Report report)
    {
        return new ReportDto
        {
            Id = report.Id,
            ReporterId = report.ReporterId,
            ReportedUserId = report.ReportedUserId,
            Reason = report.Reason,
            Status = report.Status
        };
    }

    public IEnumerable<ReportDto> ReportsToDto(IEnumerable<Report> reports) 
    {
        return reports.Select(report => ReportToDto(report));
    }
}