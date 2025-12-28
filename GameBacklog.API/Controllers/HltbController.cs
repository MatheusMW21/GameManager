using GameBacklog.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameBacklog.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class HltbController : ControllerBase
{
    private readonly IIgdbService _igdbService;

    public HltbController(IIgdbService igdbService)
    {
        _igdbService = igdbService;
    }

    [HttpGet("search")]
    public async Task<IActionResult> GetTime([FromQuery] string? gameName) 
    {
        if (string.IsNullOrWhiteSpace(gameName)) 
            return BadRequest("Nome do jogo é obrigatório.");

        var result = await _igdbService.GetGameTimeAsync(gameName);

        if (result == null)
            return NotFound("Tempos não encontrados na base de dados.");

        return Ok(result);
    }
}