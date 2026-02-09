using GameBacklog.API.Data;
using GameBacklog.API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.API.Controllers;

[Route("api/feed")]
[ApiController]
[AllowAnonymous]
public class FeedController : ControllerBase
{
    private readonly AppDbContext _context;

    public FeedController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("reviews")]
    public async Task<ActionResult<IEnumerable<PublicReviewDto>>> GetRecentReviews([FromQuery] int take = 8)
    {
        var reviews = await _context.Reviews
            .OrderByDescending(r => r.CreatedAt)
            .Take(take)
            .Select(r => new PublicReviewDto(
                r.Id,
                r.Rating,
                r.Body,
                r.PlayedAt,
                r.CreatedAt,
                r.GameBacklogItemId,
                r.Game!.Title,
                r.Game.CoverUrl,
                r.UserId,
                r.User!.Name
            ))
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("recent-games")]
    public async Task<ActionResult<IEnumerable<object>>> GetRecentReviewedGames([FromQuery] int take = 6)
    {
        var recentGameIds = await _context.Reviews
            .GroupBy(r => r.GameBacklogItemId)
            .Select(g => new { GameId = g.Key, LastReviewAt = g.Max(x => x.CreatedAt) })
            .OrderByDescending(x => x.LastReviewAt)
            .Take(take)
            .ToListAsync();

        var ids = recentGameIds.Select(x => x.GameId).ToList();

        var games = await _context.Games
            .Where(g => ids.Contains(g.Id))
            .Select(g => new
            {
                id = g.Id,
                title = g.Title,
                coverUrl = g.CoverUrl,
                platform = g.Platform
            })
            .ToListAsync();

        var order = recentGameIds.Select((x, i) => new { x.GameId, i })
            .ToDictionary(x => x.GameId, x => x.i);

        var ordered = games.OrderBy(g => order[g.id]).ToList();

        return Ok(ordered);
    }
}
