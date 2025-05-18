using MagicApp.Models.Database;
using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Models.Mappers;

namespace MagicApp.Services;

public class ReportService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly ReportMapper _reportMapper;

    public ReportService(UnitOfWork unitOfWork, ReportMapper reportMapper)
    {
        _unitOfWork = unitOfWork;
        _reportMapper = reportMapper;
    }

    // Obtener todos los reportes
    public async Task<List<ReportDto>> GetAllReportsAsync()
    {
        var reports = await _unitOfWork.ReportRepository.GetAllReportsAsync();
        return _reportMapper.ReportsToDto(reports).ToList();
    }

    // Obtener reporte por id
    public async Task<ReportDto> GetReportByIdAsync(int id)
    {
        var report = await _unitOfWork.ReportRepository.GetReportByIdAsync(id);

        if (report == null)
        {
            return null;
        }

        return _reportMapper.ReportToDto(report);
    }

    // Obtiene todos los reportes realizados por un usuario
    public async Task<List<ReportDto>> GetReportByReporterAsync(int reporterId)
    {
        var reports = await _unitOfWork.ReportRepository.GetByReporterIdAsync(reporterId);
        return _reportMapper.ReportsToDto(reports).ToList();
    }

    // Obtiene todos los reportes donde un usuario ha sido reportado
    public async Task<List<ReportDto>> GetByReportedUserAsync(int reportedUserId)
    {
        var reports = await _unitOfWork.ReportRepository.GetByReportedUserIdAsync(reportedUserId);
        return _reportMapper.ReportsToDto(reports).ToList();
    }

    // Crear un nuevo reporte
    public async Task<ReportDto> CreateReportAsync(int reporterId, NewReportDto newReportDto)
    {
        if (reporterId == newReportDto.ReportedUserId)
        {
            return null;
        }

        var existingReports = await _unitOfWork.ReportRepository.GetByReporterIdAsync(reporterId);

        if (existingReports.Any(r => r.ReportedUserId == newReportDto.ReportedUserId))
        {
            return null;
        }

        var report = new Report
        {
            ReporterId = reporterId,
            ReportedUserId = newReportDto.ReportedUserId,
            Reason = newReportDto.Reason,
            Status = ReportStatus.InReview,
        };

        await _unitOfWork.ReportRepository.InsertReportAsync(report);
        await _unitOfWork.SaveAsync();

        return _reportMapper.ReportToDto(report);
    }

    // Actualiza el estado de un reporte
    public async Task<ReportDto> UpdateReportStatusAsync(int id, ReportStatus status)
    {
        var report = await _unitOfWork.ReportRepository.GetReportByIdAsync(id);

        if (report == null)
        {
            return null;
        }

        report.Status = status;

        _unitOfWork.ReportRepository.Update(report);
        await _unitOfWork.SaveAsync();

        return _reportMapper.ReportToDto(report);
    }

    // Eliminar un reporte
    public async Task<bool> DeleteReportAsync(int id)
    {
        var report = await _unitOfWork.ReportRepository.GetReportByIdAsync(id);

        if (report == null)
        {
            return false;
        }

        await _unitOfWork.ReportRepository.Delete(report);
        await _unitOfWork.SaveAsync();
        return true;
    }
}