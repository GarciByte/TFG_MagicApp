using MagicApp.Models.Dtos;
using MagicApp.Models.Enums;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace MagicApp.Services.Scryfall;

public class ScryfallService
{
    private readonly HttpClient _http;
    private readonly ILogger<ScryfallService> _logger;

    public ScryfallService(HttpClient http, ILogger<ScryfallService> logger)
    {
        _http = http;
        _logger = logger;
    }

    // Buscar cartas por nombre y filtros
    public async Task<List<CardImageDto>> SearchCardImagesAsync(string name, PaginationDto pagination)
    {

        var queryString = BuildScryfallQuery(name, pagination);
        var relativeUri = $"cards/search?q={Uri.EscapeDataString(queryString)}&page={pagination.Page}";

        try
        {
            using var response = await _http.GetAsync(relativeUri);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                // return new PagedResult<CardImageDto> { Items = new List<CardImageDto>() };
                return new List<CardImageDto>();
            }

            response.EnsureSuccessStatusCode();

            var body = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ScryfallSearchResponse>(body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var list = ExtractCardImages(result);

            int totalCount = result.TotalCards;

            /*           return new PagedResult<CardImageDto>
                      {
                          Items = list,
                      }; */
            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError("Ha ocurrido un error: " + ex.Message);
            // return new PagedResult<CardImageDto> { Items = new List<CardImageDto>() };
            return new List<CardImageDto>();
        }
    }

    // Obtener datos de una carta por ID
    public async Task<CardDetailDto> GetCardByIdAsync(string id)
    {
        try
        {
            using var resp = await _http.GetAsync($"cards/{Uri.EscapeDataString(id)}");

            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogError("No se ha encontrado la carta con ID: {id}", id);
                return null;
            }

            resp.EnsureSuccessStatusCode();

            var json = await resp.Content.ReadAsStringAsync();
            var src = JsonSerializer.Deserialize<CardDetailResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return new CardDetailDto
            {
                Id = src.Id,
                Name = src.Name,
                ImageUrl = src.ImageUris?.Normal,
                ManaCost = src.ManaCost,
                Cmc = src.Cmc,
                ManaSymbolUrls = BuildManaSymbolUrls(src.ManaCost),
                TypeLine = src.TypeLine,
                OracleText = src.OracleText,
                OracleTextHtml = BuildOracleTextHtml(src.OracleText),
                Power = src.Power,
                Toughness = src.Toughness,
                Colors = src.Colors,
                ColorIdentity = src.ColorIdentity,
                SetName = src.SetName,
                CollectorNumber = src.CollectorNumber,
                Rarity = src.Rarity,
                PriceEur = GetValueOrNull(src.Prices, "eur"),
                PurchaseCardmarket = GetValueOrNull(src.PurchaseUris, "cardmarket"),
                Keywords = src.Keywords,
                Legalities = src.Legalities
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Ha ocurrido un error: " + ex.Message);
            return null;
        }
    }

    private static string GetValueOrNull(IDictionary<string, string> dict, string key)
    {
        if (dict != null && dict.TryGetValue(key, out var value))
            return value;
        return null;
    }

    private static List<string> BuildManaSymbolUrls(string manaCost)
    {
        var urls = new List<string>();
        if (string.IsNullOrEmpty(manaCost))
            return urls;

        var matches = Regex.Matches(manaCost, @"\{([^}]+)\}");

        foreach (Match m in matches)
        {
            var symbol = m.Groups[1].Value;
            urls.Add($"https://svgs.scryfall.io/card-symbols/{symbol}.svg");
        }
        return urls;
    }

    private static string BuildOracleTextHtml(string oracleText)
    {
        if (string.IsNullOrEmpty(oracleText))
            return string.Empty;

        return Regex.Replace(WebUtility.HtmlEncode(oracleText), @"\{([^}]+)\}",
            match =>
            {
                var symbol = match.Groups[1].Value;
                var url = $"https://svgs.scryfall.io/card-symbols/{symbol}.svg";
                return $"<img class=\"mana-symbol-inline\" src=\"{url}\" alt=\"{symbol}\" />";
            }
        );
    }

    private List<CardImageDto> ExtractCardImages(ScryfallSearchResponse result)
    {
        var list = new List<CardImageDto>();

        foreach (var card in result.Data ?? Enumerable.Empty<CardData>())
        {
            var url = card.ImageUris?.Normal;

            if (url == null && card.CardFaces?.Any() == true)
                url = card.CardFaces[0].ImageUris?.Normal;

            if (string.IsNullOrEmpty(url))
            {
                continue;
            }

            // Convierte string rarity a enum Rarity
            Rarity? rarityEnum = null;
            if (!string.IsNullOrEmpty(card.Rarity))
            {
                if (Enum.TryParse<Rarity>(CapitalizeFirst(card.Rarity), out var parsedRarity))
                {
                    rarityEnum = parsedRarity;
                }
            }

            string CapitalizeFirst(string input) =>
                string.IsNullOrEmpty(input) ? input : char.ToUpper(input[0]) + input.Substring(1).ToLower();

            list.Add(new CardImageDto
            {
                Id = card.Id,
                Name = card.Name,
                ImageUrl = url,
                Colors = card.Colors?.Select(c => Enum.Parse<Color>(c, ignoreCase: true)).ToList(),
                Rarity = rarityEnum,
                Types = card.TypeLine?.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                    .Select(t => Enum.TryParse<CardType>(t, true, out var ct) ? ct : (CardType?)null)
                                    .Where(t => t.HasValue)
                                    .Select(t => t.Value)
                                    .ToList(),
                Set = card.SetName
            });
        }

        return list;//.Take(30).ToList();
    }

    // Query para Scryfall nombre + filtros
    private string BuildScryfallQuery(string name, PaginationDto filter)
    {
        var parts = new List<string>();

        // Nombre o texto libre
        if (!string.IsNullOrWhiteSpace(name))
        {
            parts.Add(name);
        }

        // Colores
        if (filter.Colors != null && filter.Colors.Count > 0)
        {
            var colorsCode = string.Concat(filter.Colors.Select(c =>
            {
                return c switch
                {
                    Color.W => "White",
                    Color.U => "Blue",
                    Color.B => "Black",
                    Color.R => "Red",
                    Color.G => "Green",
                    _ => ""
                };
            }));

            if (!string.IsNullOrEmpty(colorsCode))
            {
                parts.Add($"colors:{colorsCode}");
            }
        }

        // Rareza
        if (filter.Rarity != null)
        {
            parts.Add($"rarity:{filter.Rarity.ToString().ToLower()}");
        }

        // Tipos
        if (filter.Types != null && filter.Types.Count > 0)
        {
            var typesStr = string.Join(" ", filter.Types.Select(t => t.ToString().ToLower()));
            parts.Add(typesStr);
        }

        // Si no hay nada devolver ! para obtener todas las cartas
        if (parts.Count == 0)
            return "!";

        return string.Join(" ", parts);
    }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
}
