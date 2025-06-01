using MagicApp.Models.Database.Entities;
using MagicApp.Models.Dtos;

namespace MagicApp.Models.Mappers;

public class UserMapper
{
    public UserDto UserToDto(User user)
    {
        return new UserDto
        {
            UserId = user.Id,
            Nickname = user.Nickname,
            Email = user.Email,
            Role = user.Role,
            AvatarUrl = user.AvatarUrl,
            IsBanned = user.IsBanned,
        };
    }

    public UserProfileDto UserProfileToDto(User user)
    {
        return new UserProfileDto
        {
            UserId = user.Id,
            Nickname = user.Nickname,
            Email = user.Email,
            Role = user.Role,
            AvatarUrl = user.AvatarUrl,
            IsBanned = user.IsBanned,
            Password = user.Password,
        };
    }

    public IEnumerable<UserDto> UsersToDto(IEnumerable<User> users)
    {
        return users.Select(user => UserToDto(user));
    }
}