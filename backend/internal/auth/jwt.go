package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidToken       = errors.New("invalid token")
	ErrExpiredToken       = errors.New("token expired")
	ErrInvalidCredentials = errors.New("invalid credentials")
)

const bcryptCost = 12

type ctxKey string

const CtxKeyAuth ctxKey = "auth"

// Claims represents JWT claims for access tokens
type Claims struct {
	UserID    string          `json:"sub"`
	ContactID string          `json:"contact_id"`
	Role      domain.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// AuthContext holds authenticated user information extracted from JWT
type AuthContext struct {
	UserID    uuid.UUID
	ContactID uuid.UUID
	Role      domain.UserRole
}

// GenerateAccessToken creates a new JWT access token
func GenerateAccessToken(user *domain.User, secret []byte, ttl time.Duration) (string, error) {
	claims := Claims{
		UserID:    user.ID.String(),
		ContactID: user.ContactID.String(),
		Role:      user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// GenerateRefreshToken creates a random refresh token
func GenerateRefreshToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ValidateToken parses and validates a JWT token
func ValidateToken(tokenString string, secret []byte) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return secret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// ParseTokenUnverified extracts claims from a token without validating expiry.
// Used for refresh token flow where we accept expired access tokens.
// Still validates signature to prevent tampering.
func ParseTokenUnverified(tokenString string, secret []byte) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return secret, nil
	}, jwt.WithoutClaimsValidation())

	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// Authenticate is middleware that validates JWT and adds auth context
func Authenticate(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := extractBearer(r.Header.Get("Authorization"))
			if tokenString == "" {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			claims, err := ValidateToken(tokenString, secret)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			userID, _ := uuid.Parse(claims.UserID)
			contactID, _ := uuid.Parse(claims.ContactID)

			ctx := context.WithValue(r.Context(), CtxKeyAuth, &AuthContext{
				UserID:    userID,
				ContactID: contactID,
				Role:      claims.Role,
			})

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole is middleware that checks if user has required role
func RequireRole(roles ...domain.UserRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			auth := AuthFromContext(r.Context())
			if auth == nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			for _, role := range roles {
				if auth.Role == role {
					next.ServeHTTP(w, r)
					return
				}
			}

			http.Error(w, "forbidden", http.StatusForbidden)
		})
	}
}

// AuthFromContext extracts AuthContext from request context
func AuthFromContext(ctx context.Context) *AuthContext {
	auth, _ := ctx.Value(CtxKeyAuth).(*AuthContext)
	return auth
}

func extractBearer(header string) string {
	if strings.HasPrefix(header, "Bearer ") {
		return strings.TrimPrefix(header, "Bearer ")
	}
	return ""
}

// ============================================================================
// Password Hashing
// ============================================================================

// HashPassword generates a bcrypt hash for a password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPassword compares a password against a hash
func CheckPassword(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

// HashRefreshToken hashes a refresh token for storage
func HashRefreshToken(token string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(token), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckRefreshToken compares a refresh token against a hash
func CheckRefreshToken(token, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(token))
}

// ToDomainAuthContext converts auth.AuthContext to domain.AuthContext
func (a *AuthContext) ToDomainAuthContext() *domain.AuthContext {
	return &domain.AuthContext{
		UserID:    a.UserID,
		ContactID: a.ContactID,
		Role:      a.Role,
	}
}
