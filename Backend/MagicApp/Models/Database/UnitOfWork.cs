using MagicApp.Models.Database.Repositories;

namespace MagicApp.Models.Database
{
    public class UnitOfWork
    {
        private readonly MagicAppContext _context;

        public UserRepository UserRepository { get; init; }

        public GlobalChatMessageRepository GlobalChatMessageRepository { get; init; }

        public ChatMessageRepository ChatMessageRepository { get; init; }

        public UnitOfWork(
            MagicAppContext context,
            UserRepository userRepository,
            GlobalChatMessageRepository globalChatMessageRepository,
            ChatMessageRepository chatMessageRepository)
        {
            _context = context;
            UserRepository = userRepository;
            GlobalChatMessageRepository = globalChatMessageRepository;
            ChatMessageRepository = chatMessageRepository;
        }

        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}