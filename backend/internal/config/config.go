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

	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioUseSSL    bool

	NovuAPIKey string
	NovuAPIURL string

	GotenbergURL string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	accessTTL, _ := strconv.Atoi(getEnv("JWT_ACCESS_TTL_MIN", "15"))
	refreshTTL, _ := strconv.Atoi(getEnv("JWT_REFRESH_TTL_DAYS", "30"))
	minioSSL, _ := strconv.ParseBool(getEnv("MINIO_USE_SSL", "true"))

	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		JWTSecret:     []byte(os.Getenv("JWT_SECRET")),
		JWTAccessTTL:  time.Duration(accessTTL) * time.Minute,
		JWTRefreshTTL: time.Duration(refreshTTL) * 24 * time.Hour,

		MinioEndpoint:  os.Getenv("MINIO_ENDPOINT"),
		MinioAccessKey: os.Getenv("MINIO_ACCESS_KEY"),
		MinioSecretKey: os.Getenv("MINIO_SECRET_KEY"),
		MinioUseSSL:    minioSSL,

		NovuAPIKey: os.Getenv("NOVU_API_KEY"),
		NovuAPIURL: getEnv("NOVU_API_URL", "http://localhost:3000"),

		GotenbergURL: getEnv("GOTENBERG_URL", "http://localhost:3000"),
	}, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
