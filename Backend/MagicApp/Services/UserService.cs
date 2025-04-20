using MagicApp.Helpers;
using MagicApp.Models.Database;
using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;
using MagicApp.Models.Mappers;

namespace MagicApp.Services;

public class UserService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly UserMapper _userMapper;

    public UserService(UnitOfWork unitOfWork, UserMapper userMapper)
    {
        _unitOfWork = unitOfWork;
        _userMapper = userMapper;
    }

    // Obtener todos los usuarios
    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _unitOfWork.UserRepository.GetAllUsersAsync();
        return _userMapper.UsersToDto(users).ToList();
    }

    // Obtener usuario por nickname
    public async Task<UserDto> GetUserByNicknameAsync(string nickname)
    {
        var user = await _unitOfWork.UserRepository.GetUserByNickname(nickname);

        if (user == null)
        {
            return null;
        }

        return _userMapper.UserToDto(user);
    }

    // Obtener usuario por email
    public async Task<UserDto> GetUserByEmailAsync(string email)
    {
        var user = await _unitOfWork.UserRepository.GetUserByEmail(email);
        if (user == null)
        {
            return null;
        }
        return _userMapper.UserToDto(user);
    }

    // Obtener usuario por id
    public async Task<UserDto> GetUserByIdAsync(int id)
    {
        var user = await _unitOfWork.UserRepository.GetUserById(id);

        if (user == null)
        {
            return null;
        }

        return _userMapper.UserToDto(user);
    }

    // Login
    public async Task<User> LoginAsync(string nickname, string password)
    {
        User user = null;

        if (!string.IsNullOrEmpty(nickname))
        {
            user = await _unitOfWork.UserRepository.GetUserByNickname(nickname);
        }

        if (user == null || user.Password != PasswordHelper.Hash(password))
        {
            return null;
        }

        return user;
    }

    // Registro
    public async Task<User> RegisterAsync(RegisterDto model)
    {
        const string IMAGES_FOLDER = "avatars/";

        // Verifica si el Email o el Nickname ya están en uso
        var existingUserEmail = await GetUserByEmailAsync(model.Email);
        var existingUserNickname = await GetUserByNicknameAsync(model.Nickname);

        if (existingUserEmail != null || existingUserNickname != null)
        {
            throw new Exception("Email o Nickname en uso.");
        }

        var newUser = new User
        {
            Nickname = model.Nickname,
            Email = model.Email,
            Password = PasswordHelper.Hash(model.Password),
            Role = "User", // Rol por defecto
            AvatarUrl = $"{IMAGES_FOLDER}{model.AvatarName}",
            IsBanned = false
        };

        await _unitOfWork.UserRepository.InsertUserAsync(newUser);
        await _unitOfWork.SaveAsync();

        return newUser;
    }
}