using System;
using System.ComponentModel.DataAnnotations;
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
}
