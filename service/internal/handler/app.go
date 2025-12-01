package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/redis/go-redis/v9"
)

type App struct {
	Rdb *redis.Client
}

func (h *App) GetTop10(w http.ResponseWriter, r *http.Request) {
	vals, err := h.Rdb.ZRevRangeWithScores(context.Background(), "leaderboard", 0, 9).Result()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get top 10: %v", err), http.StatusInternalServerError)
		return
	}
	type LeaderboardEntry struct {
		Username string  `json:"username"`
		Score    float64 `json:"total_weight_lifted"`
	}

	response := make([]LeaderboardEntry, len(vals))
	for i, v := range vals {
		response[i] = LeaderboardEntry{
			Username: fmt.Sprintf("%v", v.Member),
			Score:    v.Score,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, fmt.Sprintf("failed to encode response: %v", err), http.StatusInternalServerError)
	}
}

func (h *App) StreamLeaderboard(w http.ResponseWriter, r *http.Request) {
	// Set headers for SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Create a context that cancels when the client disconnects
	ctx := r.Context()

	// Subscribe to the Redis channel
	pubsub := h.Rdb.Subscribe(ctx, "leaderboard_updates")
	defer pubsub.Close()

	// Wait for confirmation that subscription is created
	_, err := pubsub.Receive(ctx)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to subscribe: %v", err), http.StatusInternalServerError)
		return
	}

	// Channel to receive messages
	ch := pubsub.Channel()

	// Send initial data
	h.sendLeaderboardUpdate(w)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ch:
			// When a message is received, fetch the latest leaderboard and send it
			h.sendLeaderboardUpdate(w)
		}
	}
}

func (h *App) sendLeaderboardUpdate(w http.ResponseWriter) {
	vals, err := h.Rdb.ZRevRangeWithScores(context.Background(), "leaderboard", 0, 9).Result()
	if err != nil {
		fmt.Printf("failed to get top 10: %v\n", err)
		return
	}

	type LeaderboardEntry struct {
		Username string  `json:"username"`
		Score    float64 `json:"total_weight_lifted"`
	}

	response := make([]LeaderboardEntry, len(vals))
	for i, v := range vals {
		response[i] = LeaderboardEntry{
			Username: fmt.Sprintf("%v", v.Member),
			Score:    v.Score,
		}
	}

	data, err := json.Marshal(response)
	if err != nil {
		fmt.Printf("failed to marshal response: %v\n", err)
		return
	}

	fmt.Fprintf(w, "data: %s\n\n", data)
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}
}
