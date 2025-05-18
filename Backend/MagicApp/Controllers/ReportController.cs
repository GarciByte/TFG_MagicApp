using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MagicApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ReportController : Controller
{
    private readonly ReportService _reportService;
    private readonly ILogger<ReportController> _logger;
    private readonly UserService _userService;

    public ReportController(ReportService reportService, ILogger<ReportController> logger, UserService userService)
    {
        _reportService = reportService;
        _logger = logger;
        _userService = userService;
    }

    // Obtener todos los reportes
    [Authorize(Roles = "Admin")]
    [HttpGet("allReports")]
    public async Task<IActionResult> GetAllReports()
    {
        _logger.LogInformation("Se ha recibido una consulta a todos los reportes");

        var reports = await _reportService.GetAllReportsAsync();

        _logger.LogInformation("Reportes: {@reports}", reports);

        return Ok(reports);
    }

    // Obtener reporte por id
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetReportById(int id)
    {
        _logger.LogInformation("Se ha recibido una consulta a un reporte por ID: {id}", id);

        var report = await _reportService.GetReportByIdAsync(id);

        if (report == null)
        {
            return NotFound();
        }

        _logger.LogInformation("Reporte: {@report}", report);

        return Ok(report);
    }

    // Obtiene todos los reportes realizados por un usuario
    [Authorize(Roles = "Admin")]
    [HttpGet("by-reporter/{reporterId}")]
    public async Task<IActionResult> GetReportByReporter(int reporterId)
    {
        _logger.LogInformation("Se ha recibido una consulta a los reportes del usuario {reporterId}", reporterId);

        var reports = await _reportService.GetReportByReporterAsync(reporterId);

        _logger.LogInformation("Reportes: {@reports}", reports);

        return Ok(reports);
    }

    // Obtiene todos los reportes donde un usuario ha sido reportado
    [Authorize(Roles = "Admin")]
    [HttpGet("by-reported/{reportedUserId}")]
    public async Task<IActionResult> GetByReportedUser(int reportedUserId)
    {
        _logger.LogInformation("Se ha recibido una consulta a los reportes que se le han hecho al usuario {reportedUserId}", reportedUserId);

        var reports = await _reportService.GetByReportedUserAsync(reportedUserId);

        _logger.LogInformation("Reportes: {@reports}", reports);

        return Ok(reports);
    }

    // Crear un nuevo reporte
    [HttpPost]
    public async Task<ActionResult<ReportDto>> CreateReport([FromBody] NewReportDto newReportDto)
    {
        // Obtener usuario desde el Token
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("Se ha recibido un nuevo reporte de {user.Nickname}: {@newReportDto}", user.Nickname, newReportDto);

        try
        {
            if (user.UserId == newReportDto.ReportedUserId)
            {
                return BadRequest("Un usuario no puede reportarse a sí mismo..");
            }

            var report = await _reportService.CreateReportAsync(user.UserId, newReportDto);

            if (report != null)
            {
                return CreatedAtAction(nameof(GetReportById), new { id = report.Id }, report);
            }

            return Conflict($"El usuario {user.Nickname} ya ha reportado al usuario {newReportDto.ReportedUserId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al crear el reporte {ex}", ex);
            return BadRequest("Se ha producido un error al crear el reporte.");
        }
    }

    // Actualiza el estado de un reporte
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateReportStatus(int id, [FromBody] ReportStatus status)
    {
        _logger.LogInformation("Se va a actualizar el reporte: {@id} a {status}", id, status);

        try
        {
            var report = await _reportService.UpdateReportStatusAsync(id, status);

            if (report == null)
            {
                return NotFound();
            }

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al actualizar el reporte {ex}", ex);
            return BadRequest("Se ha producido un error al actualizar el reporte.");
        }
    }

    // Eliminar un reporte
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReport(int id)
    {
        _logger.LogInformation("Se va a eliminar un reporte: {@id}", id);

        try
        {
            var reportDeleted = await _reportService.DeleteReportAsync(id);

            if (reportDeleted)
            {
                return NoContent();
            }

            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al eliminar el reporte {ex}", ex);
            return BadRequest("Se ha producido un error al eliminar el reporte.");
        }
    }

    // Leer datos del token
    private async Task<UserDto> ReadToken()
    {
        try
        {
            string id = User.Claims.FirstOrDefault().Value;
            UserDto user = await _userService.GetUserByIdAsync(Int32.Parse(id));
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al leer el token: {ex}", ex);
            return null;
        }
    }
}