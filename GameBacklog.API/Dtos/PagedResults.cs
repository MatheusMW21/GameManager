namespace GameBacklog.API.Dtos;

public record PagedResults<T>(
  IEnumerable<T> Data,
  int Page,
  int PageSize,
  int Total
);