using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GameBacklog.API.Models;

public enum GameStatus
{
    Planning,
    Playing,
    Completed,
    Dropped
}

public enum GameplayGoal
{
    MainStory,
    MainPlusExtras,
    Completionist
}
public class GameBacklogItem
{
    [Key]
    public int Id { get; set; }
    [MaxLength(200)]
    public required string Title { get; set; }
    [MaxLength(50)]
    public string? ExternalId { get; set; } // id externo para puxar capa/info
    [MaxLength(500)]
    public string? CoverUrl { get; set; }
    public GameStatus Status { get; set; } = GameStatus.Planning;
    [MaxLength(50)]
    public string Platform { get; set; } = string.Empty;
    public double EstimatedTime { get; set; }
    public double TimePlayed { get; set; }
    [Range(0, 100)]
    public int? Rating { get; set; } // metacritic ou pessoal
    [MaxLength(1000)]
    public string? Comments { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    [MaxLength(200)]
    public string? DroppedReason { get; set; }
    [MaxLength(50)]
    public string? SteamAppId { get; set; }

    public double TimeMain { get; set; }
    public double TimeExtra { get; set; }
    public double TimeCompletionist { get; set; }

    public GameplayGoal MyGoal { get; set; }

    [NotMapped]
    public double ActualEstimatedTime => MyGoal switch
    {
        GameplayGoal.MainStory => TimeMain,
        GameplayGoal.MainPlusExtras => TimeExtra,
        GameplayGoal.Completionist => TimeCompletionist,
        _ => 0
    };

    public int UserId { get; set; }

    [JsonIgnore] 
    public User? User { get; set; }
}
