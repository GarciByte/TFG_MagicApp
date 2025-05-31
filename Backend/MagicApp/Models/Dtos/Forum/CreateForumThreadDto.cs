namespace MagicApp.Models.Dtos.Forum;

public class CreateForumThreadDto
{
    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;
}