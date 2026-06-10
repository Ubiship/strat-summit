package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/config"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/service"
)

type Handler struct {
	cfg *config.Config
	svc *service.Service
}

func New(cfg *config.Config, svc *service.Service) *Handler {
	return &Handler{cfg: cfg, svc: svc}
}

func (h *Handler) Router() chi.Router {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(h.corsMiddleware())
	r.Use(h.maxBodySize())

	// Public routes
	r.Get("/health", h.Health)

	// Webhook routes (public but signature-verified)
	r.Post("/webhooks/chatwoot", h.ChatwootWebhook)

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes (public)
		r.Post("/auth/login", h.Login)
		r.Post("/auth/refresh", h.RefreshToken)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(auth.Authenticate([]byte(h.cfg.JWTSecret)))

			// Auth
			r.Post("/auth/logout", h.Logout)

			// Properties
			r.Route("/properties", func(r chi.Router) {
				r.Get("/", h.ListProperties)
				r.Post("/", h.CreateProperty)
				r.Get("/{id}", h.GetProperty)
				r.Put("/{id}", h.UpdateProperty)
			})

			// Bookings
			r.Route("/bookings", func(r chi.Router) {
				r.Get("/", h.ListBookings)
				r.Post("/", h.CreateBooking)
				r.Get("/{id}", h.GetBooking)
			})

			// Cleaning Jobs
			r.Route("/jobs", func(r chi.Router) {
				r.Get("/", h.ListJobs)
				r.Get("/{id}", h.GetJob)
				r.Post("/{id}/clock-in", h.ClockInJob)
				r.Post("/{id}/clock-out", h.ClockOutJob)
				r.Put("/{id}/status", h.UpdateJobStatus)
				r.Post("/{id}/assign", h.AssignStaffToJob)
			})

			// Contacts (admin only)
			r.Route("/contacts", func(r chi.Router) {
				r.Use(auth.RequireRole(domain.RoleAdmin))
				r.Get("/", h.ListContacts)
				r.Post("/", h.CreateContact)
				r.Get("/{id}", h.GetContact)
			})

			// Admin routes
			r.Route("/admin", func(r chi.Router) {
				r.Use(auth.RequireRole(domain.RoleAdmin))

				// Pending contacts
				r.Route("/pending-contacts", func(r chi.Router) {
					r.Get("/", h.ListPendingContacts)
					r.Get("/{id}", h.GetPendingContact)
					r.Post("/{id}/approve", h.ApprovePendingContact)
					r.Post("/{id}/create", h.CreateContactFromPending)
					r.Post("/{id}/reject", h.RejectPendingContact)
				})
			})
		})
	})

	return r
}

func (h *Handler) corsMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			allowed := false

			// Check if origin is in allowed list
			for _, o := range h.cfg.CORSAllowedOrigins {
				if o == origin || o == "*" {
					allowed = true
					break
				}
			}

			if allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func (h *Handler) maxBodySize() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, h.cfg.MaxRequestBodySize)
			next.ServeHTTP(w, r)
		})
	}
}

// ============================================================================
// Response Helpers
// ============================================================================

type APIResponse struct {
	Data  interface{} `json:"data,omitempty"`
	Error *APIError   `json:"error,omitempty"`
}

type APIError struct {
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIResponse{Data: data})
}

func respondError(w http.ResponseWriter, status int, message string, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIResponse{
		Error: &APIError{Message: message, Code: code},
	})
}
