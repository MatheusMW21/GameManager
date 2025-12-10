using System;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using GameBacklog.API.Configuration;
using GameBacklog.API.Dtos.Igdb;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace GameBacklog.API.Services;

public class IgdbService : IIgdbService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IgdbSettings _settings;
    private readonly IMemoryCache _cache;
    private const string TOKEN_CACHE_KEY = "IgdbAccessToken";

    public IgdbService(
        IHttpClientFactory httpClientFactory, 
        IOptions<IgdbSettings> settings,
        IMemoryCache cache)
    {
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
        _cache = cache;
    }
    public async Task<List<IgdbGameResponse>> SearchGamesAsync(string query)
    {
        var token = await GetAccessTokenAsync();
        var client = _httpClientFactory.CreateClient("IgdbClient");

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var igdbQuery = $"search \"{query}\"; fields name, summary, first_release_date, cover.url; limit 20; where game_type = (0, 8, 9);";
        //category 0 = main_game, 8 = remake, 9

        var content = new StringContent(igdbQuery, Encoding.UTF8, "text/plain");
        var response = await client.PostAsync("games", content);
        var rawResponse = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return new List<IgdbGameResponse>();
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        var games = JsonSerializer.Deserialize<List<IgdbGameResponse>>(jsonResponse);

        if (games != null)
        {
            foreach (var game in games)
            {
                if (game.Cover != null && !game.Cover.Url.StartsWith("https:"))
                {
                    game.Cover.Url = "https:" + game.Cover.Url;
                }
                if (game.Cover != null)
                {
                    game.Cover.Url = game.Cover.Url.Replace("t_thumb", "t_cover_big");
                }
            }
        }
        return games ?? new List<IgdbGameResponse>();
    }

    private async Task<string> GetAccessTokenAsync()
    {
        if (_cache.TryGetValue(TOKEN_CACHE_KEY, out string? cachedToken))
        {
            return cachedToken!;
        }

        var client = _httpClientFactory.CreateClient();

        var url = $"https://id.twitch.tv/oauth2/token?" +
                  $"client_id={_settings.ClientId}&" +
                  $"client_secret={_settings.ClientSecret}&" +
                  $"grant_type=client_credentials";

        var response = await client.PostAsync(url, null);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var tokenData = JsonSerializer.Deserialize<TwitchTokenResponse>(json);

        if (tokenData == null || string.IsNullOrEmpty(tokenData.AccessToken))
            throw new Exception("Falha ao autenticar na Twitch/IGDB");

        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(tokenData.ExpiresIn - 60));

        _cache.Set(TOKEN_CACHE_KEY, tokenData.AccessToken, cacheOptions);

        return tokenData.AccessToken;
    }
}
