using MagicApp.Models.Dtos;
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

    // Buscar cartas por nombre
    public async Task<List<CardImageDto>> SearchCardImagesAsync(string name)
    {
        _logger.LogInformation("Se va a buscar en Scryfall la carta: {name}", name);

        if (string.IsNullOrWhiteSpace(name))
            return new List<CardImageDto>();

        var query = Uri.EscapeDataString(name);
        var relativeUri = $"cards/search?q={query}";

        try
        {
            // Hacemos la petición
            using var response = await _http.GetAsync(relativeUri);

            // Si no hay coincidencias, se devuelve una lista vacía
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogInformation("No se ha encontrado la carta: {name}", name);
                return new List<CardImageDto>();
            }

            response.EnsureSuccessStatusCode();

            // Deserializamos la respuesta
            var body = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ScryfallSearchResponse>(body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Se devuelve el DTO de cada carta
            var list = new List<CardImageDto>();
            foreach (var card in result.Data ?? Enumerable.Empty<CardData>())
            {
                var url = card.ImageUris?.Normal;

                if (url == null && card.CardFaces?.Any() == true)
                    url = card.CardFaces[0].ImageUris?.Normal;

                // Si la carta no tiene imagen, se omite
                if (string.IsNullOrEmpty(url))
                {
                    _logger.LogInformation("Se ha omitido la carta: {card.Name}", card.Name);
                    continue;
                }

                list.Add(new CardImageDto
                {
                    Id = card.Id,
                    Name = card.Name,
                    ImageUrl = url
                });
            }

            _logger.LogInformation("Se han encontrado {list.Count} coincidencias con el nombre: {name}", list.Count, name);

            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError("Se producido un error en la petición: {ex.Message}", ex.Message);
            return new List<CardImageDto>();
        }
    }

    // Obtener datos de una carta por ID
    public async Task<CardDetailDto> GetCardByIdAsync(string id)
    {
        _logger.LogInformation("Obteniendo carta con ID {id}", id);

        try
        {
            // Hacemos la petición
            using var resp = await _http.GetAsync($"cards/{Uri.EscapeDataString(id)}");

            // Si no encuentra la carta
            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogError("No se ha encontrado la carta con ID: {id}", id);
                return null;
            }

            resp.EnsureSuccessStatusCode();

            // Deserializamos la respuesta
            var json = await resp.Content.ReadAsStringAsync();
            var src = JsonSerializer.Deserialize<CardDetailResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Se devuelve el DTO de la carta
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
            _logger.LogError("Se producido un error en la petición: {ex.Message}", ex.Message);
            return null;
        }
    }

    private static string GetValueOrNull(IDictionary<string, string> dict, string key)
    {
        if (dict != null && dict.TryGetValue(key, out var value))
            return value;
        return null;
    }

    // Obtener símbolos SVG del coste de la carta
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

    // Obtener símbolos SVG de la descripción de la carta
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

}