using GameBacklog.API.Dtos; 
using GameBacklog.API.Dtos.Igdb;
using GameBacklog.API.DTOs;

namespace GameBacklog.API.Services;

public interface IIgdbService
{
    Task<List<IgdbGameResponse>> SearchGamesAsync(string query);
    
    Task<HltbResultDto?> GetGameTimeAsync(string gameName);

    Task<IgdbGameDetails?> GetGameDetailsAsync(int id);
}