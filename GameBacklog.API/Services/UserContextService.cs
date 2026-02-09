using System.Security.Claims;
using GameBacklog.API.Data; // Onde está o AppDbContext
using GameBacklog.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.API.Services;

public interface IUserContextService
{
    Task<User> GetCurrentUserAsync();
}

public class UserContextService : IUserContextService
{
    private readonly AppDbContext _context; 
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context; 
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<User> GetCurrentUserAsync()
    {
        var userPrincipal = _httpContextAccessor.HttpContext?.User;

        var clerkId = userPrincipal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var email = userPrincipal?.FindFirst(ClaimTypes.Email)?.Value 
                 ?? userPrincipal?.FindFirst("email")?.Value;

        var name = userPrincipal?.FindFirst(ClaimTypes.Name)?.Value
                 ?? userPrincipal?.FindFirst("name")?.Value
                 ?? userPrincipal?.FindFirst("given_name")?.Value
                 ?? userPrincipal?.FindFirst("preferred_username")?.Value
                 ?? userPrincipal?.FindFirst("username")?.Value
                 ?? email?.Split('@')[0];

        if (string.IsNullOrEmpty(clerkId))
        {
            throw new UnauthorizedAccessException("Usuário não autenticado. Token Clerk inválido ou ausente.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.ClerkId == clerkId);

        if (user == null)
        {
            user = new User
            {
                ClerkId = clerkId,
                Email = email ?? $"user_{clerkId.Substring(0, 8)}@gamebacklog.com",
                Name = string.IsNullOrWhiteSpace(name) ? "Player" : name,

            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(name) && (string.IsNullOrWhiteSpace(user.Name) || user.Name == "Player"))
            {
                user.Name = name;
                await _context.SaveChangesAsync();
            }
        }

        return user;
    }
}
