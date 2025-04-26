using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicApp.Models.Database.Entities;

public class Deck
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public int Victories { get; set; }

    public int Defeats { get; set; }

    public List<DeckCard> DeckCards { get; set; } = new List<DeckCard>();
}