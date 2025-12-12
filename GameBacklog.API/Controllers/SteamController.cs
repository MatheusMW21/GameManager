using GameBacklog.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameBacklog.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SteamController : ControllerBase
    {
        private readonly ISteamService _steamService;

        public SteamController(ISteamService steamService)
        {
            _steamService = steamService;
        }

        [HttpGet("price/{appId}")]
        public async Task<IActionResult> GetPrice(string appId)
        {
            if (string.IsNullOrWhiteSpace(appId)) return BadRequest();

            var priceInfo = await _steamService.GetGamePriceAsync(appId);

            if (priceInfo == null) return NotFound("Preço não encontrado ou jogo gratuito");
            return Ok(priceInfo);
        }

        [HttpGet("search/{name}")]
        public async Task<IActionResult> SearchId(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return BadRequest();

            var appId = await _steamService.SearchAppIdAsync(name);

            if (appId == null) return NotFound("Jogo não encontrado na Steam.");

            return Ok(new { steamId = appId.ToString() });
        }
    }
}
