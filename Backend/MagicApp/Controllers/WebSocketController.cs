﻿using MagicApp.Models.Dtos;
using MagicApp.Services;
using MagicApp.WebSocketComunication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;

namespace MagicApp.Controllers;

[Authorize]
[Route("socket")]
[ApiController]
public class WebSocketController : ControllerBase
{
    private readonly WebSocketNetwork _websocketNetwork;
    private readonly UserService _userService;
    private readonly ILogger<WebSocketController> _logger;

    public WebSocketController(WebSocketNetwork websocketNetwork, UserService userService, ILogger<WebSocketController> logger)
    {
        _websocketNetwork = websocketNetwork;
        _userService = userService;
        _logger = logger;
    }

    [HttpGet]
    public async Task ConnectAsync()
    {
        // Si la petición es de tipo websocket la aceptamos
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            // Obtener usuario desde el Token
            UserDto user = await ReadToken();

            if (user == null)
            {
                _logger.LogError("Error al obtener el usuario desde el token");
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }

            // Aceptamos la solicitud
            WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();

            // Manejamos la solicitud.
            await _websocketNetwork.HandleAsync(webSocket, user);
        }
        // En caso contrario la rechazamos
        else
        {
            _logger.LogError("Se ha recibido una petición que no es de tipo WebSocket");
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }

        // Cuando este método finalice, se cerrará automáticamente la conexión con el websocket
    }

    // Leer datos del token
    private async Task<UserDto> ReadToken()
    {
        try
        {
            string id = User.Claims.FirstOrDefault().Value;
            UserDto user = await _userService.GetUserByIdAsync(Int32.Parse(id, null));
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error al leer el token: {ex}", ex);
            return null;
        }
    }
}