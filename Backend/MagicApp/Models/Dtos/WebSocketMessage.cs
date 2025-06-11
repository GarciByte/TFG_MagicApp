using System.Text.Json.Serialization;

namespace MagicApp.Models.Dtos;

public enum MsgType
{
    Connection,             // Conexión con el WebSocket
    GlobalChat,             // Mensaje del chat global
    PrivateChat,            // Mensaje del chat privado
    UserBanned,             // Usuario baneado
    ForumNotification,      // Notificación del foro
    ChatNotification,       // Notificación de chat
    ChatWithAI,             // Mensaje del chat con la IA
    CardDetailsWithAI,      // Comentar una carta con la IA
    CancelAIMessage         // Cancelar petición hacia la IA
}

public class WebSocketMessage
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MsgType Type { get; set; }

    public object Content { get; set; }
}