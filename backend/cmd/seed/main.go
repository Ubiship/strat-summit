package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer conn.Close(ctx)

	// Admin user details
	email := "hello@ubiship.io"
	password := "ChangeMe123!" // User should change on first login
	firstName := "UbiShip"
	lastName := "Admin"

	// Generate bcrypt hash
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Check if user already exists
	var exists bool
	err = conn.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email).Scan(&exists)
	if err != nil {
		log.Fatalf("Failed to check existing user: %v", err)
	}

	if exists {
		fmt.Println("Admin user already exists, skipping...")
		return
	}

	// Create contact and user in transaction
	tx, err := conn.Begin(ctx)
	if err != nil {
		log.Fatalf("Failed to start transaction: %v", err)
	}
	defer tx.Rollback(ctx)

	// Insert contact
	var contactID string
	err = tx.QueryRow(ctx, `
		INSERT INTO contacts (first_name, last_name, email, role)
		VALUES ($1, $2, $3, 'admin')
		RETURNING id
	`, firstName, lastName, email).Scan(&contactID)
	if err != nil {
		log.Fatalf("Failed to create contact: %v", err)
	}

	// Insert user
	var userID string
	err = tx.QueryRow(ctx, `
		INSERT INTO users (contact_id, email, password_hash, role, active)
		VALUES ($1, $2, $3, 'admin', true)
		RETURNING id
	`, contactID, email, string(hash)).Scan(&userID)
	if err != nil {
		log.Fatalf("Failed to create user: %v", err)
	}

	err = tx.Commit(ctx)
	if err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	fmt.Println("=================================")
	fmt.Println("Admin user created successfully!")
	fmt.Println("=================================")
	fmt.Printf("Email:    %s\n", email)
	fmt.Printf("Password: %s\n", password)
	fmt.Println("---------------------------------")
	fmt.Println("Please change password on first login!")
}
