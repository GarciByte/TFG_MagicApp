using MagicApp.Models.Database.Entities;
using MagicApp.Models.Database.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace MagicApp.Models.Database.Repositories;
public class DeckRepository : Repository<Deck, int>
{
    public DeckRepository(MagicAppContext context) : base(context) { }

    //Obtener deck mediante Id
    public async Task<Deck> GetDeckById(int id)
    {
        return await GetQueryable()
            .FirstOrDefaultAsync(deck => deck.Id == id);
    }

    //Obtener todas las deck de un usuario
    public async Task<List<Deck>> GetAllUserDecksAsync(int Id)
    {
        return await GetQueryable()
            .Where(deck => deck.UserId == Id)
            .ToListAsync();
    }

    //Crear deck
    public async Task<Deck> InsertDeckAsync(Deck newDeck)
    {
        await InsertAsync(newDeck);
        return newDeck;
    }

    //Editar deck
    public async Task<Deck> UpdateDeckAsync(Deck deck)
    {
        await Update(deck);
        return deck;
    }

    //Eliminar deck
    public async Task<Deck> DeleteDeckAsync (Deck deck)
    {
        await Delete(deck);
        return deck;
    }
}
