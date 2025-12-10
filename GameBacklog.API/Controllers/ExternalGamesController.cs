using GameBacklog.API.Dtos.Igdb;
using GameBacklog.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GameBacklog.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExternalGamesController : ControllerBase
    {
        private readonly IIgdbService _igdbService;

        public ExternalGamesController(IIgdbService igdbService)
        {
            _igdbService = igdbService;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<IgdbGameResponse>>> SearchGames([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("Query parameter is required.");
            }

            var results = await _igdbService.SearchGamesAsync(query);
            return Ok(results);
        }
    }
}
