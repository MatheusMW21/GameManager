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
public class DiaryController : ControllerBase
{
  private readonly AppDbContext _context;
  private readonly IUserContextService _userService;

  public DiaryController(AppDbContext context, IUserContextService userContextService)
  {
    _context = context;
    _userService = userContextService;
  }

  [HttpGet]
  public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviews() 
  {
    var user = await _userService.GetCurrentUserAsync();
    
    var reviews = await _context.Reviews
      .Where(r => r.UserId == user.Id)
      .OrderByDescending(r => r.PlayedAt ?? r.CreatedAt)
      .Select(r => new ReviewDto(
      r.Id,
      r.Rating,
      r.Body,
      r.PlayedAt,
      r.CreatedAt,
      r.UpdatedAt,
      r.IgdbGameId,
      r.GameTitle,
      r.GameCoverUrl,
      r.GameBacklogItemId
    )).ToListAsync();
    
    return Ok(reviews);
  }
}