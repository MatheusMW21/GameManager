using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameBacklog.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialAndDroppedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DroppedReason",
                table: "Games",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PurchaseDate",
                table: "Games",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchasePrice",
                table: "Games",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Store",
                table: "Games",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DroppedReason",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "PurchaseDate",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "PurchasePrice",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Store",
                table: "Games");
        }
    }
}
