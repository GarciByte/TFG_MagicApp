namespace MagicApp.WebSocketComunication;

public class WebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<WebSocketMiddleware> _logger;

    public WebSocketMiddleware(RequestDelegate next, ILogger<WebSocketMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/socket"))
        {
            // Obtiene el token
            var token = context.Request.Query["token"].ToString();

            if (!string.IsNullOrWhiteSpace(token))
            {
                // Se agrega al encabezado de autorización
                context.Request.Headers["Authorization"] = $"Bearer {token}";

                // Convertir el método a GET
                context.Request.Method = HttpMethods.Get;

                _logger.LogInformation("Token obtenido de la petición WebSocket: {token}", token);
            }
            else
            {
                _logger.LogError("No se ha podido obtener el token de la petición");
            }
        }

        await _next(context);
    }
}