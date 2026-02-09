using System.ComponentModel.DataAnnotations;
using GameBacklog.API.Models;

namespace GameBacklog.API.Dtos;

public class UpdateGameDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public GameStatus Status { get; set; } = GameStatus.Planning;
    [MaxLength(1000)]
    public string? Comments { get; set; }
    [MaxLength(200)]
    public string? DroppedReason { get; set; }
    [MaxLength(50)]
    public string? SteamAppId { get; set; }
    public double? TimeMain { get; set; }
    public double? TimeExtra { get; set; }
    public double? TimeCompletionist { get; set; }
    public double? TimePlayed { get; set; }
    public GameplayGoal? MyGoal { get; set; }
    public int? Rating { get; set; }
    public string? CoverUrl { get; set; }
}
