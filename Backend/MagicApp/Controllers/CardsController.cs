using MagicApp.Services.Scryfall;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MagicApp.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class CardsController : ControllerBase
{
    private readonly ScryfallService _scryfall;

    public CardsController(ScryfallService scryfall)
    {
        _scryfall = scryfall;
    }

    // Busca cartas por nombre
    [HttpGet("search")]
    public async Task<IActionResult> GetImages([FromQuery] string name)
    {
        var images = await _scryfall.SearchCardImagesAsync(name);
        return Ok(images);
    }

    // Obtener datos de una carta por ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var card = await _scryfall.GetCardByIdAsync(id);
        if (card == null)
            return NotFound();
        return Ok(card);
    }

}