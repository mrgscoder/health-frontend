# Medicine Tracking API Integration

This document describes the integration of the medicine tracking feature with the backend API.

## Overview

The medicine tracking feature now uses a hybrid approach:
- **Primary**: Backend API calls for data persistence
- **Fallback**: AsyncStorage for offline functionality
- **Synchronization**: Automatic sync between API and local storage

## API Endpoints

### Base URL
```
http://192.168.1.16:5001/api
```

### Medication Endpoints
- `GET /medicines/getmed` - Get all medications for user
- `POST /medicines/postmed` - Add new medication
- `PUT /medicines/updatemed/:id` - Update medication
- `DELETE /medicines/deletemed/:id` - Delete medication

### Schedule Endpoints
- `GET /medicines/getschedules` - Get all schedules for user
- `POST /medicines/postschedule` - Add new schedule
- `DELETE /medicines/deleteschedule/:id` - Delete schedule

### Dose Log Endpoints
- `GET /medicines/getlogs` - Get all dose logs for user
- `POST /medicines/postlog` - Add new dose log
- `PUT /medicines/updatelog/:id` - Update dose log

## Files Modified

### 1. `apiService.ts` (New)
- Handles all API communication
- Manages authentication tokens
- Provides error handling and fallback mechanisms

### 2. `storageManager.ts` (Updated)
- Now uses `ApiService` for primary data operations
- Maintains AsyncStorage as fallback
- Provides seamless transition between online/offline modes

### 3. Backend Files
- `backend/controllers/medicationController.js` - Added new endpoints
- `backend/routes/medicationRoutes.js` - Updated routes

## How It Works

### Data Flow
1. **Read Operations**: API first → AsyncStorage fallback
2. **Write Operations**: API first → AsyncStorage backup
3. **Error Handling**: Graceful fallback to AsyncStorage
4. **Synchronization**: Local storage updated after successful API calls

### Authentication
- Uses JWT tokens stored in AsyncStorage
- Automatically includes Authorization header
- Handles token expiration gracefully

### Offline Support
- All operations work offline using AsyncStorage
- Data syncs when connection is restored
- No data loss during network issues

## Usage

### For Developers
The existing components continue to work without changes:

```typescript
// These calls now use API + fallback automatically
const medications = await StorageManager.getMedications();
await StorageManager.addMedication(medication);
await StorageManager.updateMedication(medication);
await StorageManager.deleteMedication(medicationId);
```

### Testing
Use the test functions in `testApi.ts`:

```typescript
import { testApiIntegration, testStorageManagerIntegration } from './utils/testApi';

// Test API integration
await testApiIntegration();

// Test StorageManager integration
await testStorageManagerIntegration();
```

## Database Schema

The backend uses these tables:
- `medications` - Medication information
- `medication_schedules` - Dosing schedules
- `dose_logs` - Dose tracking logs

All tables include user_id for data isolation.

## Error Handling

### Network Errors
- Automatic fallback to AsyncStorage
- Retry mechanisms for failed operations
- User-friendly error messages

### Authentication Errors
- Token refresh handling
- Automatic logout on auth failure
- Clear error messaging

## Migration from AsyncStorage

The system automatically handles migration:
1. Existing AsyncStorage data is preserved
2. New data goes to API first
3. Gradual migration as users interact with the app
4. No data loss during transition

## Performance Considerations

### Caching
- Local storage acts as cache
- Reduces API calls for frequently accessed data
- Automatic cache invalidation

### Batch Operations
- Multiple operations are batched where possible
- Reduces network overhead
- Improves user experience

## Security

### Data Protection
- JWT authentication for all endpoints
- User data isolation
- Input validation and sanitization

### Token Management
- Secure token storage in AsyncStorage
- Automatic token refresh
- Secure token disposal on logout

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check network connectivity
   - Verify server is running
   - Check API base URL configuration

2. **Authentication Errors**
   - Verify user is logged in
   - Check token validity
   - Clear and re-login if needed

3. **Data Sync Issues**
   - Check console for error messages
   - Verify database connectivity
   - Test with `testApiIntegration()`

### Debug Mode
Enable detailed logging by setting:
```typescript
// In apiService.ts
const DEBUG_MODE = true;
```

## Future Enhancements

1. **Real-time Sync**: WebSocket integration for live updates
2. **Conflict Resolution**: Handle concurrent edits
3. **Bulk Operations**: Optimize for large datasets
4. **Push Notifications**: Server-side reminder system
5. **Analytics**: Track medication adherence patterns 