namespace GameBacklog.API.Dtos;

public record PublicReviewDto(
    int ReviewId,
    decimal Rating,
    string? Body,
    DateTime? PlayedAt,
    DateTime CreatedAt,
    int GameId,
    string? GameTitle,
    string? GameCoverUrl,
    int UserId,
    string UserName
);
