using System;
using GameBacklog.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameBacklog.API.Controllers;

public record RegisterDto(string Name, string Email, string Password);
public record LoginDto(string Email, string Password);
public record LoginResponseDto(string Token, string UserName);

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{

    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto.Name, registerDto.Email, registerDto.Password);
        if (result == "Usuário registrado com sucesso.")
            return Ok(new { Message = result });
        return BadRequest(new { Message = result });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto.Email, dto.Password);

        if (token == null)
            return Unauthorized("Email ou senha inválidos.");

        return Ok(new LoginResponseDto(token, dto.Email.Split('@')[0]));
    }

}
