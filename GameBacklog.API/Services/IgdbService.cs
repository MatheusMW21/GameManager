using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization; 
using GameBacklog.API.Configuration;
using GameBacklog.API.Dtos;          
using GameBacklog.API.Dtos.Igdb;
using GameBacklog.API.DTOs;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace GameBacklog.API.Services;

public class IgdbService : IIgdbService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IgdbSettings _settings;
    private readonly IMemoryCache _cache;
    private const string TOKEN_CACHE_KEY = "IgdbAccessToken";
    
    private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions 
    { 
        PropertyNameCaseInsensitive = true 
    };

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

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        EnsureClientIdHeader(client);

        var igdbQuery = $"search \"{SanitizeQuery(query)}\"; fields name, summary, first_release_date, cover.url; limit 20; where game_type = (0, 8, 9);";

        var content = new StringContent(igdbQuery, Encoding.UTF8, "text/plain");
        var response = await client.PostAsync("games", content);

        if (!response.IsSuccessStatusCode) return new List<IgdbGameResponse>();

        var jsonResponse = await response.Content.ReadAsStringAsync();
        
        var games = JsonSerializer.Deserialize<List<IgdbGameResponse>>(jsonResponse, _jsonOptions);

        if (games != null)
        {
            foreach (var game in games)
            {
                if (game.Cover != null && !string.IsNullOrEmpty(game.Cover.Url))
                {
                    if (!game.Cover.Url.StartsWith("https:")) 
                        game.Cover.Url = "https:" + game.Cover.Url;
                    
                    game.Cover.Url = game.Cover.Url.Replace("t_thumb", "t_cover_big");
                }
            }
        }
        return games ?? new List<IgdbGameResponse>();
    }

    public async Task<HltbResultDto?> GetGameTimeAsync(string gameName)
    {
        try
        {
            var token = await GetAccessTokenAsync();

            var client = _httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Add("Client-ID", _settings.ClientId);

            var safeName = SanitizeQuery(gameName);

            var queryGame = $"search \"{safeName}\"; fields name, cover.url; where category = (0, 8, 9); limit 1;";
            var contentGame = new StringContent(queryGame, Encoding.UTF8, "text/plain");
            var responseGame = await client.PostAsync("https://api.igdb.com/v4/games", contentGame);

            if (!responseGame.IsSuccessStatusCode) return null;

            var jsonGame = await responseGame.Content.ReadAsStringAsync();
            
            var games = JsonSerializer.Deserialize<List<IgdbGameResponse>>(jsonGame, _jsonOptions);

            if (games == null || games.Count == 0) return null;

            var game = games[0];

            var queryTimes = $"fields hastily, normally, completely; where game_id = {game.Id}; limit 1;";
            var contentTimes = new StringContent(queryTimes, Encoding.UTF8, "text/plain");

            Console.WriteLine($"[IGDB] Buscando tempos para ID: {game.Id}...");

            var responseTimes = await client.PostAsync("https://api.igdb.com/v4/game_time_to_beats", contentTimes);

            IgdbTimeToBeat? times = null;

            if (responseTimes.IsSuccessStatusCode)
            {
                var jsonTimes = await responseTimes.Content.ReadAsStringAsync();
                var timesList = JsonSerializer.Deserialize<List<IgdbTimeToBeat>>(jsonTimes, _jsonOptions);
                if (timesList != null && timesList.Count > 0)
                {
                    times = timesList[0];
                    Console.WriteLine("[IGDB] Tempos encontrados!");
                }
            }
            else
            {
                var error = await responseTimes.Content.ReadAsStringAsync();
                Console.WriteLine($"[IGDB Time Error] {responseTimes.StatusCode}: {error}");
            }

            return new HltbResultDto
            {
                GameName = game.Name,
                ImageUrl = game.Cover?.Url != null
                    ? ("https:" + game.Cover.Url).Replace("t_thumb", "t_cover_big")
                    : null,

                MainStory = ConvertSecondsToHours(times?.Hastily ?? 0),
                MainExtra = ConvertSecondsToHours(times?.Normally ?? 0),
                Completionist = ConvertSecondsToHours(times?.Completely ?? 0)
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IGDB Exception] {ex.Message}");
            return null;
        }
    }

    private void EnsureClientIdHeader(HttpClient client)
    {
        if (!client.DefaultRequestHeaders.Contains("Client-ID"))
        {
            client.DefaultRequestHeaders.Add("Client-ID", _settings.ClientId);
        }
    }

    private string SanitizeQuery(string query)
    {
        return query.Replace("\"", "").Trim();
    }

    private double ConvertSecondsToHours(int seconds)
    {
        if (seconds <= 0) return 0;
        return Math.Round(seconds / 3600.0, 1);
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
        
        var tokenData = JsonSerializer.Deserialize<TwitchTokenResponse>(json, _jsonOptions);

        if (tokenData == null || string.IsNullOrEmpty(tokenData.AccessToken))
            throw new Exception("Falha ao autenticar na Twitch/IGDB");

        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(tokenData.ExpiresIn - 60));

        _cache.Set(TOKEN_CACHE_KEY, tokenData.AccessToken, cacheOptions);

        return tokenData.AccessToken;
    }
}