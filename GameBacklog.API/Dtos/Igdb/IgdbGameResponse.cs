using System;
using System.Text.Json.Serialization;

namespace GameBacklog.API.Dtos.Igdb;

public class IgdbGameResponse
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("summary")]
    public string? Summary { get; set; }
    [JsonPropertyName("first_release_date")]
    public long? FirstReleaseDateUnix { get; set; } 

    [JsonPropertyName("cover")]
    public IgdbImage? Cover { get; set; }
    
    public DateTime? ReleaseDate => FirstReleaseDateUnix.HasValue 
        ? DateTimeOffset.FromUnixTimeSeconds(FirstReleaseDateUnix.Value).DateTime 
        : null;
}

public class IgdbImage
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;
}
