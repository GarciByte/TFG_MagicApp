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
    private readonly ChatMessageService _chatMessageService;
    private readonly UserService _userService;
    private readonly ILogger<ChatMessageController> _logger;

    public ChatMessageController(GlobalChatMessageService globalChatMessageService, 
        ILogger<ChatMessageController> logger, 
        ChatMessageService chatMessageService,
        UserService userService)
    {
        _globalChatMessageService = globalChatMessageService;
        _logger = logger;
        _chatMessageService = chatMessageService;
        _userService = userService;
    }

    // Obtener todos los mensajes Globales
    [HttpGet("allGlobalMessages")]
    public async Task<IActionResult> GetAllGlobalMessagesAsync()
    {
        _logger.LogInformation("Se ha recibido una consulta a todos los mensajes globales");

        var messages = await _globalChatMessageService.GetAllGlobalMessagesAsync();

        return Ok(messages);
    }

    // Guardar un nuevo mensaje Global
    [Authorize(Roles = "Admin")]
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

    // Obtener todos los mensajes de todos los chats Privados
    [Authorize(Roles = "Admin")]
    [HttpGet("allMessages")]
    public async Task<IActionResult> GetAllMessagesAsync()
    {
        _logger.LogInformation("Se ha recibido una consulta a todos los mensajes privados");

        var messages = await _chatMessageService.GetAllMessagesAsync();

        _logger.LogInformation("Mensajes: {@messages}", messages);

        return Ok(messages);
    }

    // Guardar un nuevo mensaje Privado
    [Authorize(Roles = "Admin")]
    [HttpPost("newMessage")]
    public async Task<ActionResult<ChatMessageDto>> InsertMessageAsync([FromBody] ChatMessageDto chatMessageDto)
    {
        _logger.LogInformation("Se va ha guardar un nuevo mensaje privado: {@chatMessageDto}", chatMessageDto);

        try
        {
            if (chatMessageDto == null ||
            string.IsNullOrWhiteSpace(chatMessageDto.SenderNickname) ||
            string.IsNullOrWhiteSpace(chatMessageDto.ReceiverNickname) ||
            string.IsNullOrWhiteSpace(chatMessageDto.Content))
            {
                _logger.LogError("El mensaje no está bien creado {chatMessageDto}", chatMessageDto);
                return BadRequest("El mensaje no está bien creado.");
            }

            var message = await _chatMessageService.InsertMessageAsync(chatMessageDto);

            return Created(string.Empty, message);
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al crear el mensaje {ex}", ex);
            return BadRequest("Se ha producido un error al crear el mensaje.");
        }
    }

    // Obtener la lista de chats para un usuario
    [HttpGet("chatList")]
    public async Task<IActionResult> GetChatList()
    {
        // Obtener usuario desde el Token
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("Obteniendo la lista de chats para el usuario {user.Nickname}", user.Nickname);

        var chatList = await _chatMessageService.GetChatListAsync(user.UserId);
        return Ok(chatList);
    }

    // Obtener todos los mensajes entre dos usuarios
    [HttpPost("conversation")]
    public async Task<IActionResult> GetConversation([FromBody] ConversationRequest conversationRequest)
    {
        // Obtener usuario desde el Token
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("Obteniendo conversación entre {user.Nickname} y {conversationRequest.OtherUserNickname}", 
            user.Nickname, conversationRequest.OtherUserNickname);

        var chat = await _chatMessageService.GetConversationAsync(user.UserId, conversationRequest.OtherUserId);
        return Ok(chat);
    }

    // Borrar conversación de un usuario
    [HttpDelete("conversation")]
    public async Task<IActionResult> DeleteConversation([FromQuery] int otherUserId)
    {
        // Obtener usuario desde el Token
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("Borrando una conversación de {user.Nickname} con {otherUserId}", user.Nickname, otherUserId);

        await _chatMessageService.SoftDeleteConversationAsync(user.UserId, otherUserId);
        return NoContent();
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