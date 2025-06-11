using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace MagicApp.Models.Database.Entities;

public class DeckCard
{
    [Key]
    public int CardId { get; set; }
    public string Id { get; set; }

    public string Name { get; set; }

    public string ImageUrl { get; set; }

    public string ManaCost { get; set; }

    public decimal Cmc { get; set; }

    public string TypeLine { get; set; }

    public string OracleText { get; set; }

    public string OracleTextHtml { get; set; }

    public string Power { get; set; }

    public string Toughness { get; set; }

    public string SetName { get; set; }

    public string CollectorNumber { get; set; }

    public string Rarity { get; set; }

    public string PriceEur { get; set; }

    public string PurchaseCardmarket { get; set; }

    public int DeckId { get; set; }
    public Deck Deck { get; set; }
}