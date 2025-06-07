using System;
using MagicApp.Models.Enums;

namespace MagicApp.Models.Dtos;

public class PaginationDto
{
    public int Page { get; set; }

    public string? Name { get; set; }

    public List<Color>? Colors { get; set; }

    public Rarity? Rarity { get; set; }

    public List<CardType>? Types { get; set; }

}

