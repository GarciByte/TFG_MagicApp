using System.Text.Json.Serialization;

namespace MagicApp.Models.Dtos;

public enum MsgType
{
    Connection,             // Conexión con el WebSocket
    GlobalChat              // Mensaje del chat global
}

public class WebSocketMessage
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MsgType Type { get; set; }

    public object Content { get; set; }
}