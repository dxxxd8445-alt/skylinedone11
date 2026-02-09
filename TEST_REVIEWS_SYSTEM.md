# 🧪 REVIEWS SYSTEM - TESTING GUIDE

## ⚠️ IMPORTANT: Run SQL First!

Before testing, you MUST run this SQL in Supabase:
```
Open: magma src/REVIEWS_APPROVAL_SYSTEM.sql
Copy all content → Paste in Supabase SQL Editor → Run
```

## 📝 Test Checklist

### ✅ Step 1: Test Customer Review Submission

1. **Go to Reviews Page**
   - URL: `https://skylinecheats.org/reviews`
   - Should see existing reviews (if any approved)

2. **Click "Write a Review" Button**
   - Blue button near top of page
   - Should open modal with form

3. **Fill Out Review Form**
   - Username: `TestUser123`
   - Rating: Click 5 stars
   - Review Text: `This is an amazing product! Works perfectly and support is great.`
   - Image: (optional) Upload a screenshot
   - Should see close X button in top-right

4. **Submit Review**
   - Click "Submit Review" button
   - Should see success toast: "Your review is pending approval..."
   - Modal should close
   - Review should NOT appear on page yet (needs approval)

### ✅ Step 2: Test Admin Review Management

1. **Go to Admin Reviews Page**
   - URL: `https://skylinecheats.org/mgmt-x9k2m7/reviews`
   - Password: `Sk7yL!n3_Adm1n_2026_X9k2M7pQ`

2. **Check Dashboard Stats**
   - Should see: Total Reviews, Pending, Approved counts
   - Pending count should be 1 (your test review)

3. **View Pending Review**
   - Click "Pending" filter button (yellow)
   - Should see your test review with yellow "PENDING" badge
   - Should show username, rating, text, date

4. **Test Search**
   - Type "TestUser" in search box
   - Should filter to show only matching reviews

5. **Test Filters**
   - Click "All" - shows all reviews
   - Click "Pending" - shows only unapproved
   - Click "Approved" - shows only approved

### ✅ Step 3: Test Approve Workflow

1. **Approve the Review**
   - Find your test review in Pending filter
   - Click green "Approve" button
   - Should see success toast: "Review Approved"
   - Badge should change from yellow "PENDING" to green "APPROVED"

2. **Verify on Public Page**
   - Go back to: `https://skylinecheats.org/reviews`
   - Your review should NOW be visible!
   - Should show with 5 stars, username, text

3. **Check Admin Filters**
   - Go back to admin reviews page
   - Click "Approved" filter
   - Your review should be there
   - Click "Pending" filter
   - Your review should NOT be there (it's approved now)

### ✅ Step 4: Test Delete Function

1. **Create Another Test Review**
   - Go to `/reviews` page
   - Click "Write a Review"
   - Submit another test review
   - Username: `DeleteMe`
   - Rating: 3 stars
   - Text: `This is a test review to delete`

2. **Delete from Admin**
   - Go to admin reviews page
   - Find the "DeleteMe" review in Pending
   - Click red "Delete" button
   - Confirm deletion in popup
   - Should see success toast: "Review Deleted"
   - Review should disappear from list

3. **Verify Deletion**
   - Refresh the page
   - Review should still be gone
   - Check public page - should not appear there either

### ✅ Step 5: Test Edge Cases

1. **Empty Review Text**
   - Try submitting with less than 10 characters
   - Submit button should be disabled
   - Should see character counter

2. **No Rating Selected**
   - Try submitting without selecting stars
   - Submit button should be disabled

3. **Close Modal**
   - Open review modal
   - Click X button in top-right
   - Modal should close
   - Form should reset

4. **Multiple Reviews**
   - Submit 3-4 test reviews
   - Approve some, leave some pending
   - Test that filters work correctly
   - Test that search works across all

## 🎯 Expected Results

### Customer Side:
- ✅ Can write and submit reviews easily
- ✅ See pending approval message
- ✅ Reviews don't show until approved
- ✅ Modal has close button
- ✅ Form validation works

### Admin Side:
- ✅ See all reviews (pending + approved)
- ✅ Stats show correct counts
- ✅ Can filter by status
- ✅ Can search reviews
- ✅ Can approve with one click
- ✅ Can delete with confirmation
- ✅ Changes reflect immediately

## 🐛 Troubleshooting

### Reviews Not Showing in Admin
- Check you ran the SQL script
- Check you're logged in as admin
- Check browser console for errors

### Can't Submit Review
- Check form validation (10+ chars, rating selected)
- Check browser console for errors
- Check Supabase logs

### Approve/Delete Not Working
- Check you ran the SQL script (RLS policies)
- Check admin permissions
- Check browser console for errors

## ✅ Success Criteria

All of these should work:
- [x] Customer can submit reviews
- [x] Reviews start as pending
- [x] Admin can see all reviews
- [x] Admin can approve reviews
- [x] Admin can delete reviews
- [x] Approved reviews show on public page
- [x] Pending reviews hidden from public
- [x] Search and filters work
- [x] Stats are accurate
- [x] Close button works on modal

## 🚀 Ready for Production!

Once all tests pass, the system is ready for real customer reviews!
