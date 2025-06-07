using MagicApp.Models.Dtos;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace MagicApp.WebSocketComunication;

public class WebSocketHandler : IDisposable
{
    private const int BUFFER_SIZE = 4096;
    private readonly WebSocket _webSocket;
    private readonly byte[] _buffer;
    private readonly ILogger<WebSocketNetwork> _logger;
    private readonly CancellationTokenSource _cancellationTokenSource = new();

    public CancellationToken CancellationToken => _cancellationTokenSource.Token;

    public UserDto User { get; private set; }

    public int Id { get; init; }

    public bool IsOpen => _webSocket.State == WebSocketState.Open;

    // Eventos para notificar cuando se recibe un mensaje o se desconecta un usuario
    public event Func<WebSocketHandler, WebSocketMessage, Task> MessageReceived;
    public event Func<WebSocketHandler, Task> Disconnected;

    public WebSocketHandler(int id, WebSocket webSocket, UserDto user, ILogger<WebSocketNetwork> logger)
    {
        Id = id;
        _webSocket = webSocket;
        _buffer = new byte[BUFFER_SIZE];
        User = user;
        _logger = logger;
    }

    public async Task HandleAsync()
    {
        try
        {
            // Mientras que el websocket esté conectado
            while (IsOpen)
            {
                // Leemos el mensaje
                WebSocketMessage message = await ReadAsync();

                // Si hay mensaje y hay suscriptores al evento MessageReceived, gestionamos el evento
                if (message != null && MessageReceived != null)
                {
                    if (message.Type == MsgType.ChatWithAI)
                    {
                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                await MessageReceived.Invoke(this, message);
                            }
                            catch (OperationCanceledException)
                            {
                                _logger.LogInformation("Operación cancelada para usuario {User.Nickname}", User.Nickname);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError("Error inesperado: {ex.Message}", ex.Message);
                            }
                        });
                    }
                    else
                    {
                        await MessageReceived.Invoke(this, message);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error en la conexión WebSocket de {User.Nickname}: {ex.Message}", User.Nickname, ex.Message);
        }
        finally
        {
            // Si hay suscriptores al evento Disconnected, gestionamos el evento
            if (Disconnected != null)
            {
                await Disconnected.Invoke(this);
            }

            // Cancelamos cualquier operación en curso para este handler
            _cancellationTokenSource.Cancel();
            _cancellationTokenSource.Dispose();
        }
    }

    private async Task<WebSocketMessage> ReadAsync()
    {
        // Creamos un MemoryStream para almacenar el contenido del mensaje
        using MemoryStream textStream = new MemoryStream();
        WebSocketReceiveResult receiveResult;

        do
        {
            // Recibimos el mensaje
            receiveResult = await _webSocket.ReceiveAsync(_buffer, CancellationToken.None);

            // Si el mensaje es de tipo texto, lo escribimos en el MemoryStream
            if (receiveResult.MessageType == WebSocketMessageType.Text)
            {
                textStream.Write(_buffer, 0, receiveResult.Count);
            }
            // Si el mensaje es de tipo Close, cerramos la conexión
            else if (receiveResult.CloseStatus.HasValue)
            {
                _logger.LogInformation("El usuario {User.Nickname} ha cerrado la conexión", User.Nickname);

                _cancellationTokenSource.Cancel();
                await _webSocket.CloseAsync(receiveResult.CloseStatus.Value, receiveResult.CloseStatusDescription, CancellationToken.None);
                return null;
            }
        }
        while (!receiveResult.EndOfMessage);

        // Decodificamos el mensaje
        string jsonMessage = Encoding.UTF8.GetString(textStream.ToArray());

        _logger.LogInformation("Mensaje recibido de {User.Nickname}: {jsonMessage}", User.Nickname, jsonMessage);

        try
        {
            if (string.IsNullOrEmpty(jsonMessage))
            {
                return null;
            }

            return JsonSerializer.Deserialize<WebSocketMessage>(jsonMessage);

        }
        catch (JsonException ex)
        {
            _logger.LogError("Error al deserializar el mensaje de {User.Nickname}: {ex.Message}", User.Nickname, ex.Message);
            return null;
        }
    }

    public async Task SendAsync(WebSocketMessage message)
    {
        // Si el websocket está abierto, enviamos el mensaje
        if (IsOpen)
        {
            string jsonMessage = JsonSerializer.Serialize(message);

            _logger.LogInformation("Enviando mensaje para {User.Nickname}: {jsonMessage}", User.Nickname, jsonMessage);

            // Convertimos el mensaje a bytes y lo enviamos
            byte[] bytes = Encoding.UTF8.GetBytes(jsonMessage);
            await _webSocket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
        }
        else
        {
            _logger.LogError("No se ha podido enviar a {User.Nickname} el mensaje", User.Nickname);
        }
    }

    // Cerrar el WebSocket
    public void Dispose()
    {
        _webSocket.Dispose();
    }
}