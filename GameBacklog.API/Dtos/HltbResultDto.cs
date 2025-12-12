namespace GameBacklog.API.DTOs;

public class HltbResultDto
{
    public string GameName { get; set; } = string.Empty;
    public double MainStory { get; set; }
    public double MainExtra { get; set; }
    public double Completionist { get; set; }
    public string? ImageUrl { get; set; }
}