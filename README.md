# AI Football Analytics Platform

A full-stack sports analytics application that provides AI-powered match analysis, player performance tracking, heatmap visualization, tactical recommendations, and team intelligence. Built with a FastAPI backend and a React TypeScript frontend.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Backend](#backend)
  - [Architecture](#architecture)
  - [API Reference](#api-reference)
  - [Domain Models](#domain-models)
  - [Services](#services)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
  - [Environment Variables](#environment-variables)
  - [Tests](#tests)
- [Frontend](#frontend)
  - [Running the Frontend](#running-the-frontend)
- [AI and Machine Learning](#ai-and-machine-learning)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

The AI Football Analytics Platform processes match data to deliver actionable insights for coaches, analysts, and players. The system ingests JSON match data through a REST API, runs analytics computations, generates rule-based recommendations, and exposes all results through a fully documented API consumed by the React frontend.

Key capabilities:

- Match overview with possession, pass accuracy, and head-to-head statistics
- Player performance stats including pass accuracy and turnover rate
- Position heatmaps for individual players
- Team possession breakdown per match
- AI-powered tactical recommendations (rule-based with ML model injection support)
- Secure JSON match data upload endpoint
- Interactive Swagger and ReDoc API documentation

---

## Project Structure

```
AI-Football-Analytics-Platform/
├── Backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI application factory
│   │   ├── api/
│   │   │   ├── router.py                  # Central API router (/api/v1)
│   │   │   └── routes/
│   │   │       ├── health.py              # GET /health
│   │   │       ├── matches.py             # Match endpoints
│   │   │       ├── players.py             # Player endpoints
│   │   │       ├── teams.py               # Team endpoints
│   │   │       ├── recommendations.py     # Recommendation endpoints
│   │   │       └── upload.py              # File upload endpoint
│   │   ├── core/
│   │   │   ├── config.py                  # Application settings
│   │   │   ├── exceptions.py              # Custom exception types and handlers
│   │   │   └── logging.py                 # Structured logging configuration
│   │   ├── models/
│   │   │   ├── domain.py                  # UML-derived domain classes
│   │   │   ├── schemas.py                 # Pydantic v2 API schemas (camelCase)
│   │   │   └── responses.py               # Generic ApiResponse wrapper
│   │   ├── services/
│   │   │   ├── json_loader.py             # Cached JSON data loading
│   │   │   ├── analytics_service.py       # Match, player, and team analytics
│   │   │   ├── recommendation_service.py  # Rule-based recommendation engine
│   │   │   └── model_runtime.py           # Local ML model abstraction
│   │   └── data/
│   │       ├── matches.json               # Match fixture data
│   │       ├── players.json               # Player roster data
│   │       └── teams.json                 # Team data
│   ├── tests/                             # pytest test suite (44 tests)
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pytest.ini
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── pages/                         # React page components
│   │   ├── components/                    # Reusable UI components
│   │   ├── services/                      # API service layer
│   │   └── utils/                         # Animation and utility helpers
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Technology Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Validation | Pydantic v2 |
| Configuration | pydantic-settings |
| ML Runtime | scikit-learn, joblib, pandas |
| Testing | pytest, httpx |
| Containerization | Docker, Docker Compose |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Animations | Framer Motion |
| Charts | Recharts |
| Styling | Tailwind CSS |

---

## Backend

### Architecture

The backend follows a clean layered architecture:

- **Routes** handle HTTP concerns only — input validation and response serialization
- **Services** contain all business logic and analytics computations
- **Domain models** are pure Python classes derived from the UML class diagram
- **JSON Loader** is the single point of data access with LRU caching

All API responses are wrapped in a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "timestamp": "2026-03-24T03:00:00+00:00"
}
```

All field names are camelCase for frontend compatibility.

### API Reference

Base URL: `/api/v1`

#### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check, returns status and version |

#### Matches

| Method | Endpoint | Description |
|---|---|---|
| GET | `/matches` | List all matches |
| GET | `/matches/{match_id}` | Match detail including events |
| GET | `/matches/{match_id}/overview` | Possession, pass accuracy, and statistics comparison |

#### Players

| Method | Endpoint | Description |
|---|---|---|
| GET | `/players` | List all players |
| GET | `/players/{player_id}` | Player summary |
| GET | `/players/{player_id}/stats` | Full statistics including computed pass accuracy and turnover rate |
| GET | `/players/{player_id}/heatmap` | Position heatmap coordinate array |

#### Teams

| Method | Endpoint | Description |
|---|---|---|
| GET | `/teams` | List all teams |
| GET | `/teams/{team_id}` | Team detail with attributes and season record |
| GET | `/teams/{team_id}/players` | Full team roster |
| GET | `/teams/{team_id}/possession` | Possession percentage from latest match |

#### Recommendations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/recommendations` | All recommendations across all matches |
| GET | `/recommendations/match/{match_id}` | Recommendations scoped to a specific match |
| GET | `/recommendations/player/{player_id}` | Recommendations scoped to a specific player |

#### Upload

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload a JSON match data file |

Note: the upload endpoint accepts JSON files only. Pickle and joblib uploads are rejected for security reasons.

#### Error Responses

All errors follow a consistent shape:

```json
{
  "detail": "Match 'xyz' not found.",
  "error_code": "NOT_FOUND",
  "context": { "resource": "Match", "id": "xyz" }
}
```

| Status Code | Meaning |
|---|---|
| 404 | Resource not found |
| 400 | Bad request or invalid upload |
| 422 | Request validation failure |
| 500 | Internal server error |

### Domain Models

The following classes are derived from the UML class diagram:

| Class | Responsibility |
|---|---|
| Position | Represents a single coordinate point with timestamp and minute |
| Positions | Collection of positions with centroid, bounding box, and heatmap helpers |
| Pass | A single pass event with distance and progressive pass detection |
| Turnover | A ball loss event with location and type |
| PlayerStats | Full player statistics with computed pass accuracy and turnover rate |
| MatchData | Complete match record with analytics helper methods |
| Recommendation | A structured insight with scope, priority, confidence, and reasoning |

### Services

| Service | Description |
|---|---|
| JSONLoader | Loads and caches JSON fixture files, validates structure, raises typed errors on failure |
| AnalyticsService | Computes match overview, player stats, position heatmaps, and team possession |
| RecommendationService | Generates rule-based recommendations, falls back gracefully when no ML model is present |
| ModelRuntime | Loads and runs local scikit-learn compatible models from a controlled directory |

### Running Locally

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Interactive API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Running with Docker

```bash
cd Backend
copy .env.example .env
docker compose up --build
```

The API will be available at http://localhost:8000.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| APP_NAME | Football Analytics API | Application display name |
| ENVIRONMENT | development | Deployment environment |
| DEBUG | false | Enable debug mode |
| HOST | 0.0.0.0 | Server bind host |
| PORT | 8000 | Server bind port |
| DATA_DIR | app/data | Path to JSON fixture files |
| MODEL_DIR | app/models_store | Path to trusted local ML model files |
| CORS_ORIGINS | http://localhost:3000,http://localhost:5173 | Comma-separated allowed CORS origins |
| LOG_LEVEL | INFO | Logging verbosity |

### Tests

```bash
cd Backend
pip install -r requirements-dev.txt
pytest
```

The test suite contains 44 tests across 7 files:

| File | Coverage |
|---|---|
| test_health.py | App startup, health endpoint, CORS headers |
| test_matches.py | List, detail, overview, 404 handling |
| test_players.py | List, detail, stats, heatmap, 404 handling |
| test_teams.py | List, detail, roster, possession aggregation |
| test_recommendations.py | All scopes, ML fallback verification |
| test_json_loader.py | Missing file, invalid JSON, upload accept/reject |
| test_analytics.py | Pass accuracy math, heatmap coordinates, pass distance |

---

## Frontend

The frontend is a React TypeScript single-page application built with Vite.

### Pages

| Page | Description |
|---|---|
| Dashboard | Overview of recordings, team stats, and recent activity |
| Match Analysis | Scoreboard, possession chart, and match statistics breakdown |
| Heatmaps | Team zone activity and individual player position heatmaps |
| Player Profile | Individual player statistics and radar chart |
| Recommendations | AI-generated tactical insights and player recommendations |
| Team Details | Team attributes radar chart and player roster |
| Upload | Match data file upload interface |
| Comparison | Side-by-side player and team comparison |

### Running the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The application will be available at http://localhost:5173.

---

## AI and Machine Learning

The platform is designed for local ML model integration without any external API calls.

The `ModelRuntime` class in `Backend/app/services/model_runtime.py` provides:

- Secure loading of `.joblib` and `.pkl` model files from a controlled directory
- Path traversal protection to prevent loading files outside `MODEL_DIR`
- A `predict(features: dict)` interface compatible with scikit-learn and pandas workflows
- Automatic fallback to rule-based recommendations when no model is loaded

To activate a trained model:

1. Place the model file in `Backend/app/models_store/`
2. Call `model_runtime.load("your_model.joblib")` at startup
3. The recommendation service will route through the model automatically

The rule-based recommendation engine covers:

- Top performer detection based on rating thresholds
- Player improvement flags based on pass accuracy and turnover rate
- Opposing player threat identification
- Team-level tactical recommendations

---

## Deployment

### Railway (Recommended, no credit card required)

1. Login to railway.app with GitHub
2. Create new project from this repository
3. Set Root Directory to `Backend`
4. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`
6. Deploy

### DigitalOcean App Platform

1. Create a new App from this GitHub repository
2. Set Source Directory to `Backend`
3. Set Run Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables and deploy

### Docker on any VPS

```bash
git clone https://github.com/mahmoudsalempro/AI-Football-Analytics-Platform.git
cd AI-Football-Analytics-Platform/Backend
cp .env.example .env
docker compose up --build -d
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes following the conventional commits format
4. Push the branch and open a Pull Request

Please ensure all tests pass before submitting a PR:

```bash
cd Backend
pytest
```
