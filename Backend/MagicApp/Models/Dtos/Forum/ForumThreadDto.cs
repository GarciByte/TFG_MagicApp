namespace MagicApp.Models.Dtos.Forum;

public class ForumThreadDto
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public string UserNickname { get; set; } = null!;

    public bool IsClosed { get; set; }
}