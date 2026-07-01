namespace GameBacklog.API.Dtos;

public record UpdateAllFavoritesDto(
  UpdateFavoriteDto? Slot1,
  UpdateFavoriteDto? Slot2,
  UpdateFavoriteDto? Slot3,
  UpdateFavoriteDto? Slot4
);