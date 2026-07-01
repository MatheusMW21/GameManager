using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameBacklog.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoriteGames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FavGame1CoverUrl",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FavGame1IgdbID",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FavGame1Title",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FavGame2CoverUrl",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FavGame2IgdbID",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FavGame2Title",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FavGame3CoverUrl",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FavGame3IgdbID",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FavGame3Title",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FavGame4CoverUrl",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FavGame4IgdbID",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FavGame4Title",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FavGame1CoverUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame1IgdbID",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame1Title",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame2CoverUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame2IgdbID",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame2Title",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame3CoverUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame3IgdbID",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame3Title",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame4CoverUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame4IgdbID",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FavGame4Title",
                table: "Users");
        }
    }
}
