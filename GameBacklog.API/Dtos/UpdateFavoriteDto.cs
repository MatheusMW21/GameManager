namespace GameBacklog.API.Dtos;

public record UpdateFavoriteDto (int? IgdbGameId, string? Title, string? CoverUrl);