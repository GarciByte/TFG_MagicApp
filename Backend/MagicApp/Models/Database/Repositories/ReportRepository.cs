using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;

public class ReportRepository : Repository<Report, int>
{
    public ReportRepository(MagicAppContext context) : base(context) { }

    // Obtener reporte por id
    public async Task<Report> GetReportByIdAsync(int id)
    {
        return await GetQueryable()
            .FirstOrDefaultAsync(report => report.Id == id);
    }

    // Crear un nuevo reporte
    public async Task<Report> InsertReportAsync(Report newReport)
    {
        await InsertAsync(newReport);
        return newReport;
    }

    // Obtener todos los reportes
    public async Task<List<Report>> GetAllReportsAsync()
    {
        return await GetQueryable()
            .ToListAsync();
    }

    // Obtiene todos los reportes realizados por un usuario
    public async Task<List<Report>> GetByReporterIdAsync(int reporterId)
    {
        return await GetQueryable()
            .Where(r => r.ReporterId == reporterId)
            .ToListAsync();
    }

    // Obtiene todos los reportes donde un usuario ha sido reportado
    public async Task<List<Report>> GetByReportedUserIdAsync(int reportedUserId)
    {
        return await GetQueryable()
            .Where(r => r.ReportedUserId == reportedUserId)
            .ToListAsync();
    }
}