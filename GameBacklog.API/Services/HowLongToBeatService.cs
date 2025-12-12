using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using GameBacklog.API.DTOs;

namespace GameBacklog.API.Services;

public class HowLongToBeatService : IHowLongToBeatService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public HowLongToBeatService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<HltbResultDto?> SearchGameTimeAsync(string gameName)
    {
        var client = _httpClientFactory.CreateClient("HLTB");
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");
        client.DefaultRequestHeaders.Add("Referer", "https://howlongtobeat.com/");
        client.DefaultRequestHeaders.Add("Origin", "https://howlongtobeat.com");
        client.DefaultRequestHeaders.Add("Accept", "*/*");
        client.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");

        var url = "https://howlongtobeat.com/api/search";


        var terms = gameName.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var requestBody = new
        {
            searchType = "games",
            searchTerms = terms,
            searchPage = 1,
            size = 20,
            searchOptions = new
            {
                games = new
                {
                    userId = 0,
                    platform = "",
                    sortCategory = "popular",
                    rangeCategory = "main",
                    rangeTime = new { min = 0, max = 0 },
                    gameplay = new { perspective = "", flow = "", genre = "" },
                    modifier = ""
                },
                users = new { sortCategory = "postcount" },
                filter = "",
                sort = 0,
                randomizer = 0
            }
        };

        try
        {
            Console.WriteLine($"[HLTB] Buscando por: {gameName}...");
            var response = await client.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[HLTB] Erro na requisição: {response.StatusCode}");
                return null;
            }

            var jsonString = await response.Content.ReadAsStringAsync();
            

            var jsonNode = JsonNode.Parse(jsonString);
            var dataArray = jsonNode?["data"]?.AsArray();

            if (dataArray == null || dataArray.Count == 0)
            {
                Console.WriteLine("[HLTB] Nenhum jogo encontrado no JSON de resposta.");
                return null;
            }

            var bestMatch = dataArray[0];

            Console.WriteLine($"[HLTB] Encontrado: {bestMatch["game_name"]}");

            return new HltbResultDto
            {
                GameName = bestMatch["game_name"]?.ToString() ?? "",
                ImageUrl = $"https://howlongtobeat.com/games/{bestMatch["game_image"]?.ToString()}",
                
                MainStory = ConvertSecondsToHours(bestMatch["comp_main"]?.ToString()),
                MainExtra = ConvertSecondsToHours(bestMatch["comp_plus"]?.ToString()),
                Completionist = ConvertSecondsToHours(bestMatch["comp_100"]?.ToString())
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[HLTB] Exceção crítica: {ex.Message}");
            return null;
        }
    }

    private double ConvertSecondsToHours(string? secondsStr)
    {
        if (double.TryParse(secondsStr, out double seconds))
        {
            return seconds > 0 ? Math.Round(seconds / 3600, 1) : 0;
        }
        return 0;
    }
}