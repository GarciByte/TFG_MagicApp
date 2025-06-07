using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos.Forum;

namespace MagicApp.Models.Mappers;

public class ForumMapper(UserMapper userMapper)
{
    private readonly UserMapper _userMapper = userMapper;

    public ForumThreadDto ToThreadDto(ForumThread thread)
    {
        return new ForumThreadDto
        {
            Id = thread.Id,
            Title = thread.Title,
            CreatedAt = thread.CreatedAt,
            User = _userMapper.UserToDto(thread.User),
            IsClosed = thread.IsClosed,
            CommentCount = thread.Comments.Count
        };
    }

    public ForumCommentDto ToCommentDto(ForumComment comment)
    {
        return new ForumCommentDto
        {
            Id = comment.Id,
            ThreadId = comment.ThreadId,
            CreatedAt = comment.CreatedAt,
            User = _userMapper.UserToDto(comment.User),
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
            User = _userMapper.UserToDto(thread.User),
            IsClosed = thread.IsClosed,
            Comments = ToCommentDtoList(thread.Comments),
            Subscribed = (currentUserId.HasValue && thread.Subscriptions.Any(s => s.UserId == currentUserId.Value))
        };
    }
}