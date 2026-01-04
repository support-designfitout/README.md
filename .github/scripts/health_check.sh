#!/bin/bash
set -e

# Health Check Script for API Endpoints
# Validates health and API endpoints with retry logic and latency monitoring

# Configuration
BASE_URL="${BASE_URL:-https://app.fitoutlab.app}"
MAX_RETRIES="${MAX_RETRIES:-3}"
TIMEOUT="${TIMEOUT:-10}"
LATENCY_THRESHOLD="${LATENCY_THRESHOLD:-800}"
LOG_FILE="${LOG_FILE:-health_check.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize log file
echo "=== Health Check Started at $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" > "$LOG_FILE"
echo "Base URL: $BASE_URL" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to log messages
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        ERROR)
            echo -e "${RED}❌ $message${NC}"
            ;;
        SUCCESS)
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        WARNING)
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        INFO)
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check JSON field exists
check_json_field() {
    local json=$1
    local field=$2
    
    if echo "$json" | jq -e ".$field" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to perform health check with retries
check_endpoint() {
    local endpoint=$1
    local expected_fields=$2
    local description=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    log "INFO" "Checking endpoint: $endpoint ($description)"
    
    local url="${BASE_URL}${endpoint}"
    local attempt=0
    local success=false
    
    while [ $attempt -lt $MAX_RETRIES ] && [ "$success" = false ]; do
        attempt=$((attempt + 1))
        
        if [ $attempt -gt 1 ]; then
            log "INFO" "Retry attempt $attempt/$MAX_RETRIES for $endpoint"
        fi
        
        # Measure request time
        
        # Make the request
        local response=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time $TIMEOUT "$url" 2>&1)
        local curl_exit=$?
        
        
        if [ $curl_exit -ne 0 ]; then
            log "WARNING" "Request failed with curl exit code: $curl_exit"
            if [ $attempt -lt $MAX_RETRIES ]; then
                sleep 2
                continue
            else
                log "ERROR" "Endpoint $endpoint failed after $MAX_RETRIES attempts"
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
                return 1
            fi
        fi
        
        # Parse response
        local body=$(echo "$response" | head -n -2)
        local http_code=$(echo "$response" | tail -n 2 | head -n 1)
        local time_total=$(echo "$response" | tail -n 1)
        
        # Calculate latency in milliseconds
        local latency_ms=$(echo "$time_total * 1000" | bc | cut -d. -f1)
        
        log "INFO" "HTTP Status: $http_code, Latency: ${latency_ms}ms"
        
        # Check HTTP status code
        if [ "$http_code" != "200" ]; then
            log "WARNING" "Unexpected HTTP status code: $http_code (expected 200)"
            if [ $attempt -lt $MAX_RETRIES ]; then
                sleep 2
                continue
            else
                log "ERROR" "Endpoint $endpoint returned status $http_code after $MAX_RETRIES attempts"
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
                return 1
            fi
        fi
        
        # Check latency threshold
        if [ $latency_ms -gt $LATENCY_THRESHOLD ]; then
            log "WARNING" "Latency ${latency_ms}ms exceeds threshold ${LATENCY_THRESHOLD}ms"
        fi
        
        # Validate JSON response
        if ! echo "$body" | jq . > /dev/null 2>&1; then
            log "ERROR" "Invalid JSON response from $endpoint"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
        
        # Validate required fields
        local all_fields_present=true
        IFS=',' read -ra FIELDS <<< "$expected_fields"
        for field in "${FIELDS[@]}"; do
            if ! check_json_field "$body" "$field"; then
                log "ERROR" "Missing required field: $field"
                all_fields_present=false
            fi
        done
        
        if [ "$all_fields_present" = false ]; then
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            return 1
        fi
        
        log "SUCCESS" "Endpoint $endpoint validated successfully (${latency_ms}ms)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        success=true
        return 0
    done
    
    return 1
}

# Function to send Slack notification
send_slack_notification() {
    local status=$1
    local message=$2
    
    if [ -z "$SLACK_WEBHOOK" ]; then
        log "INFO" "SLACK_WEBHOOK not configured, skipping notification"
        return 0
    fi
    
    local color="good"
    if [ "$status" = "failure" ]; then
        color="danger"
    fi
    
    local payload=$(cat <<EOF
{
    "attachments": [
        {
            "color": "$color",
            "title": "Health Check $status",
            "text": "$message",
            "fields": [
                {
                    "title": "Total Checks",
                    "value": "$TOTAL_CHECKS",
                    "short": true
                },
                {
                    "title": "Passed",
                    "value": "$PASSED_CHECKS",
                    "short": true
                },
                {
                    "title": "Failed",
                    "value": "$FAILED_CHECKS",
                    "short": true
                }
            ],
            "footer": "Health Check Script",
            "ts": $(date +%s)
        }
    ]
}
EOF
)
    
    curl -s -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK" > /dev/null
    log "INFO" "Slack notification sent"
}

# Main health check execution
echo ""
log "INFO" "=== Starting Health Checks ==="
echo ""

# Check /health endpoint
check_endpoint "/health" "ok,kv,now,region" "Cloudflare Pages health endpoint"

# Check /api/mrketoz.json endpoint
check_endpoint "/api/mrketoz.json" "stage,branch,updated_at" "MrketOz pipeline status"

# Check /api/registrar.json endpoint
check_endpoint "/api/registrar.json" "domain,dnssec,nameservers" "Domain registrar information"

# Check /api/planet.json endpoint
check_endpoint "/api/planet.json" "note" "Planet touch configuration"

# Summary
echo ""
log "INFO" "=== Health Check Summary ==="
log "INFO" "Total checks: $TOTAL_CHECKS"
log "INFO" "Passed: $PASSED_CHECKS"
log "INFO" "Failed: $FAILED_CHECKS"
echo ""

# Final status
if [ $FAILED_CHECKS -eq 0 ]; then
    log "SUCCESS" "All health checks passed!"
    send_slack_notification "success" "All $TOTAL_CHECKS health checks passed successfully"
    exit 0
else
    log "ERROR" "$FAILED_CHECKS health check(s) failed"
    send_slack_notification "failure" "$FAILED_CHECKS out of $TOTAL_CHECKS health checks failed. Check logs for details."
    exit 1
fi
