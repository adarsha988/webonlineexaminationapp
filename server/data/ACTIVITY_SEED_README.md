# Activity Seed Data Documentation

## Overview
The activity seed data creates realistic activity records for the admin dashboard's Recent Activity section. This provides sample data for testing and demonstration purposes.

## File Location
- **Seed File**: `server/data/activitySeedData.js`
- **Model**: `server/models/activity.model.js`
- **Used By**: `server/data/comprehensiveSeedData.js`

## Activity Types Supported

The activity model supports the following types (as defined in the schema enum):

### User Activities
- `user_created` - When a new user account is created
- `user_updated` - When user information is modified
- `user_login` - User login events
- `user_logout` - User logout events
- `user_activated` - When an account is activated
- `user_deactivated` - When an account is deactivated

### Exam Activities
- `exam_created` - New exam creation
- `exam_updated` - Exam modifications
- `exam_published` - When an exam is published
- `exam_taken` - Student takes an exam

### Profile Activities
- `profile_updated` - User profile changes
- `password_changed` - Password modifications
- `role_changed` - User role updates

### Question Bank Activities
- `question_created` - New question added
- `question_updated` - Question modifications
- `question_deleted` - Question removal
- `question_approved` - Question approval
- `question_suggested` - Question suggestions
- `question_imported` - Bulk question import
- `question_exported` - Question export

### Shared Bank Activities
- `shared_bank_created` - New shared bank creation
- `shared_bank_updated` - Shared bank modifications
- `shared_bank_deleted` - Shared bank removal
- `collaborator_added` - Collaborator addition
- `collaborator_removed` - Collaborator removal
- `permission_changed` - Permission updates

## Seed Data Details

### Total Records
The seed creates **21 activity records** spanning different time periods:
- Today: 4 activities
- Yesterday: 3 activities
- 2 days ago: 3 activities
- 3 days ago: 2 activities
- 1 week ago: 3 activities
- 2 weeks ago: 3 activities
- Other dates: 3 activities

### Activity Distribution
```
user_login: 3 records
exam_created: 2 records
user_created: 1 record
question_created: 1 record
profile_updated: 1 record
exam_published: 1 record
role_changed: 1 record
question_updated: 1 record
password_changed: 1 record
exam_updated: 1 record
user_activated: 1 record
shared_bank_created: 1 record
user_logout: 1 record
question_approved: 1 record
user_deactivated: 1 record
collaborator_added: 1 record
question_imported: 1 record
permission_changed: 1 record
```

## Data Structure

Each activity record includes:

```javascript
{
  user: ObjectId,           // Reference to User who performed action
  type: String,            // Activity type (from enum)
  description: String,     // Human-readable description
  metadata: Object,        // Additional context-specific data
  ipAddress: String,       // IP address of user
  userAgent: String,       // Browser/device info (optional)
  createdAt: Date,        // Timestamp (auto-generated)
  updatedAt: Date         // Timestamp (auto-generated)
}
```

## Usage

### Automatic Seeding
The activity seed runs automatically when you start the server if activities don't exist:

```bash
npm run dev
```

### Manual Seeding
To run the seed independently:

```javascript
import { seedActivityData } from './data/activitySeedData.js';

await seedActivityData();
```

### Reset Activities
To clear and reseed activities:

```javascript
import Activity from './models/activity.model.js';
import { seedActivityData } from './data/activitySeedData.js';

await Activity.deleteMany({});  // Clear all activities
await seedActivityData();        // Reseed
```

### Via API
Admin users can delete all activities using the DELETE endpoint:

```bash
DELETE /api/recent-activities
Authorization: Bearer {admin_token}
```

## Prerequisites

The seed function requires existing users in the database:
- At least 1 admin user
- At least 3 instructor users
- At least 5 student users

If users don't exist, the seed will skip with a warning message.

## Metadata Examples

### User Login
```javascript
metadata: {
  loginTime: Date,
  userAgent: String,
  loginMethod: String
}
```

### Exam Created
```javascript
metadata: {
  examTitle: String,
  subject: String,
  duration: Number,
  totalMarks: Number
}
```

### Question Imported
```javascript
metadata: {
  importFormat: String,
  totalQuestions: Number,
  successfulImports: Number,
  failedImports: Number,
  subject: String
}
```

### Role Changed
```javascript
metadata: {
  targetUserId: ObjectId,
  oldRole: String,
  newRole: String
}
```

## Testing

After seeding, verify activities are created:

```javascript
// Count all activities
const count = await Activity.countDocuments();
console.log(`Total activities: ${count}`);

// Group by type
const byType = await Activity.aggregate([
  { $group: { _id: '$type', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
console.log('Activities by type:', byType);
```

## Integration

The activity seed is integrated with:
1. **ComprehensiveSeedData** - Called during full database seeding
2. **Admin Dashboard** - Displays in Recent Activity section
3. **Activity Routes** - Can be queried via `/api/recent-activities`

## Notes

- Activities use realistic timestamps spanning 2 weeks
- IP addresses are sample local network addresses (192.168.1.x)
- Each activity is tied to actual user records
- The seed is idempotent - won't create duplicates if activities exist
- Metadata structure varies based on activity type
- All timestamps are generated relative to current server time

## Maintenance

To add new activity types:
1. Update the enum in `activity.model.js`
2. Add corresponding seed data in `activitySeedData.js`
3. Update this documentation

## Delete All Functionality

Admins can delete all activities via:
- **Frontend**: Admin Dashboard → Recent Activity → "Delete All" button
- **Backend**: DELETE `/api/recent-activities` (admin only)
- **Database**: Logs the deletion action for audit trail
