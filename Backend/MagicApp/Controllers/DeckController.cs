using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace MagicApp.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DeckController : ControllerBase
{
    private readonly DeckService _deckService;

    public DeckController(DeckService deckService)
    {
        _deckService = deckService;
    }

    //Obtener deck mediante Id
    [HttpGet("GetDeckById")]
    public async Task<Deck> GetDeckById([FromQuery] int id)
    {
        return await _deckService.GetDeckAsync(id);
    }

    //Obtener todos los decks 
    [HttpGet("GetAllDecks")]
    public async Task<List<Deck>> GetAllDecksAsync()
    {

        return await _deckService.GetAllDecksAsync();
    }

    //Obtener decks de un usuario
    [HttpGet("GetAllUserDecks")]
    public async Task<List<Deck>> GetAllUserDecksAsync([FromQuery] int userId)
    {

        return await _deckService.GetAllUserDecksAsync(userId);
    }

    //Crear deck
    [HttpPost("CreateDeck")]
    public async Task<ActionResult<DeckDto>> CreateDeck([FromBody] DeckDto model)
    {
        var createdDeck = await _deckService.CreateDeckAsync(model);

        if (createdDeck == null)
        {
            return BadRequest(new { success = false, error = "No se pudo crear el deck" });
        }

        return Ok(new { success = true, data = createdDeck });
    }


    //Actualizar deck
    [HttpPost("UpdateDeck")]
    public async Task<ActionResult<DeckDto>> UpdateDeck([FromBody] DeckDto model, [FromQuery] int id)
    {
        await _deckService.UpdateDeckAsync(model, id);

        return Ok("Deck updated " + id);
    }

    //Eliminar deck
    [HttpGet("DeleteDeck")]
    public async Task<ActionResult<DeckDto>> DeleteDeck([FromQuery] int id)
    {
        await _deckService.DeleteDeckAsync(id);

        return Ok("Deck deleted " + id);
    }
}
