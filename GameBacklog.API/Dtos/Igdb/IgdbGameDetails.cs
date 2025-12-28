using System.Text.Json.Serialization;

namespace GameBacklog.API.Dtos.Igdb;

public class IgdbGameDetails
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;

    [JsonPropertyName("first_release_date")]
    public long? FirstReleaseDate { get; set; }

    public IgdbCover? Cover { get; set; }
    public int Category { get; set; } 
    
    [JsonPropertyName("aggregated_rating")]
    public double? AggregatedRating { get; set; }

    public List<IgdbGenre>? Genres { get; set; }
    
    public List<IgdbPlatform>? Platforms { get; set; }
    
    public List<IgdbScreenshot>? Screenshots { get; set; }
    
    [JsonPropertyName("involved_companies")]
    public List<IgdbInvolvedCompany>? InvolvedCompanies { get; set; }
}

public class IgdbGenre { public string Name { get; set; } = string.Empty; }

public class IgdbPlatform { public string Name { get; set; } = string.Empty; }

public class IgdbScreenshot { public string Url { get; set; } = string.Empty; }

public class IgdbInvolvedCompany 
{ 
    public IgdbCompany Company { get; set; } = new(); 
    public bool Developer { get; set; }
    public bool Publisher { get; set; }
}
public class IgdbCompany { public string Name { get; set; } = string.Empty; }