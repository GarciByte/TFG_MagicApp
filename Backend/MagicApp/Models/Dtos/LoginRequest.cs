namespace MagicApp.Models.Dtos;

public class LoginRequest
{
    public string Nickname { get; set; } = null!;

    public string Password { get; set; } = null!;
}