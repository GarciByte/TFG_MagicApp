using MagicApp.Models.Dtos;
using System.Net.WebSockets;
using System.Text.Json;

namespace MagicApp.WebSocketComunication;

public class WebSocketNetwork : IWebSocketMessageSender
{
    private readonly ILogger<WebSocketNetwork> _logger;

    // Lista de WebSocketHandler (clase que gestiona cada WebSocket)
    private readonly List<WebSocketHandler> _handlers = new List<WebSocketHandler>();

    // Semáforo para controlar el acceso a la lista de WebSocketHandler
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public WebSocketNetwork(ILogger<WebSocketNetwork> logger)
    {
        _logger = logger;
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
            var existingHandler = _handlers.FirstOrDefault(h => h.Id == user.UserId);
            if (existingHandler == null)
            {
                // Creamos un nuevo WebSocketHandler, nos suscribimos a sus eventos y lo añadimos a la lista
                WebSocketHandler handler = new(user.UserId, webSocket, user, _logger);
                handler.Disconnected += OnDisconnectedAsync;
                handler.MessageReceived += OnMessageReceivedAsync;
                _handlers.Add(handler);

                return handler;
            }
            else
            {
                _logger.LogError("El usuario ya tiene una conexión activa");
                return null;
            }
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
            var handler = _handlers.FirstOrDefault(h => h.Id == userId);
            if (handler != null && handler.IsOpen)
            {
                await handler.SendAsync(message);
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
            var tasks = _handlers
                .Where(handler => handler.IsOpen)
                .Select(async handler =>
                {
                    try
                    {
                        await handler.SendAsync(message);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError("Error enviando un mensaje a {handler.User.Nickname}: {ex.Message}", handler.User.Nickname, ex.Message);
                    }
                });
            await Task.WhenAll(tasks);
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
            _handlers.Remove(handler);
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

            var chatMessageUpdated = new GlobalChatMessageDto
            {
                UserId = chatMessage.UserId,
                Nickname = chatMessage.Nickname,
                Content = chatMessage.Content
            };

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


}