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
    public async Task<List<Deck>> GetAllUserDecksAsync(int userId)
    {
        return await _unitOfWork.DeckRepository.GetAllUserDecksAsync(userId);
    }

    //Crear deck
    public async Task<Deck> CreateDeckAsync(DeckDto model)
    {
        var user = await _unitOfWork.UserRepository.GetUserById(model.UserId);
        if (user == null)
            throw new Exception($"User with id {model.UserId} not found.");

        var newDeck = new Deck
        {
            Name = model.Name,
            Description = model.Description,
            UserId = model.UserId,
            Victories = 0,
            Defeats = 0,
            DeckCards = model.DeckCards
               .Select(dc => new DeckCard { CardId = dc.CardId })
               .ToList()
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

