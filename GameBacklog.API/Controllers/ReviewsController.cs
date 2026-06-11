using GameBacklog.API.Data;
using GameBacklog.API.Dtos;
using GameBacklog.API.Models;
using GameBacklog.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.API.Controllers;

[Route("api/games/{gameId:int}/reviews")]
[ApiController]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IUserContextService _userService;

    public ReviewsController(AppDbContext context, IUserContextService userService)
    {
        _context = context;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> List(int gameId)
    {
        var user = await _userService.GetCurrentUserAsync();

        var gameExists = await _context.Games.AnyAsync(g => g.Id == gameId && g.UserId == user.Id);
        if (!gameExists) return NotFound();

        var reviews = await _context.Reviews
            .Where(r => r.GameBacklogItemId == gameId && r.UserId == user.Id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(r.Id, r.Rating, r.Body, r.PlayedAt, r.CreatedAt, r.UpdatedAt))
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost]
    public async Task<ActionResult<ReviewDto>> Create(int gameId, [FromBody] CreateReviewDto dto)
    {
        var user = await _userService.GetCurrentUserAsync();

        var game = await _context.Games.FirstOrDefaultAsync(g => g.Id == gameId && g.UserId == user.Id);
        if (game == null) return NotFound();

        if (dto.Rating < 1m || dto.Rating > 5m || dto.Rating % 0.5m != 0)
        {
            return BadRequest("Rating deve estar entre 1 e 5, em passos de 0.5.");
        }

        DateTime? playedAtUtc = null;
        if (dto.PlayedAt.HasValue)
        {
            var value = dto.PlayedAt.Value;
            playedAtUtc = value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        var review = new Review
        {
            Rating = dto.Rating,
            Body = dto.Body,
            PlayedAt = playedAtUtc,
            GameBacklogItemId = gameId,
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var result = new ReviewDto(review.Id, review.Rating, review.Body, review.PlayedAt, review.CreatedAt, review.UpdatedAt);

        return CreatedAtAction(nameof(List), new { gameId }, result);
    }

    [HttpPut("/api/games/{gameId}/reviews/{id}")]
    public async Task<ActionResult> UpdateReview(int id, UpdateReviewDto request)
    {
        var user = await _userService.GetCurrentUserAsync();

        var existingReview = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == user.Id);

        if (existingReview == null) return NotFound ();

        if (request.Rating.HasValue) existingReview.Rating = request.Rating.Value;
        if (request.Body != null) existingReview.Body = request.Body;
        if (request.PlayedAt.HasValue) {
            var value = request.PlayedAt.Value;
            existingReview.PlayedAt = value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
        existingReview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("/api/games/{gameId}/reviews/{id}")]
    public async Task<ActionResult> DeleteReview(int id)
    {
        var user = await _userService.GetCurrentUserAsync();
        var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == user.Id);

        if (review == null) return NotFound();

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();

    }
}
