using MagicApp.Models.Dtos;
using MagicApp.Models.Dtos.IA;
using System.Text;

namespace MagicApp.Services.IA;

public class ChatWithAiService
{
    private readonly OpenRouterGenerator _openRouter;
    private readonly ChatWithAiMessageService _historyService;
    private readonly string _systemPrompt;
    private readonly string _systemPromptCardDetail;

    // Mensajes antiguos que se envían como contexto a la IA
    private const int ContextMessageCount = 5;

    public ChatWithAiService(
        OpenRouterGenerator openRouter,
        ChatWithAiMessageService historyService,
        string systemPrompt,
        string systemPromptCardDetail)
    {
        _openRouter = openRouter;
        _historyService = historyService;
        _systemPrompt = systemPrompt;
        _systemPromptCardDetail = systemPromptCardDetail;
    }

    // Procesa un prompt de chat
    public async Task<string> ProcessPromptAsync(int userId, string prompt, CancellationToken cancellationToken = default)
    {
        var messages = await BuildContextualMessagesAsync(userId, prompt);
        return await GenerateFromMessagesAsync(messages, saveHistory: true, userId, cancellationToken);
    }

    // Genera un comentario explicativo de una carta
    public async Task<string> CommentCardAsync(int userId, CardDetailDto card, CancellationToken cancellationToken = default)
    {
        var messages = new List<Message>
        {
            // Mensaje con instrucciones globales
            new Message
            {
                Role    = "system",
                Content = _systemPromptCardDetail
            },
            // Carta
            new Message
            {
                Role    = "user",
                Content = SerializeCardForPrompt(card)
            }
        };

        return await GenerateFromMessagesAsync(messages, saveHistory: false, userId, cancellationToken);
    }

    // Construye la lista de mensajes
    private async Task<List<Message>> BuildContextualMessagesAsync(int userId, string prompt)
    {
        // Mensaje con instrucciones globales
        var messages = new List<Message>
        {
            
            new Message
            {
                Role    = "system",
                Content = _systemPrompt
            }
        };

        // Mensajes históricos
        var lastMessages = await _historyService.GetLastMessagesAsync(userId, ContextMessageCount);

        foreach (var hist in lastMessages)
        {
            messages.Add(new Message
            {
                Role = hist.Role,
                Content = hist.Content
            });
        }

        // Prompt actual del usuario
        messages.Add(new Message
        {
            Role = "user",
            Content = prompt
        });

        return messages;
    }

    // Generar texto con OpenRouter
    private async Task<string> GenerateFromMessagesAsync(List<Message> messages, bool saveHistory, int userId, CancellationToken cancellationToken = default)
    {
        string aiResponse;

        try
        {
            // Invocar a la IA
            aiResponse = await _openRouter.GenerateTextAsync(messages, cancellationToken);
            cancellationToken.ThrowIfCancellationRequested();
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Error generando texto con OpenRouter", ex);
        }

        if (cancellationToken.IsCancellationRequested)
        {
            cancellationToken.ThrowIfCancellationRequested();
        }

        // Guardar en BD
        if (saveHistory)
        {
            string userContent = messages
                .Where(m => m.Role == "user")
                .Select(m => m.Content)
                .Last();

            // Guardar mensaje del usuario
            var dtoUserMessage = new ChatWithAiMessageDto
            {
                UserId = userId,
                Role = "user",
                Content = userContent,
            };

            await _historyService.InsertMessageAsync(dtoUserMessage);

            cancellationToken.ThrowIfCancellationRequested();

            // Guardar mensaje de la IA
            var dtoAiMessage = new ChatWithAiMessageDto
            {
                UserId = userId,
                Role = "assistant",
                Content = aiResponse
            };

            await _historyService.InsertMessageAsync(dtoAiMessage);
        }

        return aiResponse;
    }

    // Convierte los datos de la carta en un prompt
    private string SerializeCardForPrompt(CardDetailDto card)
    {
        var sb = new StringBuilder();

        // Identificación de la carta
        sb.AppendLine($"Nombre: {card.Name}");
        sb.AppendLine($"ID: {card.Id}");
        sb.AppendLine($"Colección: {card.SetName} (#{card.CollectorNumber})");
        sb.AppendLine($"Rareza: {card.Rarity}");

        if (!string.IsNullOrWhiteSpace(card.ImageUrl))
            sb.AppendLine($"Imagen: {card.ImageUrl}");

        sb.AppendLine();

        // Coste y símbolos
        if (!string.IsNullOrWhiteSpace(card.ManaCost) || card.Cmc > 0)
        {
            var cost = string.IsNullOrWhiteSpace(card.ManaCost) ? $"CMC {card.Cmc}" : $"{card.ManaCost} (CMC {card.Cmc})";
            sb.AppendLine($"Coste de maná: {cost}");
        }

        //  Colores
        if (card.Colors != null && card.Colors.Any())
            sb.AppendLine($"Colores: {string.Join(", ", card.Colors)}");

        if (card.ColorIdentity != null && card.ColorIdentity.Any())
            sb.AppendLine($"Identidad de color: {string.Join(", ", card.ColorIdentity)}");

        sb.AppendLine();

        // Tipo y texto de reglas
        sb.AppendLine($"Tipo: {card.TypeLine}");

        if (!string.IsNullOrWhiteSpace(card.OracleText))
            sb.AppendLine($"Texto Oracle: {card.OracleText}");

        // Poder/resistencia
        if (!string.IsNullOrWhiteSpace(card.Power) || !string.IsNullOrWhiteSpace(card.Toughness))
            sb.AppendLine($"Poder/Resistencia: {card.Power}/{card.Toughness}");

        // Palabras clave
        if (card.Keywords != null && card.Keywords.Any())
            sb.AppendLine($"Palabras clave: {string.Join(", ", card.Keywords)}");

        sb.AppendLine();

        // Legalidades
        if (card.Legalities != null && card.Legalities.Any())
        {
            sb.AppendLine("Legalidades:");
            foreach (var kv in card.Legalities)
            {
                sb.AppendLine($"  - {kv.Key}: {kv.Value}");
            }
            sb.AppendLine();
        }

        // Precio
        if (!string.IsNullOrWhiteSpace(card.PriceEur))
            sb.AppendLine($"Precio aproximado (EUR): {card.PriceEur}");

        if (!string.IsNullOrWhiteSpace(card.PurchaseCardmarket))
            sb.AppendLine($"Comprar en Cardmarket: {card.PurchaseCardmarket}");

        return sb.ToString().TrimEnd();
    }
}