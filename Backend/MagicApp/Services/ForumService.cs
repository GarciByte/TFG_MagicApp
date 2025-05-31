using MagicApp.Models.Database;
using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos.Forum;
using MagicApp.Models.Mappers;

namespace MagicApp.Services;

public class ForumService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly ForumMapper _forumMapper;

    public ForumService(UnitOfWork unitOfWork, ForumMapper forumMapper)
    {
        _unitOfWork = unitOfWork;
        _forumMapper = forumMapper;
    }

    // Obtiene todos los hilos
    public async Task<List<ForumThreadDto>> GetAllThreadsAsync()
    {
        var threads = await _unitOfWork.ForumThreadRepository.GetAllWithDetailsAsync();
        return threads.Select(t => _forumMapper.ToThreadDto(t)).ToList();
    }

    // Obtiene los detalles de un hilo
    public async Task<ForumThreadDetailDto> GetThreadDetailAsync(int threadId, int currentUserId)
    {
        var thread = await _unitOfWork.ForumThreadRepository.GetByIdWithDetailsAsync(threadId);

        if (thread == null)
        {
            return null;
        }

        return _forumMapper.ToThreadDetailDto(thread, currentUserId);
    }

    // Crear un nuevo hilo y su primer comentario
    public async Task<ForumThread> CreateThreadAsync(int userId, CreateForumThreadDto dto)
    {
        var newThread = new ForumThread
        {
            Title = dto.Title,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
            IsClosed = false
        };

        await _unitOfWork.ForumThreadRepository.InsertThreadAsync(newThread);
        await _unitOfWork.SaveAsync();

        var firstComment = new ForumComment
        {
            ThreadId = newThread.Id,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        await _unitOfWork.ForumCommentRepository.InsertCommentAsync(firstComment);
        await _unitOfWork.SaveAsync();

        return newThread;
    }

    // Agregar un comentario a un hilo existente
    public async Task<ForumComment> AddCommentAsync(int userId, CreateForumCommentDto dto)
    {
        var thread = await _unitOfWork.ForumThreadRepository.GetByIdWithDetailsAsync(dto.ThreadId);

        if (thread == null)
        {
            return null;
        }

        if (thread.IsClosed)
        {
            return null;
        }

        var newComment = new ForumComment
        {
            ThreadId = dto.ThreadId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        await _unitOfWork.ForumCommentRepository.InsertCommentAsync(newComment);
        await _unitOfWork.SaveAsync();

        return newComment;
    }

    // Suscribir un usuario a un hilo
    public async Task SubscribeAsync(int userId, int threadId)
    {
        var thread = await _unitOfWork.ForumThreadRepository.GetByIdWithDetailsAsync(threadId);

        if (thread == null)
        {
            return;
        }

        bool alreadySubscribed = await _unitOfWork.ThreadSubscriptionRepository.ExistsAsync(threadId, userId);

        if (alreadySubscribed)
        {
            return;
        }

        var newSubscription = new ThreadSubscription
        {
            ThreadId = threadId,
            UserId = userId
        };

        await _unitOfWork.ThreadSubscriptionRepository.InsertSubscriptionAsync(newSubscription);
        await _unitOfWork.SaveAsync();
    }

    // Eliminar la suscripción del usuario a un hilo
    public async Task UnsubscribeAsync(int userId, int threadId)
    {
        var subscription = await _unitOfWork.ThreadSubscriptionRepository.GetSubscriptionAsync(threadId, userId);

        if (subscription == null)
        {
            return;
        }

        await _unitOfWork.ThreadSubscriptionRepository.DeleteSubscriptionAsync(subscription);
        await _unitOfWork.SaveAsync();
    }

    // Cierra un hilo
    public async Task CloseThreadAsync(int threadId)
    {
        var thread = await _unitOfWork.ForumThreadRepository.GetByIdWithDetailsAsync(threadId);

        if (thread == null)
        {
            return;
        }

        await _unitOfWork.ForumThreadRepository.CloseThreadAsync(threadId);
        await _unitOfWork.SaveAsync();
    }

    // Reabre un hilo
    public async Task OpenThreadAsync(int threadId)
    {
        var thread = await _unitOfWork.ForumThreadRepository.GetByIdWithDetailsAsync(threadId);

        if (thread == null)
        {
            return;
        }

        await _unitOfWork.ForumThreadRepository.OpenThreadAsync(threadId);
        await _unitOfWork.SaveAsync();
    }

    // Borra un comentario por su ID
    public async Task DeleteCommentAsync(int commentId)
    {
        var comment = await _unitOfWork.ForumCommentRepository.GetByIdAsync(commentId);

        if (comment == null)
        {
            return;
        }

        await _unitOfWork.ForumCommentRepository.DeleteCommentAsync(commentId);
        await _unitOfWork.SaveAsync();
    }

    // Borra un hilo completo por su ID
    public async Task DeleteThreadAsync(int threadId)
    {
        var thread = await _unitOfWork.ForumThreadRepository.GetByIdAsync(threadId);

        if (thread == null)
        {
            return;
        }

        await _unitOfWork.ForumThreadRepository.DeleteThreadAsync(threadId);
        await _unitOfWork.SaveAsync();
    }
}