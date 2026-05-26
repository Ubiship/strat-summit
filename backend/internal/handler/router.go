package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/ubiship/strat-summit/backend/internal/config"
)

type Handler struct {
	cfg *config.Config
}

func New(cfg *config.Config) *Handler {
	return &Handler{cfg: cfg}
}

func (h *Handler) Router() chi.Router {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(corsMiddleware)

	// Public routes
	r.Get("/health", h.Health)

	// API routes (will add auth middleware later)
	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes
		r.Post("/auth/login", h.notImplemented)
		r.Post("/auth/refresh", h.notImplemented)
		r.Post("/auth/logout", h.notImplemented)

		// Protected routes (add auth middleware)
		r.Group(func(r chi.Router) {
			// Properties
			r.Route("/properties", func(r chi.Router) {
				r.Get("/", h.notImplemented)
				r.Post("/", h.notImplemented)
				r.Get("/{id}", h.notImplemented)
				r.Put("/{id}", h.notImplemented)
			})

			// Bookings
			r.Route("/bookings", func(r chi.Router) {
				r.Get("/", h.notImplemented)
				r.Post("/", h.notImplemented)
				r.Get("/{id}", h.notImplemented)
			})

			// Cleaning Jobs
			r.Route("/jobs", func(r chi.Router) {
				r.Get("/", h.notImplemented)
				r.Get("/{id}", h.notImplemented)
				r.Put("/{id}/status", h.notImplemented)
			})
		})
	})

	return r
}

func (h *Handler) notImplemented(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(map[string]string{
		"error": "not implemented",
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
