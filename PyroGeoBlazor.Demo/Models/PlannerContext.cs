using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PyroGeoBlazor.Demo.Models;

public partial class PlannerContext : DbContext
{
    public PlannerContext(DbContextOptions<PlannerContext> options)
        : base(options)
    {
    }

    public virtual DbSet<VwParcelsLayer> VwParcelsLayers { get; set; }

    public virtual DbSet<VwTownshipExtensionsLayer> VwTownshipExtensionsLayers { get; set; }

    public virtual DbSet<VwTownshipsLayer> VwTownshipsLayers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VwParcelsLayer>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vwParcelsLayer", "geo");

            entity.Property(e => e.CustomIdentifier)
                .HasMaxLength(80)
                .IsUnicode(false);
            entity.Property(e => e.GeoPropertyId).HasColumnName("GeoPropertyID");
            entity.Property(e => e.Geometry).HasColumnType("geometry");
            entity.Property(e => e.InspectionProjectId).HasColumnName("InspectionProjectID");
            entity.Property(e => e.InspectionStateCode)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.Lpi)
                .HasMaxLength(128)
                .IsUnicode(false)
                .HasColumnName("LPI");
            entity.Property(e => e.PropertyId).HasColumnName("PropertyID");
            entity.Property(e => e.Source)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Unit)
                .HasMaxLength(8)
                .IsUnicode(false);
        });

        modelBuilder.Entity<VwTownshipExtensionsLayer>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vwTownshipExtensionsLayer", "geo");

            entity.Property(e => e.GeoTownshipExtensionOrFarmId).HasColumnName("GeoTownshipExtensionOrFarmID");
            entity.Property(e => e.Geometry).HasColumnType("geometry");
            entity.Property(e => e.NationalIdentifierPrefix)
                .HasMaxLength(32)
                .IsUnicode(false);
            entity.Property(e => e.TownshipExtensionOrFarmName).HasMaxLength(128);
        });

        modelBuilder.Entity<VwTownshipsLayer>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vwTownshipsLayer", "geo");

            entity.Property(e => e.GeoTownshipId).HasColumnName("GeoTownshipID");
            entity.Property(e => e.Geometry).HasColumnType("geometry");
            entity.Property(e => e.NationalIdentifierPrefix)
                .HasMaxLength(32)
                .IsUnicode(false);
            entity.Property(e => e.TownCode).HasMaxLength(8);
            entity.Property(e => e.TownName)
                .HasMaxLength(64)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
