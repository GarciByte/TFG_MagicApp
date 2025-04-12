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
            IsBanned = user.IsBanned,
        };
    }

    public IEnumerable<UserDto> UsersToDto(IEnumerable<User> users)
    {
        return users.Select(user => UserToDto(user));
    }
}