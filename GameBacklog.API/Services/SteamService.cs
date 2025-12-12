using System;
using System.Text.Json;
using GameBacklog.API.Dtos;

namespace GameBacklog.API.Services;

public class SteamService : ISteamService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public SteamService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<SteamPriceOverview?> GetGamePriceAsync(string steamAppId)
    {
        var client = _httpClientFactory.CreateClient("SteamClient");
        var url = $"https://store.steampowered.com/api/appdetails?appids={steamAppId}&filters=price_overview&cc=br";

        try
        {
            var response = await client.GetAsync(url);
            if(!response.IsSuccessStatusCode) return null;
            
            var json = await response.Content.ReadAsStringAsync();

            var dict = JsonSerializer.Deserialize<Dictionary<string, SteamResponse>>(json);

            if (dict != null && dict.ContainsKey(steamAppId))
            {
                var appDetails = dict[steamAppId];
                if (appDetails.Success && appDetails.Data != null)
                {
                    return appDetails.Data.PriceOverview;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao buscar na Steam: {ex.Message}");
        }
        return null;
    }

    public async Task<int?> SearchAppIdAsync(string gameName)
    {
        var client = _httpClientFactory.CreateClient("SteamClient");
        var url = $"https://store.steampowered.com/api/storesearch/?term={Uri.EscapeDataString(gameName)}&l=english&cc=br";

        try
        {
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            
            if (root.TryGetProperty("items", out var items) && items.GetArrayLength() > 0)
            {
                var firstItem = items[0];
                if (firstItem.TryGetProperty("id", out var idElement))
                {
                    return idElement.GetInt32();
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao buscar ID na Steam: {ex.Message}");
        }

        return null;
    }
}
