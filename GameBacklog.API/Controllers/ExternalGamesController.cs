using GameBacklog.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameBacklog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ExternalGamesController : ControllerBase
{
    private readonly IIgdbService _igdbService;

    public ExternalGamesController(IIgdbService igdbService)
    {
        _igdbService = igdbService;
    }

    [AllowAnonymous]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        var games = await _igdbService.SearchGamesAsync(query);
        return Ok(games);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDetails(int id)
    {
        var game = await _igdbService.GetGameDetailsAsync(id);
        if (game == null) return NotFound();
        return Ok(game);
    }

    [AllowAnonymous] 
    [HttpGet("popular")]
    public async Task<IActionResult> GetPopular()
    {
        var games = await _igdbService.GetPopularGamesAsync();
        return Ok(games);
    }
}