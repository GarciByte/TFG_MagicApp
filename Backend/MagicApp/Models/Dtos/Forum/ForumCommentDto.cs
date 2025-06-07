namespace MagicApp.Models.Dtos.Forum;

public class ForumCommentDto
{
    public int Id { get; set; }

    public int ThreadId { get; set; }

    public DateTime CreatedAt { get; set; }

    public UserDto User { get; set; } = null!;

    public string Content { get; set; } = null!;
}