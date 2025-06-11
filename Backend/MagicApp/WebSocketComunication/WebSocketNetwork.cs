using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Models.Dtos.Forum;
using MagicApp.Models.Dtos.IA;
using MagicApp.Services;
using MagicApp.Services.IA;
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
    private readonly SemaphoreSlim _aiSemaphore = new SemaphoreSlim(5);

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

                // Usuario baneado
                case MsgType.UserBanned:
                    await HandleUserBanAsync(message);
                    break;

                // Notificación del foro
                case MsgType.ForumNotification:
                    await HandleForumNotificationAsync(handler, message);
                    break;

                // Notificación de chat
                case MsgType.ChatNotification:
                    await HandleChatNotificationAsync(message);
                    break;

                // Mensaje del chat con la IA
                case MsgType.ChatWithAI:
                    await HandleChatWithAiAsync(handler, message);
                    break;

                // Comentar una carta con la IA
                case MsgType.CardDetailsWithAI:
                    await HandleCardDetailsWithAiAsync(handler, message);
                    break;

                // Cancelar petición hacia la IA
                case MsgType.CancelAIMessage:
                    handler.CancelAiRequest();
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

    // Notificar la prohibición de un usuario
    private async Task HandleUserBanAsync(WebSocketMessage message)
    {
        try
        {
            string jsonContent = message.Content.ToString();
            int userId = JsonSerializer.Deserialize<int>(jsonContent);

            _logger.LogInformation("Se ha baneado al usuaio con ID: {userId}", userId);

            await SendToUserAsync(userId, new WebSocketMessage
            {
                Type = MsgType.UserBanned,
                Content = "UserBanned"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al deserializar userId: {ex.Message}", ex.Message);
        }
    }

    // Obtiene los usuarios que están conectados
    public async Task<List<int>> GetConnectedUserIdsAsync()
    {
        await _semaphore.WaitAsync();
        try
        {
            return _userConnections.Keys.ToList();
        }
        finally
        {
            _semaphore.Release();
        }
    }

    // Obtener todos los hilos a los que está suscrito un usuario
    public async Task<List<ForumThreadDto>> GetSubscribedThreadsAsync(int userId)
    {
        using var scope = _serviceProvider.CreateScope();
        var forumService = scope.ServiceProvider.GetRequiredService<ForumService>();
        var threads = await forumService.GetSubscribedThreadsAsync(userId);

        return threads;
    }

    // Notificar un nuevo mensaje del hilo al que está suscrito el usuario
    private async Task HandleForumNotificationAsync(WebSocketHandler handler, WebSocketMessage message)
    {
        try
        {
            string jsonContent = message.Content.ToString();
            int threadId = JsonSerializer.Deserialize<int>(jsonContent);
            int authorId = handler.Id;

            _logger.LogInformation("Se va a recibir una notificación del hilo: {threadId}", threadId);

            var connectedUserIds = await GetConnectedUserIdsAsync();

            foreach (var userId in connectedUserIds)
            {
                if (userId == authorId)
                    continue;

                var subscribedThreads = await GetSubscribedThreadsAsync(userId);
                var thread = subscribedThreads.FirstOrDefault(t => t.Id == threadId);

                if (thread != null)
                {
                    var notification = new WebSocketMessage
                    {
                        Type = MsgType.ForumNotification,
                        Content = thread.Title
                    };

                    await SendToUserAsync(userId, notification);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al deserializar threadId: {ex.Message}", ex.Message);
        }
    }

    // Notificar de un nuevo mensaje de chat
    private async Task HandleChatNotificationAsync(WebSocketMessage message)
    {
        try
        {
            string jsonContent = message.Content.ToString();
            ChatMessage ChatMessage = JsonSerializer.Deserialize<ChatMessage>(jsonContent);

            _logger.LogInformation("El usuario {ChatMessage.ReceiverNickname} va a recibir una notificación de chat de " +
                "{ChatMessage.ReceiverNickname}", ChatMessage.ReceiverNickname, ChatMessage.SenderNickname);

            await SendToUserAsync(ChatMessage.ReceiverId, new WebSocketMessage
            {
                Type = MsgType.ChatNotification,
                Content = ChatMessage
            });
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al deserializar userId: {ex.Message}", ex.Message);
        }
    }

    // Manejar mensajes del chat con la IA
    private async Task HandleChatWithAiAsync(WebSocketHandler handler, WebSocketMessage message)
    {
        await _aiSemaphore.WaitAsync();
        try
        {
            string jsonContent = message.Content.ToString();
            ChatWithAiRequestDto requestDto = JsonSerializer.Deserialize<ChatWithAiRequestDto>(jsonContent);

            if (requestDto != null)
            {
                _logger.LogInformation("El usuario {handler.User.Nickname} le ha escrito un mensaje a la IA: " +
                    "{requestDto.Prompt}", handler.User.Nickname, requestDto.Prompt);

                handler.StartAiRequest();

                string iaResponse = await ProcessUserPromptAsync(requestDto.UserId, requestDto.Prompt, handler.CurrentAiToken);

                _logger.LogInformation("La IA le ha respondido a {handler.User.Nickname} con: " +
                    "{@iaResponse}", handler.User.Nickname, iaResponse);

                var responseDto = new ChatWithAiResponseDto
                {
                    UserId = requestDto.UserId,
                    Response = iaResponse
                };

                var newMessage = new WebSocketMessage
                {
                    Type = MsgType.ChatWithAI,
                    Content = responseDto
                };

                await SendToUserAsync(handler.User.UserId, newMessage);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Petición cancelada");
        }
        catch (Exception ex)
        {
            _logger.LogError("Error en el chat con la IA: {ex.Message}", ex.Message);

            var errorDto = new ChatWithAiResponseDto
            {
                UserId = handler.User.UserId,
                Response = "Ha ocurrido un error al procesar tu solicitud."
            };

            await SendToUserAsync(handler.User.UserId, new WebSocketMessage
            {
                Type = MsgType.ChatWithAI,
                Content = errorDto
            });
        }
        finally
        {
            _aiSemaphore.Release();
        }
    }

    // Obtiene el mensaje de respuesta de la IA (chat)
    private async Task<string> ProcessUserPromptAsync(int userId, string prompt, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var chatService = scope.ServiceProvider.GetRequiredService<ChatWithAiService>();
        return await chatService.ProcessPromptAsync(userId, prompt, cancellationToken);
    }

    // Comentar una carta con la IA
    private async Task HandleCardDetailsWithAiAsync(WebSocketHandler handler, WebSocketMessage message)
    {
        await _aiSemaphore.WaitAsync();
        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            string jsonContent = message.Content.ToString();
            CardDetailDto cardDto = JsonSerializer.Deserialize<CardDetailDto>(jsonContent, options);

            if (cardDto != null)
            {
                _logger.LogInformation("El usuario {handler.User.Nickname} quiere que la IA comente la carta: {cardDto.Name}",
                    handler.User.Nickname, cardDto.Name);

                handler.StartAiRequest();

                string iaResponse = await ProcessCardDetailPromptAsync(handler.User.UserId, cardDto, handler.CurrentAiToken);

                _logger.LogInformation("La IA le ha respondido a {handler.User.Nickname} con: {@iaResponse}",
                    handler.User.Nickname, iaResponse);

                var responseDto = new ChatWithAiResponseDto
                {
                    UserId = handler.User.UserId,
                    Response = iaResponse
                };

                var newMessage = new WebSocketMessage
                {
                    Type = MsgType.CardDetailsWithAI,
                    Content = responseDto
                };

                await SendToUserAsync(handler.User.UserId, newMessage);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Petición cancelada");
        }
        catch (Exception ex)
        {
            _logger.LogError("Error obteniendo detalles de una carta con la IA: {ex.Message}", ex.Message);

            var errorDto = new ChatWithAiResponseDto
            {
                UserId = handler.User.UserId,
                Response = "Ha ocurrido un error al procesar tu solicitud."
            };

            await SendToUserAsync(handler.User.UserId, new WebSocketMessage
            {
                Type = MsgType.CardDetailsWithAI,
                Content = errorDto
            });
        }
        finally
        {
            _aiSemaphore.Release();
        }
    }

    // Obtiene el mensaje de respuesta de la IA (detalles de una carta)
    private async Task<string> ProcessCardDetailPromptAsync(int userId, CardDetailDto cardDto, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var chatService = scope.ServiceProvider.GetRequiredService<ChatWithAiService>();
        return await chatService.CommentCardAsync(userId, cardDto, cancellationToken);
    }

}