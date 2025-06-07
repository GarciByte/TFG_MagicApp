using MagicApp.Models.Dtos.IA;
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
    private readonly ChatWithAiService _chatWithAiService;
    private readonly ILogger<ChatWithAiController> _logger;

    public ChatWithAiController(ChatWithAiMessageService chatService, ILogger<ChatWithAiController> logger, ChatWithAiService chatWithAiService)
    {
        _chatService = chatService;
        _logger = logger;
        _chatWithAiService = chatWithAiService;
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

    // Enviar un mensaje a la IA
    [HttpPost("ia")]
    public async Task<IActionResult> ProcessPromptAsync([FromBody] ChatWithAiRequestDto chatWithAiRequestDto)
    {
        _logger.LogInformation("Se ha recibido un prompt del usuario {chatWithAiRequestDto.UserId}: {chatWithAiRequestDto.Prompt}",
            chatWithAiRequestDto.UserId, chatWithAiRequestDto.Prompt);

        string iaResponse = await _chatWithAiService.ProcessPromptAsync(chatWithAiRequestDto.UserId, chatWithAiRequestDto.Prompt);

        _logger.LogInformation("Se ha recibido una respuesta: {@iaResponse}", iaResponse);

        return Ok(new { response = iaResponse });
    }

}