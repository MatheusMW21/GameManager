using System;
using System.Text.Json.Serialization;

namespace GameBacklog.API.Dtos;

public class SteamResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }
    [JsonPropertyName("data")] 
    public SteamAppData? Data { get; set; }
}

public class SteamAppData
{
    [JsonPropertyName("price_overview")]
    public SteamPriceOverview? PriceOverview { get; set; }
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    [JsonPropertyName("is_free")]
    public bool IsFree { get; set; }
}

public class SteamPriceOverview
{
    [JsonPropertyName("currency")]
    public string Currency { get; set; } = string.Empty;
    [JsonPropertyName("initial")]
    public int Initial { get; set; } // preço em centavos
    [JsonPropertyName("final")]
    public int Final { get; set; } // preço atual em centavos (com desconto)
    [JsonPropertyName("discount_percent")]
    public int DiscountPercent { get; set; }
    public decimal FinalFormatted => Final / 100m; // converte para decimal
}