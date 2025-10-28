# 🎯 Setup Test Data for Grading Feature

## Quick Start - Create Test Submissions

I've created a script that will populate your database with test student submissions so you can test the real grading feature!

## 📋 What the Script Creates

### 5 Test Students:
1. John Smith (john.smith@test.com)
2. Sarah Johnson (sarah.johnson@test.com)
3. Mike Davis (mike.davis@test.com)
4. Emily Wilson (emily.wilson@test.com)
5. David Brown (david.brown@test.com)

### 1 Test Exam with 5 Questions:
1. **Multiple Choice** (10 points) - "What is 2 + 2?"
2. **True/False** (10 points) - "Is the Earth flat?"
3. **Essay** (25 points) - "Explain the Pythagorean theorem" ⏳ Needs grading
4. **Short Answer** (15 points) - "What is the capital of France?"
5. **Essay** (40 points) - "Describe photosynthesis" ⏳ Needs grading

**Total: 100 points**

### 3 Student Submissions:
- **John Smith**: 35/100 (35%) - 2 questions need grading
- **Sarah Johnson**: 35/100 (35%) - 2 questions need grading
- **Mike Davis**: 25/100 (25%) - 2 questions need grading

## 🚀 How to Run

### Step 1: Make Sure Server is Running
The database connection needs to be active:
```bash
npm run dev
```

### Step 2: Open a New Terminal
Keep the server running, open another terminal window

### Step 3: Run the Seed Script
```bash
npm run db:seed
```

### Expected Output:
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
👨‍🏫 Found instructor: [Your Instructor Name]

📝 Creating test students...
✅ Created student: John Smith
✅ Created student: Sarah Johnson
✅ Created student: Mike Davis
✅ Created student: Emily Wilson
✅ Created student: David Brown

📚 Finding or creating test exam...
✅ Created test exam: Test Exam - Mathematics & Science

📝 Creating test submissions...
✅ Created submission for John Smith - Score: 35/100
✅ Created submission for Sarah Johnson - Score: 35/100
✅ Created submission for Mike Davis - Score: 25/100

🎉 Test submissions created successfully!

📊 Summary:
- Exam: Test Exam - Mathematics & Science
- Exam ID: 507f1f77bcf86cd799439011
- Total Questions: 5
- Total Marks: 100
- Students: 5
- Submissions: 3

✅ You can now test the grading feature!

🔗 Navigate to: /instructor/exams
   Then click "View Submissions" on the test exam
```

## 🧪 Testing the Real Grading Flow

### Step 1: View Submissions
1. Go to: `http://localhost:5000/instructor/exams`
2. Find "Test Exam - Mathematics & Science"
3. Click the three-dot menu (⋮)
4. Click **"View Submissions (3)"**

### Step 2: See Real Data
You should now see **REAL data from the database**:
- ✅ 3 actual student submissions
- ✅ Real names and emails
- ✅ Actual scores from database
- ✅ Grading status (Pending)

### Step 3: Grade a Student
1. Click **"View Details"** on any student
2. You'll see:
   - ✅ Questions 1, 2, 4 already auto-graded
   - ⏳ Questions 3, 5 need manual grading
3. Enter scores for essay questions:
   - Question 3: Enter 0-25 points
   - Question 5: Enter 0-40 points
4. Add feedback (optional)
5. Click **"Complete Grading"**

### Step 4: Verify Database Update
The grading will be **saved to MongoDB**:
- ✅ Scores updated
- ✅ Feedback saved
- ✅ Status changed to "complete"
- ✅ Timestamp recorded

### Step 5: Check Results
1. You'll be redirected back to submissions list
2. The graded student will show:
   - ✅ Updated score
   - ✅ "Graded" status
   - ✅ New percentage

## 🔍 Verify in Database

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to your database
3. Go to `studentexams` collection
4. Find the submission you graded
5. Check the fields:
   ```json
   {
     "score": 85,
     "percentage": 85,
     "gradingStatus": "complete",
     "gradedAt": "2024-01-15T10:30:00Z",
     "answers": [
       {
         "score": 20,
         "feedback": "Your feedback here",
         "gradingStatus": "manually_graded"
       }
     ]
   }
   ```

## 🔄 Run Script Again

If you want to reset or add more data:
```bash
npm run db:seed
```

**Note**: The script checks for existing data and won't create duplicates.

## ⚠️ Troubleshooting

### Error: "No instructor found"
**Solution**: Make sure you have an instructor account in your database.
```bash
# Create instructor via registration or admin panel
```

### Error: "Connection failed"
**Solution**: Check your MongoDB connection string in `.env`
```
MONGODB_URI=mongodb://localhost:27017/your-database
```

### Script runs but no data appears
**Solution**: 
1. Check MongoDB is running
2. Verify database name in connection string
3. Check server logs for errors

## 📊 What You Can Test Now

### ✅ Real Database Operations:
- View submissions from database
- Grade submissions
- Save to database
- Update scores
- Add feedback
- Change status

### ✅ Complete Workflow:
1. View exam submissions (from DB)
2. Click "View Details" (fetches from DB)
3. Grade questions (validates input)
4. Submit grading (saves to DB)
5. Redirect back (shows updated data)
6. Grade next student (repeat)

### ✅ Data Persistence:
- Refresh page → Data persists
- Close browser → Data persists
- Restart server → Data persists
- Everything saved in MongoDB!

## 🎓 Next Steps

After testing with seed data:

1. **Create Real Student Accounts**
   - Register students via signup
   - Or create via admin panel

2. **Publish Real Exams**
   - Create exams with your questions
   - Set schedule and duration
   - Publish to students

3. **Students Take Exams**
   - Students log in
   - Take and submit exams
   - Real submissions created

4. **Grade Real Submissions**
   - Same workflow as test data
   - All saves to database
   - Students see results

## 🎉 Summary

✅ **Script Created**: `server/scripts/createTestSubmissions.js`
✅ **NPM Command**: `npm run db:seed`
✅ **Creates**: 5 students, 1 exam, 3 submissions
✅ **Purpose**: Test real database grading
✅ **Result**: No more demo mode!

---

**Run `npm run db:seed` now to create test data and start testing real database grading!** 🚀
