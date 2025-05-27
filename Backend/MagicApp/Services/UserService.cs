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
    private readonly string IMAGES_FOLDER = "avatars/";

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

    // Obtener usuario por id (Sin DTO)
    public async Task<User> GetUserByIdAsyncNoDto(int id)
    {
        var user = await _unitOfWork.UserRepository.GetUserById(id);

        if (user == null)
        {
            return null;
        }

        return user;
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
            AvatarUrl = $"{IMAGES_FOLDER}{model.AvatarName}.jpg",
            IsBanned = false
        };

        await _unitOfWork.UserRepository.InsertUserAsync(newUser);
        await _unitOfWork.SaveAsync();

        return newUser;
    }

    // Modificar los datos del usuario
    public async Task ModifyUserAsync(ModifyUserDto modifyUserDto)
    {
        // Obtener usuario
        var existingUser = await _unitOfWork.UserRepository.GetUserById(modifyUserDto.UserId);
        if (existingUser == null)
        {
            throw new InvalidOperationException("Usuario no encontrado");
        }

        // Actualizar los datos
        if (!string.IsNullOrEmpty(modifyUserDto.Nickname) && existingUser.Nickname != modifyUserDto.Nickname)
        {
            // Verifica si ya existe un usuario con el mismo nickname
            var existingUserNickname = await GetUserByNicknameAsync(modifyUserDto.Nickname);
            if (existingUserNickname != null)
            {
                throw new InvalidOperationException("El nickname ya está en uso");
            }

            existingUser.Nickname = modifyUserDto.Nickname;
        }

        if (!string.IsNullOrEmpty(modifyUserDto.Email) && existingUser.Email != modifyUserDto.Email)
        {
            // Verifica si ya existe un usuario con el mismo correo
            var existingUserEmail = await GetUserByEmailAsync(modifyUserDto.Email);
            if (existingUserEmail != null)
            {
                throw new InvalidOperationException("El correo electrónico ya está en uso");
            }

            existingUser.Email = modifyUserDto.Email;
        }

        // Avatar
        existingUser.AvatarUrl = $"{IMAGES_FOLDER}{modifyUserDto.AvatarName}.jpg";

        await UpdateUser(existingUser);
        await _unitOfWork.SaveAsync();
    }

    // Modificar el rol del usuario
    public async Task ModifyUserRoleAsync(int userId, string newRole)
    {
        // Obtener usuario
        var existingUser = await _unitOfWork.UserRepository.GetUserById(userId);
        if (existingUser == null)
        {
            throw new InvalidOperationException("Usuario no encontrado");
        }

        // Actualizar el rol
        if (!string.IsNullOrEmpty(newRole))
        {
            existingUser.Role = newRole;
        }

        await UpdateUser(existingUser);
        await _unitOfWork.SaveAsync();
    }

    // Modificar la prohibición de un usuario
    public async Task ModifyUserBanAsync(int userId, bool isBanned)
    {
        // Obtener usuario
        var existingUser = await _unitOfWork.UserRepository.GetUserById(userId);
        if (existingUser == null)
        {
            throw new InvalidOperationException("Usuario no encontrado");
        }

        // Actualizar la prohibición
        if (isBanned)
        {
            existingUser.IsBanned = true;
        }
        else
        {
            existingUser.IsBanned = false;
        }

        await UpdateUser(existingUser);
        await _unitOfWork.SaveAsync();
    }

    // Modificar contraseña del usuario
    public async Task ModifyPasswordAsync(int userId, string newPassword)
    {
        // Obtener usuario
        var existingUser = await _unitOfWork.UserRepository.GetUserById(userId);
        if (existingUser == null)
        {
            throw new InvalidOperationException("Usuario no encontrado");
        }

        if (!string.IsNullOrEmpty(newPassword) && existingUser.Password != PasswordHelper.Hash(newPassword))
        {
            existingUser.Password = PasswordHelper.Hash(newPassword);
        }
        else
        {
            throw new InvalidOperationException("La contraseña es nula o similar a la anterior");
        }

        await UpdateUser(existingUser);
        await _unitOfWork.SaveAsync();
    }

    // Actualizar los datos del usuario
    public async Task UpdateUser(User user)
    {
        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveAsync();
    }
}