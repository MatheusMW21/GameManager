using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GameBacklog.API.Models;

namespace GameBacklog.API.Dtos;

public class CreateGameDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string? ExternalId { get; set; }
    public string? CoverUrl { get; set; }
    public string Platform { get; set; } = string.Empty;
    public GameStatus Status { get; set; } = GameStatus.Planning;
    [MaxLength(1000)]
    public string? Comments { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal PurchasePrice { get; set; } = 0;
    public DateTime? PurchaseDate { get; set; }
    [MaxLength(50)]
    public string? Store { get; set; }
    [MaxLength(200)]
    public string? DroppedReason { get; set; }
    [MaxLength(50)]
    public string? SteamAppId { get; set; }
}
