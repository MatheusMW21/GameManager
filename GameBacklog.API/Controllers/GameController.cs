using System.Security.Claims;
using GameBacklog.API.Data;
using GameBacklog.API.Dtos;
using GameBacklog.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameBacklog.API.Services;
using Microsoft.AspNetCore.Authorization;

namespace GameBacklog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GameController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ISteamService _steamService;
    private readonly IIgdbService _igdbService;

    public GameController(AppDbContext context, ISteamService steamService, IIgdbService igdbService)
    {
        _context = context;
        _steamService = steamService;
        _igdbService = igdbService;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null) throw new UnauthorizedAccessException("Token inválido.");
        return int.Parse(idClaim.Value);
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameBacklogItem>>> GetGames()
    {
        var userId = GetCurrentUserId();
        return await _context.Games
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameBacklogItem>> GetGame(int id)
    {
        var userId = GetCurrentUserId();
        var game = await _context.Games
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (game == null) return NotFound();
        return game;
    }

    [HttpPost]
    public async Task<ActionResult<GameBacklogItem>> CreateGame(CreateGameDto request)
    {
        var userId = GetCurrentUserId();
        
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
            catch 
            {
            }
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
            TimePlayed = 0,
            EstimatedTime = 0,
            UserId = userId 
        };

        _context.Games.Add(game);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGame(int id, [FromBody] GameBacklogItem game)
    {
        if (id != game.Id) return BadRequest("ID incompatível.");

        var userId = GetCurrentUserId();
        var existingGame = await _context.Games
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (existingGame == null) return NotFound();

        existingGame.Title = game.Title;
        existingGame.Platform = game.Platform;
        existingGame.Status = game.Status;
        existingGame.Rating = game.Rating;
        existingGame.Comments = game.Comments;

        if (game.CoverUrl != existingGame.CoverUrl && !string.IsNullOrEmpty(game.CoverUrl))
        {
            var cleanUrl = game.CoverUrl;
            if (cleanUrl.StartsWith("//")) cleanUrl = "https:" + cleanUrl;
            cleanUrl = cleanUrl.Replace("t_thumb", "t_cover_big");
            existingGame.CoverUrl = cleanUrl;
        }
        else 
        {
            existingGame.CoverUrl = game.CoverUrl;
        }

        existingGame.DroppedReason = game.DroppedReason;
        existingGame.SteamAppId = game.SteamAppId;
        existingGame.TimeMain = game.TimeMain;
        existingGame.TimeExtra = game.TimeExtra;
        existingGame.TimeCompletionist = game.TimeCompletionist;
        existingGame.MyGoal = game.MyGoal;
        existingGame.TimePlayed = game.TimePlayed;
        existingGame.ExternalId = game.ExternalId;

        if (game.Status == GameStatus.Completed && existingGame.CompletedAt == null)
             existingGame.CompletedAt = DateTime.UtcNow;
        else if (game.Status != GameStatus.Completed)
             existingGame.CompletedAt = null;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Games.Any(e => e.Id == id && e.UserId == userId))
                return NotFound();
            else
                throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(int id)
    {
        var userId = GetCurrentUserId();
        var game = await _context.Games
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (game == null) return NotFound();

        _context.Games.Remove(game);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}