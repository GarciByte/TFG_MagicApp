using MagicApp.Models.Dtos.IA;

namespace MagicApp.Services.IA;

public class ChatWithAiService
{
    private readonly OpenRouterGenerator _openRouter;
    private readonly ChatWithAiMessageService _historyService;
    private readonly string _systemPrompt;

    // Mensajes antiguos que se envían como contexto a la IA
    private const int ContextMessageCount = 5;

    public ChatWithAiService(
        OpenRouterGenerator openRouter,
        ChatWithAiMessageService historyService,
        string systemPrompt)
    {
        _openRouter = openRouter;
        _historyService = historyService;
        _systemPrompt = systemPrompt;
    }

    // Procesa el prompt de un usuario
    public async Task<string> ProcessPromptAsync(int userId, string prompt, CancellationToken cancellationToken = default)
    {
        var lastMessages = await _historyService.GetLastMessagesAsync(userId, ContextMessageCount);
        var messagesList = new List<Message>();

        // Mensaje con instrucciones globales
        messagesList.Add(new Message
        {
            Role = "system",
            Content = _systemPrompt
        });

        // Mensajes históricos
        foreach (var message in lastMessages)
        {
            messagesList.Add(new Message
            {
                Role = message.Role,
                Content = message.Content
            });
        }

        // Prompt actual del usuario
        messagesList.Add(new Message
        {
            Role = "user",
            Content = prompt
        });

        string iaResponse;

        try
        {
            // Invocar a la IA
            iaResponse = await _openRouter.GenerateTextAsync(messagesList, cancellationToken);
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
        var dtoUserMessage = new ChatWithAiMessageDto
        {
            UserId = userId,
            Role = "user",
            Content = prompt,
        };

        await _historyService.InsertMessageAsync(dtoUserMessage);

        cancellationToken.ThrowIfCancellationRequested();

        var dtoAiMessage = new ChatWithAiMessageDto
        {
            UserId = userId,
            Role = "assistant",
            Content = iaResponse
        };

        await _historyService.InsertMessageAsync(dtoAiMessage);

        return iaResponse;
    }
}