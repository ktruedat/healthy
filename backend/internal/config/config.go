package config

import (
	"fmt"
	"os"
	"strconv"

	"gopkg.in/yaml.v3"
)

// Config holds all configuration for the server
type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	CORS     CORSConfig     `yaml:"cors"`
}

// ServerConfig holds all the server-related config
type ServerConfig struct {
	Port    int    `yaml:"port"`
	Env     string `yaml:"env"`
	Timeout int    `yaml:"timeout"`
}

// DatabaseConfig holds all the database-related config
type DatabaseConfig struct {
	Clickhouse ClickhouseConfig `yaml:"clickhouse"`
}

// ClickhouseConfig holds the configuration specific to ClickHouse
type ClickhouseConfig struct {
	Host             string `yaml:"host"`
	Port             int    `yaml:"port"`
	Database         string `yaml:"database"`
	Username         string `yaml:"username"`
	Password         string `yaml:"password"`
	MaxExecutionTime int    `yaml:"max_execution_time"`
	DialTimeout      int    `yaml:"dial_timeout"`
	ConnMaxLifetime  int    `yaml:"conn_max_lifetime"`
}

// CORSConfig holds all the CORS-related config
type CORSConfig struct {
	AllowedOrigins   []string `yaml:"allowed_origins"`
	AllowedMethods   []string `yaml:"allowed_methods"`
	AllowedHeaders   []string `yaml:"allowed_headers"`
	ExposedHeaders   []string `yaml:"exposed_headers"`
	AllowCredentials bool     `yaml:"allow_credentials"`
	MaxAge           int      `yaml:"max_age"`
}

// Load reads the configuration from a YAML file
func Load(path string) (*Config, error) {
	// Default config file path
	if path == "" {
		path = "config/config.yaml"
		// Try looking for file in the current directory if not found in config/
		if _, err := os.Stat(path); os.IsNotExist(err) {
			path = "config.yaml"
		}
	}

	// Read the config file
	bytes, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("error reading config file: %w", err)
	}

	// Parse the config
	var cfg Config
	if err := yaml.Unmarshal(bytes, &cfg); err != nil {
		return nil, fmt.Errorf("error parsing config file: %w", err)
	}

	// Apply environment variable overrides
	applyEnvOverrides(&cfg)

	return &cfg, nil
}

// applyEnvOverrides checks for environment variables that could override config values
func applyEnvOverrides(cfg *Config) {
	// Server settings
	if port := os.Getenv("SERVER_PORT"); port != "" {
		if p, err := strconv.Atoi(port); err == nil {
			cfg.Server.Port = p
		}
	}
	if env := os.Getenv("SERVER_ENV"); env != "" {
		cfg.Server.Env = env
	}

	// Database settings
	if host := os.Getenv("CLICKHOUSE_HOST"); host != "" {
		cfg.Database.Clickhouse.Host = host
	}
	if port := os.Getenv("CLICKHOUSE_PORT"); port != "" {
		if p, err := strconv.Atoi(port); err == nil {
			cfg.Database.Clickhouse.Port = p
		}
	}
	if db := os.Getenv("CLICKHOUSE_DB"); db != "" {
		cfg.Database.Clickhouse.Database = db
	}
	if user := os.Getenv("CLICKHOUSE_USER"); user != "" {
		cfg.Database.Clickhouse.Username = user
	}
	if pass := os.Getenv("CLICKHOUSE_PASSWORD"); pass != "" {
		cfg.Database.Clickhouse.Password = pass
	}
}
