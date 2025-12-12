using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameBacklog.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDetailedTimesAndGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MyGoal",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "TimeCompletionist",
                table: "Games",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TimeExtra",
                table: "Games",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TimeMain",
                table: "Games",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MyGoal",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TimeCompletionist",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TimeExtra",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TimeMain",
                table: "Games");
        }
    }
}
