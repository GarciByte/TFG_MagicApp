using MagicApp.Models.Database;
using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using Microsoft.AspNetCore.Http.HttpResults;

namespace MagicApp.Services;

public class DeckService
{
    private readonly UnitOfWork _unitOfWork;

    public DeckService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    //Obtener deck mediante Id
    public async Task<Deck> GetDeckAsync(int id)
    {
        return await _unitOfWork.DeckRepository.GetDeckById(id);
    }


    //Obtener decks de un usuario
    public async Task<List<Deck>> GetAllUserDecksAsync(int Id)
    {
        return await _unitOfWork.DeckRepository.GetAllUserDecksAsync(Id);
    }

    //Crear deck
    public async Task<Deck> CreateDeckAsync(DeckDto model)
    {
        var newDeck = new Deck()
        {
            Name = model.Name,
            DeckCards = model.DeckCards,
            Description = model.Description,
            UserId = model.UserId,
            User = await _unitOfWork.UserRepository.GetUserById(model.UserId),
        };

        await _unitOfWork.DeckRepository.InsertDeckAsync(newDeck);
        await _unitOfWork.SaveAsync();

        return newDeck;
    }

    //Editar deck
    public async Task<Deck> UpdateDeckAsync(DeckDto model, int id)
    {
        var updatedDeck = await _unitOfWork.DeckRepository.GetDeckById(id);
        updatedDeck.Name = model.Name;
        updatedDeck.Description = model.Description;
        updatedDeck.DeckCards = model.DeckCards;

        await _unitOfWork.DeckRepository.UpdateDeckAsync(updatedDeck);
        await _unitOfWork.SaveAsync();

        return updatedDeck;

    }

    //Eliminar deck
    public async Task<Deck> DeleteDeckAsync(int id)
    {
        var deck = await _unitOfWork.DeckRepository.GetDeckById(id);

        await _unitOfWork.DeckRepository.DeleteDeckAsync(deck);
        await _unitOfWork.SaveAsync();

        return deck;

    }
}

