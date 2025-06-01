using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;

namespace MagicApp.Models.Database.Repositories;

public class ForumCommentRepository : Repository<ForumComment, int>
{
    public ForumCommentRepository(MagicAppContext context) : base(context) { }

    // Insertar un nuevo comentario
    public async Task<ForumComment> InsertCommentAsync(ForumComment newComment)
    {
        await InsertAsync(newComment);
        return newComment;
    }

    // Borrar un comentario por ID
    public async Task DeleteCommentAsync(int commentId)
    {
        var comment = await GetByIdAsync(commentId);
        if (comment != null)
        {
            await base.Delete(comment);
        }
    }
}