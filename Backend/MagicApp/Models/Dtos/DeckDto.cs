using MagicApp.Models.Database.Entities;

namespace MagicApp.Models.Dtos
{
    public class DeckDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;

        public int UserId { get; set; }

        public string DeckIconName { get; set; } = null;
        public List<DeckCard> DeckCards { get; set; } = new List<DeckCard>();
    }
}
