using GameBacklog.API.Data;
using GameBacklog.API.Dtos;
using GameBacklog.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GameController : ControllerBase
{
    private readonly AppDbContext _context;

    public GameController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameBacklogItem>>> GetGames()
    {
        return await _context.Games.OrderByDescending(g => g.CreatedAt).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameBacklogItem>> GetGame(int id)
    {
        var game = await _context.Games.FindAsync(id);
        if (game == null)
        {
            return NotFound();
        }
        return game;
    }

    [HttpPost]
    public async Task<ActionResult<GameBacklogItem>> CreateGame(CreateGameDto request)
    {
        var game = new GameBacklogItem
        {
            Title = request.Title,
            Platform = request.Platform,
            Status = request.Status,
            Comments = request.Comments,
            CoverUrl = request.CoverUrl,
            ExternalId = request.ExternalId,
            CreatedAt = DateTime.UtcNow,
            TimePlayed = 0,
            EstimatedTime = 0
        };

        _context.Games.Add(game);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGame(int id, [FromBody] GameBacklogItem game)
    {
        if (id != game.Id)
        {
            return BadRequest("ID do jogo não corresponde ao ID da URL.");
        }

        var existingGame = await _context.Games.FindAsync(id);
        if (existingGame == null)
        {
            return NotFound();
        }

        existingGame.Title = game.Title;
        existingGame.Platform = game.Platform;
        existingGame.Status = game.Status;
        existingGame.Rating = game.Rating;
        existingGame.Comments = game.Comments;
        existingGame.CoverUrl = game.CoverUrl;
        existingGame.PurchasePrice = game.PurchasePrice;
        existingGame.Store = game.Store;
        existingGame.DroppedReason = game.DroppedReason;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Games.Any(e => e.Id == id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(int id)
    {
        var game = await _context.Games.FindAsync(id);
        if (game == null)
        {
            return NotFound();
        }

        _context.Games.Remove(game);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}