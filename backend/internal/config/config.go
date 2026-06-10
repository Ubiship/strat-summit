package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   []byte
	JWTAccessTTL  time.Duration
	JWTRefreshTTL time.Duration

	// CORS
	CORSAllowedOrigins []string

	// Request limits
	MaxRequestBodySize int64

	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioUseSSL    bool

	NovuAPIKey string
	NovuAPIURL string
	NovuAppID  string

	GotenbergURL string

	// Chatwoot
	ChatwootBaseURL       string
	ChatwootAPIToken      string
	ChatwootAccountID     int
	ChatwootInboxID       int
	ChatwootWebhookSecret string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	accessTTL, _ := strconv.Atoi(getEnv("JWT_ACCESS_TTL_MIN", "15"))
	refreshTTL, _ := strconv.Atoi(getEnv("JWT_REFRESH_TTL_DAYS", "30"))
	minioSSL, _ := strconv.ParseBool(getEnv("MINIO_USE_SSL", "true"))
	maxBodySize, _ := strconv.ParseInt(getEnv("MAX_REQUEST_BODY_SIZE", "1048576"), 10, 64) // 1MB default
	chatwootAccountID, _ := strconv.Atoi(getEnv("CHATWOOT_ACCOUNT_ID", "1"))
	chatwootInboxID, _ := strconv.Atoi(getEnv("CHATWOOT_INBOX_ID", "1"))

	// Parse CORS origins (comma-separated)
	corsOrigins := parseCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"))

	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		JWTSecret:     []byte(os.Getenv("JWT_SECRET")),
		JWTAccessTTL:  time.Duration(accessTTL) * time.Minute,
		JWTRefreshTTL: time.Duration(refreshTTL) * 24 * time.Hour,

		CORSAllowedOrigins: corsOrigins,
		MaxRequestBodySize: maxBodySize,

		MinioEndpoint:  os.Getenv("MINIO_ENDPOINT"),
		MinioAccessKey: os.Getenv("MINIO_ACCESS_KEY"),
		MinioSecretKey: os.Getenv("MINIO_SECRET_KEY"),
		MinioUseSSL:    minioSSL,

		NovuAPIKey: os.Getenv("NOVU_API_KEY"),
		NovuAPIURL: getEnv("NOVU_API_URL", "http://localhost:3000"),
		NovuAppID:  os.Getenv("NOVU_APP_ID"),

		GotenbergURL: getEnv("GOTENBERG_URL", "http://localhost:3000"),

		ChatwootBaseURL:       os.Getenv("CHATWOOT_BASE_URL"),
		ChatwootAPIToken:      os.Getenv("CHATWOOT_API_TOKEN"),
		ChatwootAccountID:     chatwootAccountID,
		ChatwootInboxID:       chatwootInboxID,
		ChatwootWebhookSecret: os.Getenv("CHATWOOT_WEBHOOK_SECRET"),
	}, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func parseCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := make([]string, 0)
	for _, p := range splitAndTrim(s, ",") {
		if p != "" {
			parts = append(parts, p)
		}
	}
	return parts
}

func splitAndTrim(s, sep string) []string {
	var result []string
	start := 0
	for i := 0; i < len(s); i++ {
		if i+len(sep) <= len(s) && s[i:i+len(sep)] == sep {
			part := trimSpace(s[start:i])
			result = append(result, part)
			start = i + len(sep)
		}
	}
	result = append(result, trimSpace(s[start:]))
	return result
}

func trimSpace(s string) string {
	start, end := 0, len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	return s[start:end]
}
