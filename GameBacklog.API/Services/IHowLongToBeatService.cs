using System;
using GameBacklog.API.DTOs;

namespace GameBacklog.API.Services;

public interface IHowLongToBeatService
{
    Task<HltbResultDto?> SearchGameTimeAsync(string gameName);
}
