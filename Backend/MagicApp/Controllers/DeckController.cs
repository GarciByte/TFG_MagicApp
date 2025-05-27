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
    [HttpPost("GetDeckById")]
    public async Task<Deck> GetDeckById([FromForm] int id)
    { 
        return await _deckService.GetDeckAsync(id);
    }

    //Obtener decks de un usuario
    [HttpPost("GetAllUserDecks")]
    public async Task<List<Deck>> GetAllUserDecksAsync([FromForm] User user)
    {
        return await _deckService.GetAllUserDecksAsync(user.Id);
    }

    //Crear deck
    [HttpPost("CreateDeck")]
    public async Task<ActionResult<DeckDto>> CreateDeck([FromForm] DeckDto model)
    {
        await _deckService.CreateDeckAsync(model);

        return Ok("Deck create "+model);
    }

    //Crear deck
    [HttpPost("UpdateDeck")]
    public async Task<ActionResult<DeckDto>> UpdateDeck([FromForm] DeckDto model, int id)
    {
        await _deckService.UpdateDeckAsync(model, id);

        return Ok("Deck updated " + id);
    }

    //Crear deck
    [HttpPost("DeleteDeck")]
    public async Task<ActionResult<DeckDto>> DeleteDeck([FromForm] int id)
    {
        await _deckService.DeleteDeckAsync(id);

        return Ok("Deck deleted " + id);
    }
}
