using MagicApp.Models.Enums;

namespace MagicApp.Models.Dtos;

public class CardImageDto
{
    public string Id { get; set; }

    public string Name { get; set; }

    public string ImageUrl { get; set; }

    public List<Color>? Colors { get; set; }

    public Rarity? Rarity { get; set; }

    public List<CardType>? Types { get; set; }

    public string? Set { get; set; }
    
}