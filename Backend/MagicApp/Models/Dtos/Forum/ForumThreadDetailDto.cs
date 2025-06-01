namespace MagicApp.Models.Dtos.Forum;

public class ForumThreadDetailDto : ForumThreadDto
{
    public List<ForumCommentDto> Comments { get; set; } = [];

    public bool Subscribed { get; set; }
}