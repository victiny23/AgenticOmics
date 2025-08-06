# 🌍 External Access Fix

## Problem Solved
**Issue**: Application was accessible from external networks on initial startup, but lost external access after restart. When trying to access from external URLs, a "Bad Gateway" error was shown.

**Root Cause**: 
1. The standard startup script (`start-app.sh`) was not configured to use the external runtime environment URLs and ports. When restarting the application, it would default to local-only access.
2. The API Gateway was not properly configured to handle CORS requests from external domains.
3. The API Gateway routes were not using environment variables for service addresses.

## Solution Implemented ✅

### 1. **Enhanced Startup Script**
- Modified `start-app.sh` to support an `--external` flag
- Added automatic detection of runtime environment
- Configured proper port mapping for external access:
  - **Frontend**: Port 12000 → https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev
  - **API Gateway**: Port 12001 → https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev

### 2. **Improved External Access Testing**
- Enhanced `check-external-status.sh` with detailed diagnostics
- Added process and port checking
- Included troubleshooting guidance

### 3. **Persistent Configuration**
- Frontend Vite configuration is now dynamically generated with correct settings
- CORS headers are properly set for external domains
- All services bind to `0.0.0.0` when in external mode

### 4. **API Gateway Configuration**
- Updated API Gateway to use environment variables for service addresses
- Enhanced CORS configuration to allow external domains
- Added support for runtime environment URLs

## How to Use

### Start with External Access
```bash
./start-app.sh --external
```

### Test External Access
```bash
./check-external-status.sh
```

### Stop Services
```bash
./stop-app.sh
```

## External Access URLs 🌐
- **Main Application**: https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev
- **API Gateway**: https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev

## Technical Details

### Key Changes
1. Added external mode detection in startup script
2. Dynamic port configuration based on mode
3. Automatic Vite configuration generation
4. Proper CORS and host binding settings
5. Enhanced diagnostics and testing
6. API Gateway configuration with environment variables
7. CORS configuration for external domains

### Files Modified
- `start-app.sh` - Added external access support
- `check-external-status.sh` - Enhanced diagnostics
- `backend/api-gateway/src/main/resources/application.yml` - Updated API Gateway configuration
- `backend/api-gateway/src/main/java/com/agenticomics/gateway/config/CorsConfig.java` - Enhanced CORS configuration
- Created `EXTERNAL_ACCESS_FIX.md` - This documentation

## Troubleshooting

If external access still doesn't work:

1. **Check if services are running on the correct ports**:
   ```bash
   ./check-external-status.sh
   ```

2. **Verify logs for errors**:
   ```bash
   tail -f logs/frontend.log
   tail -f logs/gateway.log
   ```

3. **Restart with explicit external flag**:
   ```bash
   ./stop-app.sh
   ./start-app.sh --external
   ```

4. **Verify the URLs in your browser**:
   - https://work-1-bwktzeajbmgslino.prod-runtime.all-hands.dev
   - https://work-2-bwktzeajbmgslino.prod-runtime.all-hands.dev