using MagicApp.Models.Dtos;
using MagicApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MagicApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ChatMessageController : Controller
{
    private readonly GlobalChatMessageService _globalChatMessageService;
    private readonly ILogger<UserController> _logger;

    public ChatMessageController(GlobalChatMessageService globalChatMessageService, ILogger<UserController> logger)
    {
        _globalChatMessageService = globalChatMessageService;
        _logger = logger;
    }

    // Obtener todos los mensajes Globales
    [HttpGet("allGlobalMessages")]
    public async Task<IActionResult> GetAllGlobalMessagesAsync()
    {
        _logger.LogInformation("Se ha recibido una consulta a todos los mensajes globales");

        var messages = await _globalChatMessageService.GetAllGlobalMessagesAsync();

        _logger.LogInformation("Mensajes: {@messages}", messages);

        return Ok(messages);
    }

    // Guardar un nuevo mensaje Global
    [HttpPost("newGlobalMessage")]
    public async Task<ActionResult<GlobalChatMessageDto>> InsertGlobalMessageAsync([FromBody] GlobalChatMessageDto globalChatMessageDto)
    {
        _logger.LogInformation("Se va ha guardar un nuevo mensaje global: {@globalChatMessageDto}", globalChatMessageDto);

        try
        {
            if (globalChatMessageDto == null ||
            string.IsNullOrWhiteSpace(globalChatMessageDto.Nickname) ||
            string.IsNullOrWhiteSpace(globalChatMessageDto.Content))
            {
                _logger.LogError("El mensaje no está bien creado {globalChatMessageDto}", globalChatMessageDto);
                return BadRequest("El mensaje no está bien creado.");
            }

            var message = await _globalChatMessageService.InsertGlobalMessageAsync(globalChatMessageDto);

            return Created(string.Empty, message);
        }
        catch (Exception ex) 
        {
            _logger.LogError("Se ha producido un error al crear el mensaje {ex}", ex);
            return BadRequest("Se ha producido un error al crear el mensaje.");
        }
    }
}