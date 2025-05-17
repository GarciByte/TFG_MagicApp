namespace MagicApp.Models.Dtos;

public class UserProfileDto
{
    public int UserId { get; set; }

    public string Nickname { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string AvatarUrl { get; set; } = null!;

    public bool IsBanned { get; set; }

    public string Password { get; set; } = null!;
}