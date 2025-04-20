using MagicApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MagicApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(UserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    // Obtener un usuario por su id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        _logger.LogInformation("Se ha recibido una consulta al usuario por ID: {id}", id);

        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
        {
            _logger.LogError("El usuario con el id {id} no ha sido encontrado.", id);

            return NotFound(new { message = $"El usuario con el id '{id}' no ha sido encontrado." });
        }

        _logger.LogInformation("Usuario: {@user}", user);

        return Ok(user);
    }

    // Obtener usuarios por nickname
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsersByNicknameAsync(string nickname)
    {
        _logger.LogInformation("Se ha recibido una consulta al usuario por nickname: {nickname}", nickname);

        // Quitar tildes y convertir a minúsculas
        string normalizedNickname = Normalize(nickname);

        var allUsers = await _userService.GetAllUsersAsync();

        // Filtrar usuarios
        var filteredUsers = allUsers
            .Where(user => Normalize(user.Nickname).Contains(normalizedNickname))
        .ToList();

        _logger.LogInformation("Usuarios: {@filteredUsers}", filteredUsers);

        return Ok(filteredUsers);
    }

    // Obtener todos los usuarios
    [HttpGet("allUsers")]
    public async Task<IActionResult> GetAllUsersAsync()
    {
        _logger.LogInformation("Se ha recibido una consulta a todos los usuarios");

        var users = await _userService.GetAllUsersAsync();

        _logger.LogInformation("Usuarios: {@users}", users);

        return Ok(users);
    }

    // Método para quitar tildes y convertir a minúsculas
    private static string Normalize(string input)
    {
        return input
            .Replace("á", "a").Replace("é", "e").Replace("í", "i")
            .Replace("ó", "o").Replace("ú", "u").Replace("ü", "u")
            .Replace("ñ", "n").Replace("Á", "A").Replace("É", "E")
            .Replace("Í", "I").Replace("Ó", "O").Replace("Ú", "U")
            .Replace("Ü", "U").Replace("Ñ", "N")
            .ToLower();
    }
}