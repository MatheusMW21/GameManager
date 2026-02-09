using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GameBacklog.API.Models;

public class Review
{
    public int Id { get; set; }

    [Range(typeof(decimal), "1", "5")]
    public decimal Rating { get; set; }

    [MaxLength(4000)]
    public string? Body { get; set; }

    public DateTime? PlayedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public int GameBacklogItemId { get; set; }

    [JsonIgnore]
    public GameBacklogItem? Game { get; set; }

    public int UserId { get; set; }

    [JsonIgnore]
    public User? User { get; set; }
}
