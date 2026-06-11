using System.ComponentModel.DataAnnotations;
using GameBacklog.API.Models;

namespace GameBacklog.API.Dtos;

public class UpdateReviewDto
{
    public decimal? Rating { get; set; }

    [MaxLength(4000)]
    public string? Body { get; set; }

    public DateTime? PlayedAt { get; set; }
}