using System.Collections;
using GameBacklog.API.Data;
using GameBacklog.API.Dtos;
using GameBacklog.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
  private readonly AppDbContext _context;
  private readonly IUserContextService _userService;

  public ProfileController(AppDbContext context, IUserContextService userService)
  {
    _context = context;
    _userService = userService;
  }

  [HttpGet]
  public async Task<ActionResult<ProfileDto>> GetProfile()
  {
    var user = await _userService.GetCurrentUserAsync();

    return Ok(new ProfileDto(
      user.Name,
      user.Email,
      user.FavGame1IgdbID.HasValue ? new FavoriteGameDto(user.FavGame1IgdbID.Value, user.FavGame1Title, user.FavGame1CoverUrl) : null,
      user.FavGame2IgdbID.HasValue ? new FavoriteGameDto(user.FavGame2IgdbID.Value, user.FavGame2Title, user.FavGame2CoverUrl) : null,
      user.FavGame3IgdbID.HasValue ? new FavoriteGameDto(user.FavGame3IgdbID.Value, user.FavGame3Title, user.FavGame3CoverUrl) : null,
      user.FavGame4IgdbID.HasValue ? new FavoriteGameDto(user.FavGame4IgdbID.Value, user.FavGame4Title, user.FavGame4CoverUrl) : null
    ));
  }

  [HttpPut("favorites/{slot}")]
  public async Task<ActionResult> UpdateFavoriteSlot(int slot, [FromBody] UpdateFavoriteDto dto)
  {
    if (slot < 1 || slot > 4) return BadRequest("Slot must be between 1 and 4.");

    var user = await _userService.GetCurrentUserAsync();

    switch (slot)
    {
      case 1:
            user.FavGame1IgdbID = dto.IgdbGameId;
            user.FavGame1Title = dto.Title;
            user.FavGame1CoverUrl = dto.CoverUrl;
            break;
        case 2:
            user.FavGame2IgdbID = dto.IgdbGameId;
            user.FavGame2Title = dto.Title;
            user.FavGame2CoverUrl = dto.CoverUrl;
            break;
        case 3:
            user.FavGame3IgdbID = dto.IgdbGameId;
            user.FavGame3Title = dto.Title;
            user.FavGame3CoverUrl = dto.CoverUrl;
            break;
        case 4:
            user.FavGame4IgdbID = dto.IgdbGameId;
            user.FavGame4Title = dto.Title;
            user.FavGame4CoverUrl = dto.CoverUrl;
            break;
    }
    await _context.SaveChangesAsync();
    return NoContent();
  }
}
