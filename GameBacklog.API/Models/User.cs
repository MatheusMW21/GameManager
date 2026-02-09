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
}
