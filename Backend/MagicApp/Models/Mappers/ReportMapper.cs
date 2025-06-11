using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Services;

namespace MagicApp.Models.Mappers;

public class ReportMapper(UserService userService)
{
    private readonly UserService _userService = userService;

    public async Task<ReportDto> ReportToDtoAsync(Report report)
    {
        return new ReportDto
        {
            Id = report.Id,
            ReporterId = report.ReporterId,
            ReporterNickname = await GetUserNickname(report.ReporterId),
            ReportedUserId = report.ReportedUserId,
            ReportedUserNickname = await GetUserNickname(report.ReportedUserId),
            Reason = report.Reason,
            Status = report.Status
        };
    }

    public async Task<IEnumerable<ReportDto>> ReportsToDtoAsync(IEnumerable<Report> reports)
    {
        var tasks = reports.Select(r => ReportToDtoAsync(r));
        return await Task.WhenAll(tasks);
    }

    private async Task<String> GetUserNickname(int id)
    {
        var user = await _userService.GetUserByIdAsyncNoDto(id);

        if (user == null) { 
            return "";
        }

        return user.Nickname;
    }
}