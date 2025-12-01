package application

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"time"

	"github.com/IvanTachev233/lift-big/internal/handler"
	"github.com/IvanTachev233/lift-big/internal/transport"
	"github.com/redis/go-redis/v9"
)

type App struct {
	router http.Handler
	rdb *redis.Client
}

func New() *App {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
		Password: "",
		DB: 0,
	})

	appHandler := &handler.App{
		Rdb: rdb,
	}

	app:= &App{
		router: transport.LoadRoutes(appHandler),
		rdb: rdb,
	}
	return app
}

func (a *App) Start(ctx context.Context) error {
	server := &http.Server{
		Addr: ":3000",
		Handler: a.router,
	}

	err := a.rdb.Ping(ctx).Err()
	if err != nil {
		return fmt.Errorf("failed to connect to redis: %w", err)
	}

	defer func() {
		if err := a.rdb.Close(); err != nil {
			fmt.Println("failed to close redis connection:", err)
		}
	}()

	fmt.Println("Connected to Redis")

	ch := make(chan error, 1)
	go func() {
		err = server.ListenAndServe()
		if err != nil {
			ch <- fmt.Errorf("failed to start server: %w", err)
		}
		close(ch)
	}()
	
	select {
	case err = <- ch:
		return err
	case <-ctx.Done():
		timeout, cancel := context.WithTimeout(context.Background(), time.Second * 10)
		defer cancel()
		return server.Shutdown(timeout)
	}
	
	return nil
}
