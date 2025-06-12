using MagicApp.Services.IA;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MagicApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ChatWithAiController : ControllerBase
{
    private readonly ChatWithAiMessageService _chatService;
    private readonly ILogger<ChatWithAiController> _logger;

    public ChatWithAiController(ChatWithAiMessageService chatService, ILogger<ChatWithAiController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    // Obtener todos los mensajes del chat
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetAllMessages(int userId)
    {
        _logger.LogInformation("Se ha recibido una consulta a los mensajes del chat de la IA del usuario: {userId}", userId);

        if (userId <= 0)
        {
            return BadRequest("El usuario no es válido.");
        }

        try
        {
            var messages = await _chatService.GetAllMessagesByUserAsync(userId);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al obtener los mensajes {ex}", ex);
            return BadRequest("Se ha producido un error al obtener los mensajes.");
        }
    }

}