using System;
using System.Collections.Generic;

namespace GameBacklog.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ClerkId { get; set; }

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public int? FavGame1IgdbID { get; set; }
    public string? FavGame1Title { get; set; }
    public string? FavGame1CoverUrl { get; set; }
    public int? FavGame2IgdbID { get; set; }
    public string? FavGame2Title { get; set; }
    public string? FavGame2CoverUrl { get; set; }
    public int? FavGame3IgdbID { get; set; }
    public string? FavGame3Title { get; set; }
    public string? FavGame3CoverUrl { get; set; }
    public int? FavGame4IgdbID { get; set; }
    public string? FavGame4Title { get; set; }
    public string? FavGame4CoverUrl { get; set; }
}
