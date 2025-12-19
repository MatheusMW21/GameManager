using System;
using GameBacklog.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GameBacklog.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<GameBacklogItem> Games { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<GameBacklogItem>()
            .Property(g => g.Status)
            .HasConversion<string>();
    }
}
