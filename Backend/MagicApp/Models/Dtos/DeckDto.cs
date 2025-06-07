using MagicApp.Models.Database.Entities;

namespace MagicApp.Models.Dtos
{
    public class DeckDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;

        public int UserId { get; set; }

        public int Victories { get; set; }

        public int Defeats { get; set; }
        
        public List<DeckCard> DeckCards { get; set; } = new List<DeckCard>();
    }
}
