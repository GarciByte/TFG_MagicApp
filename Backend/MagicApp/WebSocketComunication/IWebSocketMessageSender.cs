using MagicApp.Models.Dtos;

namespace MagicApp.WebSocketComunication;

public interface IWebSocketMessageSender
{
    // Enviar un mensaje a un usuario en específico
    Task SendToUserAsync(int userId, WebSocketMessage message);

    // Enviar un mensaje a todos los usuarios
    Task SendToAllAsync(WebSocketMessage message);
}