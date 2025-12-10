using System;
using System.Text.Json.Serialization;

namespace GameBacklog.API.Dtos.Igdb;

public class TwitchTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;
    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }
}
