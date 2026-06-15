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
  public async Task<IActionResult> GetReviews([FromQuery] int page = 1, [FromQuery] int pageSize = 20) 
  {
    var user = await _userService.GetCurrentUserAsync();
    
    var query = _context.Reviews
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
    ));

    var total = await query.CountAsync();
    var data = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    
    return Ok(new PagedResults<ReviewDto>(data, page, pageSize, total));
  }
}