using GameBacklog.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameBacklog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HltbController : ControllerBase
{
    private readonly IIgdbService _igdbService;

    public HltbController(IIgdbService igdbService)
    {
        _igdbService = igdbService;
    }

    [HttpGet("search/{name}")]
    public async Task<IActionResult> Search(string name)
    {
        var result = await _igdbService.GetGameTimeAsync(name);
        
        if (result == null) return NotFound("Tempos não encontrados na IGDB.");
        
        return Ok(result);
    }
}