# 🚀 Run Database Seed Script

## ✅ I've Created Everything You Need!

### What's Ready:
1. ✅ **Seed Script**: `server/scripts/createTestSubmissions.js`
2. ✅ **NPM Command**: `npm run db:seed`
3. ✅ **Documentation**: Complete setup guide

## 🎯 How to Run the Script

### Option 1: Using NPM (Recommended)

**Open a NEW terminal** (keep your dev server running in the other one):

```bash
npm run db:seed
```

### Option 2: Direct Node Command

If npm doesn't work, run directly:

```bash
node server/scripts/createTestSubmissions.js
```

### Option 3: Fix PowerShell Policy (If Needed)

If you get "execution policy" error:

```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again:
npm run db:seed
```

## 📋 What Will Happen

When you run the script, it will:

1. ✅ Connect to your MongoDB database
2. ✅ Find your instructor account
3. ✅ Create 5 test students
4. ✅ Create 1 test exam with 5 questions
5. ✅ Create 3 student submissions
6. ✅ Show you the exam ID and details

## 🎯 Expected Output

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
👨‍🏫 Found instructor: Your Name

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
- Exam ID: [Your Exam ID]
- Total Questions: 5
- Total Marks: 100
- Students: 5
- Submissions: 3

✅ You can now test the grading feature!
```

## ✅ After Running the Script

### Step 1: Refresh Your Browser
Go to: `http://localhost:5000/instructor/exams`

### Step 2: Find the Test Exam
Look for: **"Test Exam - Mathematics & Science"**

### Step 3: View Submissions
- Click the three-dot menu (⋮)
- Click **"View Submissions (3)"**
- You'll see REAL data from database!

### Step 4: Grade a Student
- Click "View Details" on any student
- Grade the essay questions
- Click "Complete Grading"
- **Data saves to MongoDB!**

## 🔍 Verify It Worked

### Check in Browser:
1. Go to exam list
2. Look for "Test Exam - Mathematics & Science"
3. It should show "3 submissions"
4. Click "View Submissions"
5. See real student names and scores

### Check in Database:
1. Open MongoDB Compass
2. Connect to your database
3. Look at `studentexams` collection
4. You should see 3 documents

## ⚠️ Troubleshooting

### "No instructor found"
**Problem**: No instructor account exists
**Solution**: 
1. Go to `http://localhost:5000`
2. Register as instructor
3. Or create via admin panel
4. Run script again

### "Connection failed"
**Problem**: MongoDB not running or wrong connection string
**Solution**:
1. Check MongoDB is running
2. Verify `.env` file has correct `MONGODB_URI`
3. Test connection: `mongosh` or MongoDB Compass

### "Script runs but no data"
**Problem**: Wrong database or collection
**Solution**:
1. Check database name in connection string
2. Verify collections exist
3. Check server logs

### "Execution policy" error
**Problem**: PowerShell security settings
**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎓 What You Get

### Test Data Created:
- ✅ 5 student accounts
- ✅ 1 exam (100 points, 5 questions)
- ✅ 3 submissions (pending grading)

### Questions Include:
- ✅ 2 auto-graded (MCQ, True/False)
- ✅ 2 manual grading needed (Essays)
- ✅ 1 short answer (auto-graded)

### You Can Test:
- ✅ View real submissions
- ✅ Grade real exams
- ✅ Save to real database
- ✅ Update scores
- ✅ Add feedback
- ✅ Complete workflow

## 📝 Quick Commands

```bash
# Run the seed script
npm run db:seed

# Or directly
node server/scripts/createTestSubmissions.js

# Check if it worked (in mongosh)
use your_database_name
db.studentexams.find().pretty()
```

---

## 🎉 Ready to Go!

**Run the command now:**
```bash
npm run db:seed
```

**Then test the real grading feature with actual database operations!** 🚀
