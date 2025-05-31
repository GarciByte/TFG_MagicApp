using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos.Forum;

namespace MagicApp.Models.Mappers;

public class ForumMapper
{
    public ForumThreadDto ToThreadDto(ForumThread thread)
    {
        return new ForumThreadDto
        {
            Id = thread.Id,
            Title = thread.Title,
            CreatedAt = thread.CreatedAt,
            UserNickname = thread.User.Nickname,
            IsClosed = thread.IsClosed
        };
    }

    public ForumCommentDto ToCommentDto(ForumComment comment)
    {
        return new ForumCommentDto
        {
            Id = comment.Id,
            ThreadId = comment.ThreadId,
            CreatedAt = comment.CreatedAt,
            UserNickname = comment.User.Nickname,
            Content = comment.Content
        };
    }

    public List<ForumCommentDto> ToCommentDtoList(IEnumerable<ForumComment> comments)
    {
        return comments
            .OrderBy(c => c.CreatedAt)
            .Select(c => ToCommentDto(c))
            .ToList();
    }

    public ForumThreadDetailDto ToThreadDetailDto(ForumThread thread, int? currentUserId)
    {
        return new ForumThreadDetailDto
        {
            Id = thread.Id,
            Title = thread.Title,
            CreatedAt = thread.CreatedAt,
            UserNickname = thread.User.Nickname,
            IsClosed = thread.IsClosed,
            Comments = ToCommentDtoList(thread.Comments),
            Subscribed = (currentUserId.HasValue && thread.Subscriptions.Any(s => s.UserId == currentUserId.Value))
        };
    }
}