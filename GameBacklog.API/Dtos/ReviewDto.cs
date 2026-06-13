using System;

namespace GameBacklog.API.Dtos;

public record ReviewDto(
    int Id,
    decimal Rating,
    string? Body,
    DateTime? PlayedAt,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    int IgdbGameId,
    string? GameTitle,
    string? GameCoverUrl,
    int? GameBacklogItemId
);