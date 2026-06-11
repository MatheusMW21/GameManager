using GameBacklog.API.Configuration;
using GameBacklog.API.Data;
using GameBacklog.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<IgdbSettings>(builder.Configuration.GetSection("IgdbSettings"));

builder.Services.AddHttpClient("IgdbClient", (serviceProvider, client) =>
{
    var settings = serviceProvider
        .GetRequiredService<IOptions<IgdbSettings>>().Value;

    client.BaseAddress = new Uri(settings.BaseUrl);
    client.DefaultRequestHeaders.Add("Client-ID", settings.ClientId);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddMemoryCache();
builder.Services.AddScoped<IIgdbService, IgdbService>();
builder.Services.AddScoped<ISteamService, SteamService>();
builder.Services.AddHttpClient("SteamClient");
builder.Services.AddScoped<IHowLongToBeatService, HowLongToBeatService>();
builder.Services.AddHttpClient("HLTB");
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://beloved-terrier-46.clerk.accounts.dev"; 
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowNextJs");

app.UseAuthentication();

app.UseAuthorization(); 

app.MapControllers(); 

app.Run();