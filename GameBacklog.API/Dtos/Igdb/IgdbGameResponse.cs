using System.Text.Json.Serialization;

namespace GameBacklog.API.Dtos.Igdb;

public class IgdbGameResponse
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("first_release_date")]
    public long? FirstReleaseDate { get; set; }

    [JsonPropertyName("cover")]
    public IgdbCover? Cover { get; set; }

    [JsonPropertyName("time_to_beat")]
    public IgdbTimeToBeat? TimeToBeat { get; set; }
}

public class IgdbCover
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;
}

public class IgdbTimeToBeat
{
    [JsonPropertyName("hastily")] 
    public int Hastily { get; set; }      

    [JsonPropertyName("normally")] 
    public int Normally { get; set; }    

    [JsonPropertyName("completely")] 
    public int Completely { get; set; }  
}