using MagicApp.Models.Database.Repositories;

namespace MagicApp.Models.Database
{
    public class UnitOfWork
    {
        private readonly MagicAppContext _context;

        public UserRepository UserRepository { get; init; }

        public GlobalChatMessageRepository GlobalChatMessageRepository { get; init; }

        public ChatMessageRepository ChatMessageRepository { get; init; }

        public ReportRepository ReportRepository { get; init; }

        public ForumThreadRepository ForumThreadRepository { get; init; }

        public ForumCommentRepository ForumCommentRepository { get; init; }

        public ThreadSubscriptionRepository ThreadSubscriptionRepository { get; init; }

        public DeckRepository DeckRepository { get; init; }

        public ChatWithAiMessageRepository ChatWithAiMessageRepository { get; init; }

        public UnitOfWork(
            MagicAppContext context,
            UserRepository userRepository,
            GlobalChatMessageRepository globalChatMessageRepository,
            ChatMessageRepository chatMessageRepository,
            ReportRepository reportRepository,
            ForumThreadRepository forumThreadRepository,
            ForumCommentRepository forumCommentRepository,
            ThreadSubscriptionRepository threadSubscriptionRepository,
            DeckRepository deckRepository,
            ChatWithAiMessageRepository chatWithAiMessageRepository)
        {
            _context = context;
            UserRepository = userRepository;
            GlobalChatMessageRepository = globalChatMessageRepository;
            ChatMessageRepository = chatMessageRepository;
            ReportRepository = reportRepository;
            ForumThreadRepository = forumThreadRepository;
            ForumCommentRepository = forumCommentRepository;
            ThreadSubscriptionRepository = threadSubscriptionRepository;
            DeckRepository = deckRepository;
            ChatWithAiMessageRepository = chatWithAiMessageRepository;
        }

        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}