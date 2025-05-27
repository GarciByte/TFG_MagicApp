namespace MagicApp.Models.Dtos;

public class ModifyUserDto
{
    public int UserId { get; set; }

    public string Nickname { get; set; }

    public string Email { get; set; }

    public string AvatarName { get; set; } = null!;
}