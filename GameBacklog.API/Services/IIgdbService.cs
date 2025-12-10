using System;
using GameBacklog.API.Dtos.Igdb;

namespace GameBacklog.API.Services;

public interface IIgdbService
{
    Task<List<IgdbGameResponse>> SearchGamesAsync(string query);
}
