using MagicApp.Models.Dtos;
using MagicApp.Models.Mappers;
using MagicApp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MagicApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly TokenValidationParameters _tokenParameters;
    private readonly UserService _userService;
    private readonly UserMapper _userMapper;
    private readonly ILogger<AuthController> _logger;

    public AuthController(UserService userService, UserMapper userMapper, IOptionsMonitor<JwtBearerOptions> jwtOptions, ILogger<AuthController> logger)
    {
        _userService = userService;
        _userMapper = userMapper;
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
        _logger = logger;
    }

    // Login
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResult>> Login([FromBody] LoginRequest model)
    {
        _logger.LogInformation("Un usuario quiere iniciar sesión: {model.Nickname}", model.Nickname);

        try
        {
            // Se usa el método LoginAsync para verificar el usuario y la contraseña
            var user = await _userService.LoginAsync(model.Nickname, model.Password);

            // Si el usuario es null, se devuelve Unauthorized
            if (user == null)
            {
                _logger.LogError("Datos de inicio de sesión incorrectos");
                return Unauthorized("Datos de inicio de sesión incorrectos.");
            }

            // Prohibición del usuario
            if (user.IsBanned)
            {
                _logger.LogError("El usuario {user.Nickname} está baneado", user.Nickname);
                return StatusCode(StatusCodes.Status403Forbidden, $"El usuario {user.Nickname} está baneado.");
            }

            // Access Token
            var accessTokenDescriptor = new SecurityTokenDescriptor
            {
                Claims = new Dictionary<string, object>
                {
                    { ClaimTypes.NameIdentifier, user.Id },
                    { ClaimTypes.Name, user.Nickname },
                    { ClaimTypes.Role, user.Role }
                },

                // Expiración del token en 12 horas
                Expires = DateTime.UtcNow.AddHours(12),

                SigningCredentials = new SigningCredentials(
                    _tokenParameters.IssuerSigningKey,
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var accessTokenHandler = new JwtSecurityTokenHandler();
            var accessToken = accessTokenHandler.CreateToken(accessTokenDescriptor);
            string accessTokenString = accessTokenHandler.WriteToken(accessToken);

            // Refresh Token
            var refreshTokenDescriptor = new SecurityTokenDescriptor
            {
                Claims = new Dictionary<string, object>
            {
                { ClaimTypes.NameIdentifier, user.Id },
                { "token_type", "refresh" }
            },

                // Expiración del token en 30 días
                Expires = DateTime.UtcNow.AddDays(30),

                SigningCredentials = new SigningCredentials(
                    _tokenParameters.IssuerSigningKey,
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var refreshTokenHandler = new JwtSecurityTokenHandler();
            var refreshToken = refreshTokenHandler.CreateToken(refreshTokenDescriptor);
            var refreshTokenString = refreshTokenHandler.WriteToken(refreshToken);

            // Se devuelve el resultado de inicio de sesión con el token y los datos del usuario
            var loginResult = new LoginResult
            {
                AccessToken = accessTokenString,
                RefreshToken = refreshTokenString,
                User = _userMapper.UserToDto(user)
            };

            _logger.LogInformation("Usuario: {@loginResult}", loginResult);

            return Ok(loginResult);
        }

        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error en el inicio de sesión {ex}", ex);
            return Unauthorized("Datos de inicio de sesión incorrectos.");
        }
    }

    // Refrescar el token
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshTokenResult>> Refresh([FromBody] RefreshTokenRequest RefreshToken)
    {
        _logger.LogInformation("Se va a refrescar un token: {@RefreshToken}", RefreshToken);

        try
        {
            // Validar el refresh token
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _tokenParameters.IssuerSigningKey,
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
            var principal = tokenHandler.ValidateToken(RefreshToken.RefreshToken, validationParameters, out _);
            var tokenTypeClaim = principal.FindFirst("token_type")?.Value;

            if (tokenTypeClaim != "refresh")
            {
                _logger.LogError("Token inválido {RefreshToken.RefreshToken}", RefreshToken.RefreshToken);
                return Unauthorized("Token inválido");
            }

            // Obtener usuario
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userService.GetUserByIdAsync(int.Parse(userId));

            if (user == null || user.IsBanned)
            {
                _logger.LogError("Usuario no válido {@user}", user);
                return Unauthorized("Usuario no válido");
            }

            // Generar nuevo access token
            var accessTokenDescriptor = new SecurityTokenDescriptor
            {
                Claims = new Dictionary<string, object>
            {
                { ClaimTypes.NameIdentifier, user.UserId },
                { ClaimTypes.Name, user.Nickname },
                { ClaimTypes.Role, user.Role }
            },
                Expires = DateTime.UtcNow.AddHours(12),
                SigningCredentials = new SigningCredentials(
                    _tokenParameters.IssuerSigningKey,
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var accessToken = tokenHandler.CreateToken(accessTokenDescriptor);
            var newAccessToken = tokenHandler.WriteToken(accessToken);

            // Generar nuevo refresh token
            var refreshTokenDescriptor = new SecurityTokenDescriptor
            {
                Claims = new Dictionary<string, object>
            {
                { ClaimTypes.NameIdentifier, user.UserId },
                { "token_type", "refresh" }
            },
                Expires = DateTime.UtcNow.AddDays(30),
                SigningCredentials = new SigningCredentials(
                    _tokenParameters.IssuerSigningKey,
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var refreshToken = tokenHandler.CreateToken(refreshTokenDescriptor);
            var newRefreshToken = tokenHandler.WriteToken(refreshToken);

            _logger.LogInformation("Access token: {newAccessToken}, Refresh token: {newRefreshToken}", newAccessToken, newRefreshToken);

            return Ok(new RefreshTokenResult
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al refrescar el token {ex}", ex);
            return Unauthorized("Token inválido");
        }
    }

    // Registro
    [AllowAnonymous]
    [HttpPost("Signup")]
    public async Task<ActionResult<RegisterDto>> SignUp([FromForm] RegisterDto model)
    {
        _logger.LogInformation("Un usuario quiere registrarse: {model.Nickname}", model.Nickname);

        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogError("Registro inválido");
                return BadRequest(ModelState);
            }

            // Verifica si ya existe un usuario con el mismo correo
            var existingUserEmail = await _userService.GetUserByEmailAsync(model.Email);

            // Verifica si ya existe un usuario con el mismo nickname
            var existingUserNickname = await _userService.GetUserByNicknameAsync(model.Nickname);

            if (existingUserEmail != null)
            {
                _logger.LogError("El correo electrónico ya está en uso.");
                return Conflict("El correo electrónico ya está en uso.");
            }

            if (existingUserNickname != null)
            {
                _logger.LogError("El nickname ya está en uso.");
                return Conflict("El nickname ya está en uso.");
            }

            var newUser = await _userService.RegisterAsync(model);

            var userDto = _userMapper.UserToDto(newUser);

            _logger.LogInformation("Usuario: {@userDto}", userDto);

            return CreatedAtAction(nameof(Login), new { email = userDto.Email }, userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError("Se ha producido un error al registrar un usuario {ex}", ex);
            return Unauthorized("Datos inválidos.");
        }
    }
}