using System.Text.Json.Serialization;

namespace MagicApp.Models.Dtos;

public enum MsgType
{
    Connection,             // Conexión con el WebSocket
    GlobalChat,             // Mensaje del chat global
    PrivateChat,            // Mensaje del chat privado
    UserBanned,             // Usuario baneado
    ForumNotification,      // Notificación del foro
    ChatNotification        // Notificación de chat
}

public class WebSocketMessage
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MsgType Type { get; set; }

    public object Content { get; set; }
}