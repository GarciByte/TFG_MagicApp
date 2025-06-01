using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MagicApp.Models.Database.Entities;

public class DeckCard
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string CardId { get; set; }

    public int DeckId { get; set; }
    public Deck Deck { get; set; }
}