using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Models.Mappers;
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
    private readonly UserMapper _userMapper;
    private readonly ILogger<UserController> _logger;

    public UserController(UserService userService, ILogger<UserController> logger, UserMapper userMapper)
    {
        _userService = userService;
        _logger = logger;
        _userMapper = userMapper;
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

        return Ok(users);
    }

    // Verificar si un usuario es admin
    [HttpGet("is-admin")]
    [Authorize]
    public IActionResult IsAdmin()
    {
        _logger.LogInformation("Se ha recibido una consulta a si un usuario es admin");

        bool isAdmin = User.IsInRole("Admin");

        _logger.LogInformation("Es admin: {isAdmin}", isAdmin);

        if (!isAdmin)
            return Ok(new { isAdmin = false });

        return Ok(new { isAdmin = true });
    }

    // Modificar datos de un usuario
    [Authorize]
    [HttpPut("modifyUser")]
    public async Task<IActionResult> ModifyUser([FromForm] ModifyUserDto modifyUserDto)
    {
        _logger.LogInformation("Se ha recibido una modificación a un usuario");

        // Obtener datos del usuario
        UserProfileDto userData = await ReadToken();
        if (userData == null)
        {
            return BadRequest("El usuario no fue encontrado.");
        }

        _logger.LogInformation("Usuario autenticado: ID = {userData.UserId}, Nickname = {userData.Nickname}, Email = {userData.Email}", 
            userData.UserId, userData.Nickname, userData.Email);

        modifyUserDto.UserId = userData.UserId;

        try
        {
            await _userService.ModifyUserAsync(modifyUserDto);

            _logger.LogInformation("Nuevos datos del usuario: ID = {modifyUserDto.UserId}, Nickname = {modifyUserDto.Nickname}, Email = {modifyUserDto.Email}",
                modifyUserDto.UserId, modifyUserDto.Nickname, modifyUserDto.Email);

            return Ok("Usuario actualizado correctamente.");
        }

        catch (InvalidOperationException ex)
        {
            _logger.LogError("Se ha producido un error al modificarse el usuario {ex}", ex);
            return BadRequest("No pudo modificarse el usuario: " + ex.Message);
        }
    }

    // Modificar rol del usuario
    [Authorize(Roles = "Admin")]
    [HttpPut("modifyUserRole")]
    public async Task<IActionResult> ModifyUserRole(ModifyRoleRequest request)
    {
        _logger.LogInformation("Se ha recibido una modificación de rol para un usuario");

        // Obtener datos del usuario
        UserDto userData = await _userService.GetUserByIdAsync(request.UserId);
        if (userData == null)
        {
            return BadRequest("El usuario no fue encontrado.");
        }

        try
        {
            if (request.NewRole == "User" || request.NewRole == "Admin")
            {
                await _userService.ModifyUserRoleAsync(request.UserId, request.NewRole);
                return Ok("Rol de usuario actualizado correctamente.");
            }
            else
            {
                return BadRequest("El nuevo rol debe ser User o Admin.");
            }
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError("Se ha producido un error al modificarse el rol del usuario {ex}", ex);
            return BadRequest("No pudo modificarse el rol del usuario.");
        }
    }

    // Modificar prohibición de un usuario
    [Authorize(Roles = "Admin")]
    [HttpPut("modifyUserBan")]
    public async Task<IActionResult> ModifyUserBan(ModifyBanRequest request)
    {
        _logger.LogInformation("Se ha recibido una modificación de prohibición para un usuario");

        // Obtener datos del usuario
        UserDto userData = await _userService.GetUserByIdAsync(request.UserId);
        if (userData == null)
        {
            return BadRequest("El usuario no fue encontrado.");
        }

        try
        {
            await _userService.ModifyUserBanAsync(request.UserId, request.IsBanned);
            return Ok("Prohibición del usuario actualizado correctamente.");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError("Se ha producido un error al modificarse la prohibició del usuario {ex}", ex);
            return BadRequest("No pudo modificarse la prohibición del usuario.");
        }
    }

    // Modificar contraseña del usuario
    [Authorize]
    [HttpPut("modifyPassword")]
    public async Task<IActionResult> ModifyPassword([FromBody] NewPasswordDto newPasswordRequest)
    {
        _logger.LogInformation("Se ha recibido una modificación de contraseña para un usuario");

        if (newPasswordRequest == null)
        {
            return BadRequest("La nueva contraseña es nula.");
        }

        // Obtener datos del usuario
        UserProfileDto userData = await ReadToken();
        if (userData == null)
        {
            return BadRequest("El usuario no fue encontrado.");
        }

        _logger.LogInformation("Usuario autenticado: ID = {userData.UserId}, Nickname = {userData.Nickname}, Email = {userData.Email}",
            userData.UserId, userData.Nickname, userData.Email);

        try
        {
            await _userService.ModifyPasswordAsync(userData.UserId, newPasswordRequest.NewPassword);
            return Ok("Contraseña actualizada correctamente.");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError("Se ha producido un error al modificarse la contraseña del usuario {ex}", ex);
            return BadRequest("No pudo modificarse la contraseña.");
        }
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

    // Leer datos del token
    private async Task<UserProfileDto> ReadToken()
    {
        try
        {
            string id = User.Claims.FirstOrDefault().Value;
            User user = await _userService.GetUserByIdAsyncNoDto(Int32.Parse(id));
            UserProfileDto userDto = _userMapper.UserProfileToDto(user);
            return userDto;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al leer el token: {ex}", ex);
            return null;
        }
    }
}