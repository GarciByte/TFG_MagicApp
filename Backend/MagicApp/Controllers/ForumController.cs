using MagicApp.Models.Dtos;
using MagicApp.Models.Dtos.Forum;
using MagicApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MagicApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ForumController : ControllerBase
{
    private readonly ForumService _forumService;
    private readonly UserService _userService;
    private readonly ILogger<ForumController> _logger;

    public ForumController(ForumService forumService, UserService userService, ILogger<ForumController> logger)
    {
        _forumService = forumService;
        _userService = userService;
        _logger = logger;
    }

    // Obtener todos los hilos
    [HttpGet("allThreads")]
    public async Task<IActionResult> GetAllThreads()
    {
        _logger.LogInformation("Se ha recibido una consulta a todos los hilos");

        var threads = await _forumService.GetAllThreadsAsync();
        return Ok(threads);
    }

    // Obtiene los detalles de un hilo
    [HttpGet("{id}")]
    public async Task<IActionResult> GetThreadDetail(int id)
    {
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("Se ha recibido una consulta al hilo: {id}", id);

        var threadDetail = await _forumService.GetThreadDetailAsync(id, user.UserId);
        return Ok(threadDetail);
    }

    // Crear un nuevo hilo
    [HttpPost]
    public async Task<ActionResult<ForumThreadDto>> CreateThread([FromBody] CreateForumThreadDto dto)
    {
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("Se va a crear un nuevo hilo: {@dto}", dto);

        try
        {
            var createdThread = await _forumService.CreateThreadAsync(user.UserId, dto);
            return CreatedAtAction(nameof(GetThreadDetail), new { id = createdThread.Id }, createdThread);
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al crear el hilo {ex}", ex);
            return BadRequest("Se ha producido un error al crear el hilo.");
        }
    }

    // Añade un comentario a un hilo
    [HttpPost("{threadId}/comments")]
    public async Task<ActionResult<ForumCommentDto>> AddComment(int threadId, [FromBody] CreateForumCommentDto dto)
    {
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("Se va a añadir un nuevo comentario: {@dto}", dto);

        try
        {
            dto.ThreadId = threadId;
            var createdComment = await _forumService.AddCommentAsync(user.UserId, dto);
            return CreatedAtAction(nameof(GetThreadDetail), new { id = threadId }, createdComment);
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al crear el comentario {ex}", ex);
            return BadRequest("Se ha producido un error al crear el comentario.");
        }
    }

    // Obtener todos los hilos a los que está suscrito un usuario
    [HttpGet("subscriptions")]
    public async Task<IActionResult> GetMySubscriptions()
    {
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("El usuario {user.Nickname} va a obtener todas las suscripciones a hilos", user.Nickname);

        var subscribedThreads = await _forumService.GetSubscribedThreadsAsync(user.UserId);
        return Ok(subscribedThreads);
    }

    // Suscribe al usuario a un hilo
    [HttpPost("{threadId}/subscribe")]
    public async Task<IActionResult> Subscribe(int threadId)
    {
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("El usuario {user.Nickname} se va a suscribir al hilo: {threadId}", user.Nickname, threadId);

        try
        {
            await _forumService.SubscribeAsync(user.UserId, threadId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al suscribirse al hilo {ex}", ex);
            return BadRequest("Se ha producido un error al suscribirse al hilo.");
        }
    }

    // Cancela la suscripción del usuario de un hilo
    [HttpDelete("{threadId}/subscribe")]
    public async Task<IActionResult> Unsubscribe(int threadId)
    {
        UserDto user = await ReadToken();

        if (user == null)
        {
            _logger.LogError("Error al obtener el usuario desde el token");
            return Unauthorized();
        }

        _logger.LogInformation("El usuario {user.Nickname} va a cancelar la suscripción del hilo: {threadId}", user.Nickname, threadId);

        try
        {
            await _forumService.UnsubscribeAsync(user.UserId, threadId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al cancelar la suscripción del hilo {ex}", ex);
            return BadRequest("Se ha producido un error al cancelar la suscripción del hilo.");
        }
    }

    // Cierra un hilo
    [HttpPost("{threadId}/close")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CloseThread(int threadId)
    {
        _logger.LogInformation("Se va a cerrar el hilo: {threadId}", threadId);

        try
        {
            await _forumService.CloseThreadAsync(threadId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al cerrar el hilo {ex}", ex);
            return BadRequest("Se ha producido un error al cerrar el hilo.");
        }
    }

    // Reabre un hilo
    [HttpPost("{threadId}/open")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> OpenThread(int threadId)
    {
        _logger.LogInformation("Se va a reabrir el hilo: {threadId}", threadId);

        try
        {
            await _forumService.OpenThreadAsync(threadId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al abrir el hilo {ex}", ex);
            return BadRequest("Se ha producido un error al abrir el hilo.");
        }
    }

    // Borrar un comentario
    [HttpDelete("comments/{commentId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        _logger.LogInformation("Se va a borrar el comentario: {commentId}", commentId);

        try
        {
            await _forumService.DeleteCommentAsync(commentId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al borrar el comentario {ex}", ex);
            return BadRequest("Se ha producido un error al borrar el comentario.");
        }
    }

    // Borrar un hilo completo
    [HttpDelete("{threadId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteThread(int threadId)
    {
        _logger.LogInformation("Se va a borrar el hilo: {threadId}", threadId);

        try
        {
            await _forumService.DeleteThreadAsync(threadId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al borrar el hilo {ex}", ex);
            return BadRequest("Se ha producido un error al borrar el hilo.");
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