using System.Text;
using System.Text.Json;
using Newtonsoft.Json;

namespace MagicApp.Services.IA;

public class OpenRouterGenerator
{
    private readonly HttpClient _httpClient;
    private readonly string _model;

    public OpenRouterGenerator(HttpClient httpClient, string model)
    {
        _httpClient = httpClient;
        _model = model;
    }

    // Método para generar texto usando la API de OpenRouter con la lista de mensajes
    public async Task<string> GenerateTextAsync(List<Message> history, CancellationToken cancellationToken = default)
    {
        var requestBody = new
        {
            model = _model,
            messages = history.ConvertAll(m => new { role = m.Role, content = m.Content })
        };

        string jsonBody = JsonConvert.SerializeObject(requestBody);
        using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        HttpResponseMessage response;

        try
        {
            // Enviar petición
            response = await _httpClient.PostAsync("api/v1/chat/completions", content, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException("Error al conectar con OpenRouter", ex);
        }
        catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            throw new InvalidOperationException("La petición a OpenRouter ha excedido el tiempo límite.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"OpenRouter devolvió {(int)response.StatusCode} - {response.ReasonPhrase}");
        }

        // Leer y parsear el JSON con la respuesta
        string jsonResponse = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParseResponse(jsonResponse);
    }

    // Parsea el JSON devuelto por OpenRouter y extrae el mensaje
    private string ParseResponse(string json)
    {
        try
        {
            var data = JsonConvert.DeserializeObject<ChatCompletionResponse>(json);

            if (data != null
                && data.Choices != null
                && data.Choices.Length > 0
                && data.Choices[0].Message != null)
            {
                return data.Choices[0].Message.Content;
            }

            throw new InvalidOperationException("Respuesta inválida de OpenRouter.");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("No se pudo parsear la respuesta de OpenRouter", ex);
        }
    }
}