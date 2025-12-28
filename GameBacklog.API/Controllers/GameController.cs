using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using GameBacklog.API.Data;
using GameBacklog.API.Models;
using GameBacklog.API.Services;
using GameBacklog.API.Dtos;

namespace GameBacklog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GameController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IIgdbService _igdbService;
    private readonly ISteamService _steamService;
    private readonly IUserContextService _userService;

    public GameController(AppDbContext context, IIgdbService igdbService, ISteamService steamService, IUserContextService userService)
    {
        _context = context;
        _igdbService = igdbService;
        _steamService = steamService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameBacklogItem>>> GetGames()
    {
        var user = await _userService.GetCurrentUserAsync();
        return await _context.Games
            .Where(g => g.UserId == user.Id)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameBacklogItem>> GetGame(int id)
    {
        var user = await _userService.GetCurrentUserAsync();
        var game = await _context.Games.FirstOrDefaultAsync(g => g.Id == id && g.UserId == user.Id);

        if (game == null) return NotFound();

        return game;
    }

    [HttpPost]
    public async Task<ActionResult<GameBacklogItem>> CreateGame(CreateGameDto request)
    {
        var user = await _userService.GetCurrentUserAsync();

        string? coverUrlToSave = request.CoverUrl;
        string? steamIdToSave = request.SteamAppId;

        if (string.IsNullOrEmpty(coverUrlToSave))
        {
            try
            {
                var searchResults = await _igdbService.SearchGamesAsync(request.Title);
                var firstMatch = searchResults.FirstOrDefault();
                if (firstMatch?.Cover?.Url != null)
                {
                    coverUrlToSave = firstMatch.Cover.Url;
                }
            }
            catch { }
        }

        if (!string.IsNullOrEmpty(coverUrlToSave))
        {
            if (coverUrlToSave.StartsWith("//"))
            {
                coverUrlToSave = "https:" + coverUrlToSave;
            }
            coverUrlToSave = coverUrlToSave.Replace("t_thumb", "t_cover_big");
        }

        if (string.IsNullOrEmpty(steamIdToSave))
        {
            var foundId = await _steamService.SearchAppIdAsync(request.Title);
            if (foundId.HasValue)
            {
                steamIdToSave = foundId.Value.ToString();
            }
        }

        var game = new GameBacklogItem
        {
            Title = request.Title,
            Platform = request.Platform,
            Status = request.Status,
            Comments = request.Comments,
            CoverUrl = coverUrlToSave,
            ExternalId = request.ExternalId,
            SteamAppId = steamIdToSave,
            CreatedAt = DateTime.UtcNow,
            TimePlayed = request.TimeMain ?? 0,
            EstimatedTime = 0,
            UserId = user.Id
        };

        _context.Games.Add(game);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGame(int id, GameBacklogItem request)
    {
        if (id != request.Id) return BadRequest();

        var user = await _userService.GetCurrentUserAsync();
        var existingGame = await _context.Games.FirstOrDefaultAsync(g => g.Id == id && g.UserId == user.Id);

        if (existingGame == null) return NotFound();

        existingGame.Status = request.Status;
        existingGame.Comments = request.Comments;
        existingGame.Rating = request.Rating;
        existingGame.TimePlayed = request.TimePlayed;
        existingGame.Platform = request.Platform;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(int id)
    {
        var user = await _userService.GetCurrentUserAsync();
        var game = await _context.Games.FirstOrDefaultAsync(g => g.Id == id && g.UserId == user.Id);

        if (game == null) return NotFound();

        _context.Games.Remove(game);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}