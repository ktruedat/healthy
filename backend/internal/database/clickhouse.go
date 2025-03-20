package database

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/ktruedat/healthisis/backend/internal/config"
)

// DB is a wrapper for ClickHouse connection
type DB struct {
	conn driver.Conn
}

// NewClickHouseDB creates a new ClickHouse connection using the provided configuration
func NewClickHouseDB(cfg *config.Config) (*DB, error) {
	ctx := context.Background()

	// Extract database configs
	dbCfg := cfg.Database.Clickhouse

	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{fmt.Sprintf("%s:%d", dbCfg.Host, dbCfg.Port)},
		Auth: clickhouse.Auth{
			Database: dbCfg.Database,
			Username: dbCfg.Username,
			Password: dbCfg.Password,
		},
		Settings: clickhouse.Settings{
			"max_execution_time": dbCfg.MaxExecutionTime,
		},
		DialTimeout:     time.Second * time.Duration(dbCfg.DialTimeout),
		ConnMaxLifetime: time.Second * time.Duration(dbCfg.ConnMaxLifetime),
	})
	if err != nil {
		return nil, err
	}

	// Verify connection
	if err := conn.Ping(ctx); err != nil {
		return nil, err
	}

	return &DB{conn: conn}, nil
}

// GetConn returns the underlying connection
func (db *DB) GetConn() driver.Conn {
	return db.conn
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.conn.Close()
}
