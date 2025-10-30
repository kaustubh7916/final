# Prompt Optimizer Backend

A production-ready Node.js backend service that optimizes prompts using both rule-based transformations and LLM-based improvements. The system evaluates multiple optimization candidates and selects the best one based on semantic similarity and token efficiency.

## Architecture

The backend service consists of several key components:

1. **Express API** (server.js) - Handles incoming HTTP requests
2. **Optimizer** (optimizer.js) - Main optimization pipeline
3. **Rule Engine** (rule_engine.js) - Applies rule-based transformations
4. **LLM Adapters** (llm_adapters/) - Integrations with various LLM providers
5. **Metrics System** (metrics.js) - Tracks performance and usage metrics

## Features

- **Multi-source optimization**: Combines local rule-based optimization with LLM-generated candidates
- **Semantic validation**: Uses Jaccard similarity and optional cosine similarity for quality assurance
- **Intelligent selection**: Chooses the shortest candidate that passes semantic threshold
- **Comprehensive metrics**: Tracks performance, token savings, and error rates
- **Production-ready**: Includes rate limiting, security headers, and error handling
- **Mock mode**: Supports testing without real LLM API calls

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd prompt-optimizer-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Configuration

Create a `.env` file with the following variables:

```bash
# Server Configuration
PORT=3000

# LLM API Keys (optional - set USE_MOCK_LLM=true for testing)
GEMINI_API_KEY=your_gemini_api_key
HF_API_KEY=your_huggingface_api_key

# LLM Configuration
GEMINI_MODEL=gemini-1.5-flash
HF_MODEL=microsoft/DialoGPT-medium
LLM_TIMEOUT_MS=30000
LLM_MAX_RETRIES=3

# Semantic Validation
SEMANTIC_THRESHOLD=0.7
USE_PY_EMBEDDINGS=false
PY_EMBEDDINGS_URL=http://localhost:8001/embeddings

# Testing
USE_MOCK_LLM=true
```

### Running the Service

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### POST /optimize

Optimizes a prompt using multiple strategies and returns the best candidate.

**Request:**
```json
{
  "prompt": "Could you please help me understand this concept? Thank you in advance!",
  "profile": "neutral"
}
```

**Response:**
```json
{
  "original": {
    "prompt": "Could you please help me understand this concept? Thank you in advance!",
    "tokens": 15
  },
  "optimized": [
    {
      "source": "local",
      "prompt": "Help me understand this concept",
      "tokens": 6,
      "applied_rules": ["r01_strip_polite", "r05_remove_fillers"],
      "semantic_score": 0.85,
      "semantic_passed": true
    },
    {
      "source": "gemini",
      "prompt": "Explain this concept clearly",
      "tokens": 5,
      "semantic_score": 0.92,
      "semantic_passed": true,
      "latency_ms": 1200
    }
  ],
  "chosen": {
    "source": "gemini",
    "prompt": "Explain this concept clearly",
    "tokens": 5,
    "reason": "shortest_valid_gemini",
    "semantic_score": 0.92
  },
  "structured": {
    "json": { "type": "prompt", "content": "Explain this concept clearly", ... },
    "xml": "<prompt length=\"28\">Explain this concept clearly</prompt>"
  },
  "metrics": {
    "tokens_saved_pct": "66.67",
    "time_ms": 1450,
    "llm_calls": 2
  },
  "provenance": {
    "sources_used": ["local", "gemini", "hf_inference"],
    "rule_trace": {
      "local": ["r01_strip_polite", "r05_remove_fillers"],
      "gemini": "success",
      "hf_inference": "success"
    }
  }
}
```

### GET /healthz

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.45
}
```

### GET /metrics

Returns aggregated metrics.

**Response:**
```json
{
  "total_requests": 150,
  "total_errors": 2,
  "llm_calls": 300,
  "avg_time_ms": 1200,
  "tokens_saved": 2500,
  "error_rate": "1.33",
  "uptime_seconds": 3600,
  "last_updated": "2024-01-15T10:30:00.000Z"
}
```

## Components

### Rule Engine (`rule_engine.js`)

Applies 8 base rules for local optimization:
- Strip polite padding
- Convert "I want you to act as" → "Act as:"
- Remove closing lines
- Compress bullet lists
- Remove filler words
- Extract parameters
- Detect concise profile
- Normalize punctuation

### LLM Adapters (`llm_adapters/`)

- **Gemini Adapter**: Google Gemini API integration
- **HF Inference Adapter**: Hugging Face Inference API integration
- Both include retry logic, timeout handling, and mock mode support

### Semantic Validation (`utils.js`)

- Jaccard similarity for basic semantic validation
- Optional Python microservice integration for cosine similarity
- Configurable threshold for quality control

### Metrics System (`metrics/metrics.js`)

- JSONL-based metrics logging
- Tracks requests, errors, LLM calls, and performance
- Aggregated metrics endpoint

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files:
- `tests/rule_engine.test.js` - Unit tests for rule engine
- `tests/utils.test.js` - Unit tests for utility functions
- `tests/integration.test.js` - Integration tests for full pipeline

## Production Deployment

### Security Features

- Rate limiting (60 requests/minute)
- Security headers (XSS protection, content type options)
- Input size limits (1MB)
- Error handling and logging

### Monitoring

- Health check endpoint (`/healthz`)
- Metrics endpoint (`/metrics`)
- Structured logging to `logs/requests.log`
- Metrics logging to `metrics/metrics.jsonl`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `HF_API_KEY` | Hugging Face API key | - |
| `USE_MOCK_LLM` | Enable mock mode for testing | false |
| `SEMANTIC_THRESHOLD` | Semantic similarity threshold | 0.7 |
| `LLM_TIMEOUT_MS` | LLM request timeout | 30000 |
| `LLM_MAX_RETRIES` | Max retry attempts | 3 |

## Development

### Project Structure

```
prompt-optimizer-backend/
├── server.js              # Express server and routes
├── optimizer.js           # Main optimization pipeline
├── rule_engine.js         # Rule-based transformations
├── utils.js               # Utility functions
├── llm_adapters/          # LLM integration adapters
│   ├── gemini.js
│   └── hf_inference.js
├── metrics/               # Metrics collection
│   └── metrics.js
├── tests/                 # Test suite
│   ├── rule_engine.test.js
│   ├── utils.test.js
│   └── integration.test.js
├── logs/                  # Application logs
├── metrics/               # Metrics data
└── package.json
```

### Adding New Rules

To add a new optimization rule, edit `rule_engine.js`:

```javascript
{
  id: "r09_new_rule",
  desc: "Description of the rule",
  pattern: /regex_pattern/gi,
  replacement: "replacement_text",
  priority: 50,
  safe: true,
}
```

### Adding New LLM Adapters

Create a new adapter in `llm_adapters/` following the pattern:

```javascript
class NewAdapter {
  async callAdapter(prompt, opts = {}) {
    // Implementation
    return { ok, text, tokens, raw, latencyMs };
  }
}
```

## License

MIT License - see LICENSE file for details.
