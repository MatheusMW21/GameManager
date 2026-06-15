namespace GameBacklog.API.Dtos;
public record RecentGameDto(
  int IgdbGameId, 
  string? Title, 
  string? CoverUrl, 
  DateTime LastReviewAt
);