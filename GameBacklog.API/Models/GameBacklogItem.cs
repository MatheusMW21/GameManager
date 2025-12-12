using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameBacklog.API.Models;

public enum GameStatus
{
    Planning,
    Playing,
    Completed,
    Dropped
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
}
