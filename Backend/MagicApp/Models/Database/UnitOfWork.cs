using MagicApp.Models.Database.Repositories;

namespace MagicApp.Models.Database
{
    public class UnitOfWork
    {
        private readonly MagicAppContext _context;

        public UserRepository UserRepository { get; init; }

        public DeckRepository DeckRepository { get; init; }
        public GlobalChatMessageRepository GlobalChatMessageRepository { get; init; }

        public ChatMessageRepository ChatMessageRepository { get; init; }

        public UnitOfWork(
            MagicAppContext context,
            UserRepository userRepository,
            DeckRepository deckRepository)
        {
            _context = context;
            UserRepository = userRepository;
            DeckRepository = deckRepository;
            GlobalChatMessageRepository globalChatMessageRepository;
            ChatMessageRepository chatMessageRepository;
        }

        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}