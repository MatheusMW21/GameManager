namespace GameBacklog.API.Dtos;

public record ProfileDto(
  string Name,
  string Email,
  FavoriteGameDto? Fav1,
  FavoriteGameDto? Fav2,
  FavoriteGameDto? Fav3,
  FavoriteGameDto? Fav4
);

public record FavoriteGameDto(int IgdbGameId, string? Title, string? CoverUrl);