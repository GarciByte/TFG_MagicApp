namespace MagicApp.Models.Dtos;

public class ModifyBanRequest
{
    public int UserId { get; set; }

    public bool IsBanned { get; set; }
}