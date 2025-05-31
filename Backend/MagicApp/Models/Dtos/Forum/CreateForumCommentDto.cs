namespace MagicApp.Models.Dtos.Forum;

public class CreateForumCommentDto
{
    public int ThreadId { get; set; }

    public string Content { get; set; } = null!;
}