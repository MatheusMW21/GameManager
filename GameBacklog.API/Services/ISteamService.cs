using System;
using GameBacklog.API.Dtos;

namespace GameBacklog.API.Services;

public interface ISteamService
{
    Task<SteamPriceOverview?> GetGamePriceAsync(string steamAppId);
    Task<int?> SearchAppIdAsync(string gameName);
}
