﻿using System.Text.Json.Serialization;

namespace MagicApp.Services.Scryfall;

public class ScryfallSearchResponse
{
    [JsonPropertyName("data")]
    public List<CardData> Data { get; set; }

    [JsonPropertyName("total_cards")]
    public int TotalCards { get; set; }
}