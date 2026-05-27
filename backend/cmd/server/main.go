package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ubiship/strat-summit/backend/internal/config"
	"github.com/ubiship/strat-summit/backend/internal/handler"
	"github.com/ubiship/strat-summit/backend/internal/integrations/novu"
	"github.com/ubiship/strat-summit/backend/internal/repository"
	"github.com/ubiship/strat-summit/backend/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	// Connect to database
	ctx := context.Background()
	dbpool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer dbpool.Close()

	// Verify database connection
	if err := dbpool.Ping(ctx); err != nil {
		logger.Error("failed to ping database", "error", err)
		os.Exit(1)
	}
	logger.Info("connected to database")

	// Initialize Novu client
	var novuClient *novu.Client
	if cfg.NovuAPIKey != "" {
		novuClient = novu.New(novu.Config{
			APIKey:  cfg.NovuAPIKey,
			BaseURL: cfg.NovuAPIURL,
		})
		logger.Info("novu client initialized")
	} else {
		logger.Warn("novu not configured, notifications disabled")
	}

	// Initialize layers
	repo := repository.New(dbpool)
	svc := service.New(cfg, repo, novuClient)
	h := handler.New(cfg, svc)

	// Create server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      h.Router(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		logger.Info("starting server", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("shutting down server")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("shutdown error", "error", err)
		os.Exit(1)
	}

	logger.Info("server stopped")
}
