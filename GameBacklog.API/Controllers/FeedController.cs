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
    public async Task<IActionResult> GetRecentReviews([FromQuery] int page = 1, [FromQuery] int pageSize = 8)
    {
        var query = _context.Reviews
            .OrderByDescending(r => r.CreatedAt)
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
            ));

        var total = await query.CountAsync();
        var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(new PagedResults<PublicReviewDto>(data, page, pageSize, total)); 
    }

    [HttpGet("recent-games")]
    public async Task<IActionResult> GetRecentReviewedGames([FromQuery] int page = 1, [FromQuery] int pageSize = 8)
    {
        var raw = await _context.Reviews
            .Select(r => new { r.IgdbGameId, r.GameTitle, r.GameCoverUrl, r.CreatedAt })
            .ToListAsync();
    
        var grouped = raw
            .GroupBy(r => r.IgdbGameId)
            .Select(g => new RecentGameDto(
                g.Key,
                g.OrderByDescending(r => r.CreatedAt).Select(r => r.GameTitle).FirstOrDefault(),
                g.OrderByDescending(r => r.CreatedAt).Select(r => r.GameCoverUrl).FirstOrDefault(),
                g.Max(r => r.CreatedAt)
            ))
            .OrderByDescending(x => x.LastReviewAt)
            .ToList();

        var total = grouped.Count;
        var data = grouped.Skip((page - 1) * pageSize).Take(pageSize);

        return Ok(new PagedResults<RecentGameDto>(data, page, pageSize, total));
    }
}
