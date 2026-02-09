using System;
using System.ComponentModel.DataAnnotations;

namespace GameBacklog.API.Dtos;

public class CreateReviewDto
{
    [Range(typeof(decimal), "1", "5")]
    public decimal Rating { get; set; }

    [MaxLength(4000)]
    public string? Body { get; set; }

    public DateTime? PlayedAt { get; set; }
}
