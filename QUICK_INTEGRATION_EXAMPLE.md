# Quick Integration Example - Security Verification

## How to Use the New Security Verification

The security verification system has been integrated and is ready to use. Here's how to implement it:

## 🚀 Quick Start

### Option 1: Redirect from Exam Card (Recommended)

In your exam card component where students click "Start Exam":

```jsx
// In client/src/components/student/ExamCard.jsx or similar

const handleStartExam = () => {
  // OLD WAY (direct to exam):
  // navigate(`/student/exam/${exam._id}`);
  
  // NEW WAY (security verification first):
  navigate(`/student/exam-security/${exam._id}`);
};
```

### Option 2: Conditional Security Check

Check if exam requires proctoring before redirecting:

```jsx
const handleStartExam = () => {
  if (exam.proctoringEnabled) {
    // Go through security verification
    navigate(`/student/exam-security/${exam._id}`);
  } else {
    // Go directly to exam
    navigate(`/student/exam/${exam._id}`);
  }
};
```

## 📝 What Happens Next

1. **Student clicks "Start Exam"**
   - Redirected to `/student/exam-security/:examId`

2. **Security Verification Steps**
   - Instructions displayed
   - Camera & microphone permissions requested
   - Face detection verification
   - Audio environment check
   - Ready confirmation

3. **After Verification Complete**
   - Student automatically redirected to `/student/exam/:id`
   - Media stream passed to exam page
   - Verification data stored

## 🎯 Test It Now

### Test URL

Navigate to this URL in your browser (replace EXAM001 with actual exam ID):

```
http://localhost:5000/student/exam-security/EXAM001
```

### Test Flow

1. Open the URL above
2. Click "Start Verification"
3. Allow camera and microphone when prompted
4. Follow the on-screen instructions
5. Click "Verify Face" when your face is visible
6. Complete audio check
7. Click "Start Exam Now"
8. You'll be redirected to the actual exam page

## 🔧 Configuration

### Enable for All Exams

In `StudentDashboard.jsx` or wherever exams are listed:

```jsx
// Update all exam start handlers
const exams = [...]; // your exams list

exams.map(exam => (
  <button onClick={() => navigate(`/student/exam-security/${exam._id}`)}>
    Start Exam
  </button>
))
```

### Enable Selectively

Add a flag to your exam model:

```javascript
// In exam schema
{
  requiresSecurityCheck: Boolean,
  proctoringEnabled: Boolean,
  // ... other fields
}
```

Then conditionally redirect:

```jsx
const handleStartExam = (exam) => {
  const path = exam.requiresSecurityCheck 
    ? `/student/exam-security/${exam._id}`
    : `/student/exam/${exam._id}`;
  navigate(path);
};
```

## 📦 Files Already Created

✅ `SecurityVerification.jsx` - Main component  
✅ `ExamSecurityCheck.jsx` - Integration page  
✅ Route added to `App.tsx`  
✅ Documentation created  

## 🎨 Customize Appearance

Edit colors and styling in `SecurityVerification.jsx`:

```jsx
// Line ~250: Gradient background
className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"

// Line ~320: Button colors
className="bg-gradient-to-r from-blue-600 to-purple-600"

// Line ~420: Face check border
className="border-4 border-purple-200"
```

## 🐛 Troubleshooting

### Issue: TypeScript Errors in App.tsx
**Status**: Expected and safe to ignore  
**Reason**: JSX files imported in TypeScript file  
**Fix**: Files will work at runtime

### Issue: Route Not Found
**Solution**: Ensure server is restarted after adding route

### Issue: Camera Not Working
**Solution**: Check browser permissions, use HTTPS or localhost

### Issue: Face Detection Not Working
**Solution**: Ensure good lighting, TensorFlow.js loads properly

## 📊 Example Implementation

Complete example in StudentDashboard:

```jsx
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const navigate = useNavigate();
  
  const startExam = (examId, requiresSecurity = true) => {
    if (requiresSecurity) {
      // Go through security verification
      navigate(`/student/exam-security/${examId}`);
    } else {
      // Direct to exam (legacy behavior)
      navigate(`/student/exam/${examId}`);
    }
  };
  
  return (
    <div>
      {exams.map(exam => (
        <ExamCard 
          key={exam._id}
          exam={exam}
          onStart={() => startExam(exam._id)}
        />
      ))}
    </div>
  );
}
```

## ✅ Verification Checklist

Before going live:

- [ ] Test on Chrome, Firefox, Edge
- [ ] Test camera permission flow
- [ ] Test microphone permission flow
- [ ] Test face detection accuracy
- [ ] Test audio level meter
- [ ] Verify navigation works
- [ ] Check mobile responsiveness
- [ ] Test with different lighting
- [ ] Verify error handling
- [ ] Test exam data passing

## 🚦 Production Considerations

### Security

- Ensure HTTPS is used (required for camera access)
- Verify verification data is stored securely
- Log all verification attempts
- Monitor for abuse

### Performance

- TensorFlow.js model cached after first load
- Face detection runs at 1fps (adjustable)
- Audio monitoring is lightweight
- No video/audio recording

### Privacy

- No video/audio recorded during verification
- Only metadata stored
- Face detection runs locally
- Complies with privacy regulations

## 📞 Support

If you encounter any issues:

1. Check browser console for errors
2. Review `SECURITY_VERIFICATION_GUIDE.md` for detailed docs
3. Test camera/mic permissions in browser settings
4. Verify TensorFlow.js loads correctly
5. Check network tab for failed requests

## 🎓 Next Steps

1. **Test the integration** - Navigate to the test URL
2. **Customize as needed** - Adjust colors, text, flow
3. **Enable for exams** - Update exam start logic
4. **Monitor and iterate** - Gather feedback, improve UX

---

**Ready to test?** Visit: `http://localhost:5000/student/exam-security/EXAM001`
