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
                r.IgdbGameId,
                r.GameTitle,
                r.GameCoverUrl,    
                r.UserId,
                r.User!.Name
            ))
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("recent-games")]
    public async Task<ActionResult<IEnumerable<object>>> GetRecentReviewedGames([FromQuery] int take = 6)
    {
        var recentGames = await _context.Reviews
            .GroupBy(r => r.IgdbGameId)
            .Select(g => new 
            {
                igdbGameId = g.Key,
                title = g.OrderByDescending(r => r.CreatedAt).Select(r => r.GameTitle).FirstOrDefault(),
                coverUrl = g.OrderByDescending(r => r.CreatedAt).Select(r => r.GameCoverUrl).FirstOrDefault(), 
                LastReviewAt = g.Max(r => r.CreatedAt) 
            })
            .OrderByDescending(x => x.LastReviewAt)
            .Take(take)
            .ToListAsync();
        
        return Ok(recentGames);

    }
}
