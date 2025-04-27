using MagicApp.Models.Dtos;
using System.Net;
using System.Text.Json;

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

    // Busca cartas por nombre
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
}