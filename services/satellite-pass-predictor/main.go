package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// SatellitePass represents a predicted satellite pass
type SatellitePass struct {
	ID               string    `json:"id"`
	SatelliteName    string    `json:"satellite_name"`
	StartTime        time.Time `json:"start_time"`
	EndTime          time.Time `json:"end_time"`
	MaxElevation     float64   `json:"max_elevation"`
	Direction        string    `json:"direction"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	VisibilityWindow int       `json:"visibility_window_seconds"`
}

// PredictionRequest represents a request for pass prediction
type PredictionRequest struct {
	Latitude    float64   `json:"latitude" binding:"required"`
	Longitude   float64   `json:"longitude" binding:"required"`
	StartDate   time.Time `json:"start_date" binding:"required"`
	EndDate     time.Time `json:"end_date" binding:"required"`
	MinElevation float64   `json:"min_elevation"`
}

// PredictionResponse represents the prediction result
type PredictionResponse struct {
	Passes    []SatellitePass `json:"passes"`
	TotalCount int            `json:"total_count"`
	Location   Location        `json:"location"`
}

// Location represents a geographic location
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}

	// Get JWT secret for authentication
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	// Initialize Gin router
	router := gin.Default()

	// Add CORS middleware
	router.Use(CORSMiddleware())

	// Health check endpoint
	router.GET("/health", healthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Protected routes - require JWT authentication
		protected := v1.Group("")
		protected.Use(JWTAuthMiddleware(jwtSecret))
		{
			protected.POST("/predict-passes", predictPasses)
			protected.GET("/satellite-info", getSatelliteInfo)
		}
	}

	// Start server
	log.Printf("Satellite Pass Predictor service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// healthCheck returns the health status of the service
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "satellite-pass-predictor",
		"version": "1.0.0",
		"time":    time.Now().UTC(),
	})
}

// predictPasses predicts satellite passes for a given location and time range
func predictPasses(c *gin.Context) {
	var req PredictionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate input
	if req.Latitude < -90 || req.Latitude > 90 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Latitude must be between -90 and 90"})
		return
	}
	if req.Longitude < -180 || req.Longitude > 180 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Longitude must be between -180 and 180"})
		return
	}
	if req.EndDate.Before(req.StartDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End date must be after start date"})
		return
	}

	// Set default minimum elevation if not provided
	if req.MinElevation == 0 {
		req.MinElevation = 10.0 // Default 10 degrees
	}

	// Generate predicted passes (simplified simulation)
	passes := generatePredictedPasses(req)

	response := PredictionResponse{
		Passes:    passes,
		TotalCount: len(passes),
		Location: Location{
			Latitude:  req.Latitude,
			Longitude: req.Longitude,
		},
	}

	c.JSON(http.StatusOK, response)
}

// getSatelliteInfo returns information about SAR satellites
func getSatelliteInfo(c *gin.Context) {
	satellites := []gin.H{
		{
			"name":        "SAR-SAT-1",
			"norad_id":    43111,
			"status":      "operational",
			"orbit_type":  "LEO",
			"altitude_km": 570,
			"inclination": 97.69,
		},
		{
			"name":        "SAR-SAT-2",
			"norad_id":    43112,
			"status":      "operational",
			"orbit_type":  "LEO",
			"altitude_km": 570,
			"inclination": 97.69,
		},
		{
			"name":        "SAR-SAT-3",
			"norad_id":    44387,
			"status":      "operational",
			"orbit_type":  "LEO",
			"altitude_km": 570,
			"inclination": 97.69,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"satellites": satellites,
		"count":      len(satellites),
	})
}

// generatePredictedPasses generates simulated satellite pass predictions
// In production, this would use SGP4 propagator with real TLE data
func generatePredictedPasses(req PredictionRequest) []SatellitePass {
	passes := []SatellitePass{}
	satellites := []string{"SAR-SAT-1", "SAR-SAT-2", "SAR-SAT-3"}

	// Calculate number of days in the range
	days := int(req.EndDate.Sub(req.StartDate).Hours() / 24)
	if days > 30 {
		days = 30 // Limit to 30 days for demo
	}

	// Generate 1-3 passes per day per satellite (simplified)
	passID := 1
	for day := 0; day < days; day++ {
		currentDate := req.StartDate.AddDate(0, 0, day)

		for _, satName := range satellites {
			// Generate 1-2 passes per day
			numPasses := 1 + (day % 2)

			for p := 0; p < numPasses; p++ {
				// Simulate pass times (roughly 12 hours apart)
				startHour := 6 + (p * 12) + (day % 4) // Vary start times
				startTime := time.Date(
					currentDate.Year(), currentDate.Month(), currentDate.Day(),
					startHour, 15+passID%45, 0, 0, time.UTC,
				)

				// Typical pass duration: 5-10 minutes
				duration := time.Duration(5+passID%5) * time.Minute
				endTime := startTime.Add(duration)

				// Skip if outside requested range
				if startTime.Before(req.StartDate) || startTime.After(req.EndDate) {
					continue
				}

				// Simulate elevation (between min elevation and 90 degrees)
				maxElevation := req.MinElevation + float64(20+passID%60)
				if maxElevation > 90 {
					maxElevation = 90
				}

				// Only include passes above minimum elevation
				if maxElevation < req.MinElevation {
					continue
				}

				// Determine direction (ascending/descending)
				direction := "ASCENDING"
				if passID%2 == 0 {
					direction = "DESCENDING"
				}

				pass := SatellitePass{
					ID:               generatePassID(satName, passID),
					SatelliteName:    satName,
					StartTime:        startTime,
					EndTime:          endTime,
					MaxElevation:     maxElevation,
					Direction:        direction,
					Latitude:         req.Latitude,
					Longitude:        req.Longitude,
					VisibilityWindow: int(duration.Seconds()),
				}

				passes = append(passes, pass)
				passID++
			}
		}
	}

	return passes
}

// generatePassID creates a unique identifier for a satellite pass
func generatePassID(satelliteName string, passNumber int) string {
	timestamp := time.Now().Unix()
	return gin.H{
		"satellite": satelliteName,
		"number":    passNumber,
		"timestamp": timestamp,
	}.MarshalJSON()[0:16]
}

// CORSMiddleware handles CORS headers
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
