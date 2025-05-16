using MagicApp.Models.Dtos;
using MagicApp.Services;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text.Json;

namespace MagicApp.WebSocketComunication;

public class WebSocketNetwork : IWebSocketMessageSender
{
    private readonly ILogger<WebSocketNetwork> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly ConcurrentDictionary<int, List<WebSocketHandler>> _userConnections = new ConcurrentDictionary<int, List<WebSocketHandler>>();
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public WebSocketNetwork(ILogger<WebSocketNetwork> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task HandleAsync(WebSocket webSocket, UserDto user)
    {
        _logger.LogInformation("Conexión WebSocket establecida con {user.Nickname}", user.Nickname);

        // Creamos un nuevo WebSocketHandler a partir del WebSocket recibido y lo añadimos a la lista
        WebSocketHandler handler = await AddWebSocketAsync(webSocket, user);

        if (handler != null)
        {
            // Mensaje de conexión exitosa
            await handler.SendAsync(new WebSocketMessage
            {
                Type = MsgType.Connection,
                Content = "Conexión establecida con éxito."
            });

            // Esperamos a que el WebSocketHandler termine de manejar la conexión
            await handler.HandleAsync();
        }
    }

    private async Task<WebSocketHandler> AddWebSocketAsync(WebSocket webSocket, UserDto user)
    {
        // Esperamos a que haya un hueco disponible
        await _semaphore.WaitAsync();
        try
        {
            // Creamos un nuevo WebSocketHandler, nos suscribimos a sus eventos y lo añadimos a la lista
            var handler = new WebSocketHandler(user.UserId, webSocket, user, _logger);

            handler.Disconnected += OnDisconnectedAsync;
            handler.MessageReceived += OnMessageReceivedAsync;

            var list = _userConnections.GetOrAdd(user.UserId, _ => new List<WebSocketHandler>());
            list.Add(handler);

            return handler;
        }
        finally
        {
            // Liberamos el semáforo
            _semaphore.Release();
        }
    }

    // Enviar un mensaje a un usuario en concreto
    public async Task SendToUserAsync(int userId, WebSocketMessage message)
    {
        await _semaphore.WaitAsync();
        try
        {
            if (_userConnections.TryGetValue(userId, out var list))
            {
                foreach (var handler in list.ToList())
                {
                    if (handler.IsOpen)
                    {
                        await handler.SendAsync(message);
                    }
                }
            }
        }
        finally
        {
            _semaphore.Release();
        }
    }

    // Enviar un mensaje a todos los usuarios
    public async Task SendToAllAsync(WebSocketMessage message)
    {
        await _semaphore.WaitAsync();
        try
        {
            foreach (var user in _userConnections)
            {
                foreach (var handler in user.Value.ToList())
                {
                    if (handler.IsOpen)
                    {
                        await handler.SendAsync(message);
                    }
                }
            }
        }
        finally
        {
            _semaphore.Release();
        }
    }

    // Desconexión de un usuario
    private async Task OnDisconnectedAsync(WebSocketHandler handler)
    {
        _logger.LogInformation("Iniciando desconexión de {handler.User.Nickname}", handler.User.Nickname);

        await _semaphore.WaitAsync();
        try
        {
            // Eliminamos el WebSocketHandler de la lista
            if (_userConnections.TryGetValue(handler.Id, out var list))
            {
                list.Remove(handler);

                if (list.Count == 0)
                    _userConnections.TryRemove(handler.Id, out _);
            }
        }
        finally
        {
            handler.Dispose();
            _semaphore.Release();
            _logger.LogInformation("Desconexión completada");
        }
    }

    // Mensajes recibidos por los usuarios
    private async Task OnMessageReceivedAsync(WebSocketHandler handler, WebSocketMessage message)
    {
        try
        {
            switch (message.Type)
            {
                // Mensaje del chat global
                case MsgType.GlobalChat:
                    await HandleGlobalChatMessageAsync(message);
                    break;

                // Mensaje del chat privado
                case MsgType.PrivateChat:
                    await HandleChatMessageAsync(message);
                    break;

                default:
                    _logger.LogError("Mensaje no manejado: {message.Type}", message.Type);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error procesando mensaje: {ex.Message}", ex.Message);
        }
    }

    // Manejar mensajes del chat global
    private async Task HandleGlobalChatMessageAsync(WebSocketMessage message)
    {
        try
        {
            string jsonContent = message.Content.ToString();
            GlobalChatMessageDto chatMessage = JsonSerializer.Deserialize<GlobalChatMessageDto>(jsonContent);

            _logger.LogInformation("Mensaje de chat global recibido de {chatMessage.Nickname}: {chatMessage.Content}", chatMessage.Nickname, chatMessage.Content);

            var chatMessageUpdated = await InsertGlobalMessageAsync(chatMessage);

            var chatResponse = new WebSocketMessage
            {
                Type = MsgType.GlobalChat,
                Content = chatMessageUpdated
            };

            await SendToAllAsync(chatResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al deserializar chatMessage: {ex.Message}", ex.Message);
        }
    }

    // Manejar mensajes del chat privado
    private async Task HandleChatMessageAsync(WebSocketMessage message)
    {
        try
        {
            string jsonContent = message.Content.ToString();
            ChatMessageDto chatMessage = JsonSerializer.Deserialize<ChatMessageDto>(jsonContent);

            _logger.LogInformation("Mensaje de chat privado recibido de {chatMessage.SenderNickname} para {chatMessage.ReceiverNickname}: {chatMessage.Content}",
                chatMessage.SenderNickname, chatMessage.ReceiverNickname, chatMessage.Content);

            var chatMessageUpdated = await InsertMessageAsync(chatMessage);

            var chatResponse = new WebSocketMessage
            {
                Type = MsgType.PrivateChat,
                Content = chatMessageUpdated
            };

            await SendToUserAsync(chatMessage.SenderId, chatResponse);
            await SendToUserAsync(chatMessage.ReceiverId, chatResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al deserializar chatMessage: {ex.Message}", ex.Message);
        }
    }

    // Guardar un nuevo mensaje del chat global
    public async Task<GlobalChatMessageDto> InsertGlobalMessageAsync(GlobalChatMessageDto globalChatMessageDto)
    {
        using var scope = _serviceProvider.CreateScope();
        var globalChatMessageService = scope.ServiceProvider.GetRequiredService<GlobalChatMessageService>();
        var message = await globalChatMessageService.InsertGlobalMessageAsync(globalChatMessageDto);

        return message;
    }

    // Guardar un nuevo mensaje del chat privado
    public async Task<ChatMessageDto> InsertMessageAsync(ChatMessageDto chatMessageDto)
    {
        using var scope = _serviceProvider.CreateScope();
        var chatMessageService = scope.ServiceProvider.GetRequiredService<ChatMessageService>();
        var message = await chatMessageService.InsertMessageAsync(chatMessageDto);

        return message;
    }

}