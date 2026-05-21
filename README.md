# 🎾 Sunset Spin Invitational - Tennis Tournament Registration Website

A professional, modern website for the **Sunset Spin Invitational** tennis organization. This site showcases tournaments, events, and provides seamless Google Forms integration for tournament registration.

## 🌟 Features

✅ **Professional Design** - Modern UI reflecting the prestige of the organization  
✅ **Tournament Showcase** - Display multiple tournaments with detailed information  
✅ **Google Forms Integration** - Embedded registration forms for easy sign-ups  
✅ **Responsive Design** - Perfect on desktop, tablet, and mobile devices  
✅ **Smooth Animations** - Engaging scroll animations and transitions  
✅ **Contact Information** - Easy-to-find contact details and social links  
✅ **Tournament Information** - Comprehensive details about entry fees, dates, levels, and locations  

## 📋 Files Included

- **index.html** - Main website structure
- **styles.css** - Complete styling and responsive design
- **script.js** - Interactive functionality
- **README.md** - Documentation

## 🚀 How to Set Up & Publish

### Step 1: Create a Google Form

1. Visit [Google Forms](https://forms.google.com)
2. Create a new form with these fields:
   - **Full Name** (Short answer) - Required
   - **Email Address** (Email) - Required
   - **Phone Number** (Short answer) - Required
   - **Select Tournament** (Multiple choice):
     - Summer Invitational Championship
     - Spring Open Championship
     - Fall Pro-Am Invitational
     - Monthly Round-Robin Series
   - **Division/Category** (Multiple choice):
     - Men's Singles
     - Women's Singles
     - Mixed Doubles
     - Youth (U12, U14, U18)
   - **Skill Level** (Multiple choice):
     - Beginner
     - Intermediate
     - Advanced
     - Professional
   - **USTA Rating** (Short answer) - Optional
   - **Partner Name (for doubles)** (Short answer) - Optional
   - **Additional Comments** (Paragraph)
   - **Terms & Conditions** (Checkbox) - Required

3. In form settings: Enable "Collect email addresses"

### Step 2: Get Your Google Form ID

1. Open your form in edit mode
2. Look at the URL: `https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform`
3. Copy the `YOUR_FORM_ID` part

### Step 3: Update index.html

Find this line in `index.html` (around line 165):
```html
<iframe 
    src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
```

Replace `YOUR_FORM_ID` with your actual form ID.

### Step 4: Customize Your Information

Update these sections in `index.html`:

**Email Addresses** (around line 240):
```html
<p><a href="mailto:your-email@sunsetspininvitational.com">your-email@sunsetspininvitational.com</a></p>
```

**Phone Number** (around line 243):
```html
<p><a href="tel:+1-555-YOUR-NUMBER">+1 (555) YOUR-NUMBER</a></p>
```

**Location** (around line 250):
```html
<p>Your Tennis Complex</p>
<p>Your Address</p>
```

**Social Media** (around line 258):
```html
<a href="YOUR_FACEBOOK_URL" target="_blank">Facebook</a>
<a href="YOUR_INSTAGRAM_URL" target="_blank">Instagram</a>
```

### Step 5: Publish on GitHub Pages (Free Option)

1. **Commit your files** to the `main` branch
2. **Go to repository settings**: Click "Settings" in your repo
3. **Enable GitHub Pages**:
   - Scroll to "GitHub Pages" section
   - Source: Select "Deploy from a branch"
   - Branch: Select "main"
   - Click "Save"
4. **Your site is live!** at: `https://lynn0130tennis.github.io/sunsetspin/`

**It typically takes 1-2 minutes to go live.**

### Alternative Publishing Options

**Option 2: Netlify (Free)**
1. Push files to GitHub
2. Go to [Netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub account
5. Select your repository
6. Deploy (automatic from main branch)

**Option 3: Vercel (Free)**
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Deploy (auto-deploys on push)

**Option 4: Custom Domain**
After publishing to GitHub Pages:
1. Buy domain (GoDaddy, Namecheap, etc.)
2. Go to repository Settings → Pages
3. Under "Custom domain" enter your domain
4. Point domain DNS to GitHub Pages (instructions provided)

## ✏️ Customizing the Website

### Update Tournament Information

Edit the tournament cards in `index.html` (around lines 90-130):

```html
<div class="tournament-card">
    <div class="tournament-badge">Season</div>
    <h3>Your Tournament Name</h3>
    <p><strong>Dates:</strong> Your Dates</p>
    <p><strong>Divisions:</strong> Your Divisions</p>
    <p><strong>Levels:</strong> Your Levels</p>
    <p><strong>Location:</strong> Your Location</p>
    <p><strong>Entry Fee:</strong> Your Fee</p>
    <p>Your description</p>
</div>
```

### Change Colors

Edit `styles.css` to update the color scheme:
- Primary Gold: `#f39c12` → Your color
- Orange: `#e67e22` → Your color
- Red (CTA): `#e74c3c` → Your color

### Update Organization Stats

Edit the stats section in `index.html` (around lines 50-60):

```html
<div class="stat">
    <h3>Your Number</h3>
    <p>Your Description</p>
</div>
```

## 🔧 Troubleshooting

### Google Form Not Loading
- ✓ Verify your form ID is correct
- ✓ Ensure form is published (not in preview mode)
- ✓ Check form settings allow "Anyone can fill this out"
- ✓ Clear browser cache (Ctrl+Shift+Delete)

### Website Not Live on GitHub Pages
- ✓ Wait 1-2 minutes after enabling Pages
- ✓ Check that files are on "main" branch
- ✓ Verify index.html is in root directory
- ✓ Try a different browser

### Form Submissions Not Received
- ✓ Check that Google Form is accepting responses
- ✓ Verify all required fields are filled
- ✓ Check spam folder for confirmation emails

### Mobile Display Issues
- ✓ Hard refresh browser (Ctrl+Shift+R)
- ✓ Test on actual mobile device
- ✓ Check browser console (F12) for errors

## 📊 Track Registrations

### View Form Responses
1. Open your Google Form
2. Click "Responses" tab
3. All registrations appear here

### Export to Google Sheets
1. Open Google Form → Responses
2. Click the "Sheets" icon (📊)
3. A Google Sheet will auto-create with all responses
4. Responses sync in real-time

### Receive Email Notifications
1. Open Google Form → Settings
2. Enable "Get email notifications for each response"
3. Receive email alerts for new registrations

## 📱 Browser & Device Support

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Design Features

- **Responsive Grid Layouts** - Adapts to all screen sizes
- **Smooth Animations** - Fade-in effects on scroll
- **Professional Color Scheme** - Gold/orange professional branding
- **Hover Effects** - Interactive cards and buttons
- **Mobile Optimized** - Touch-friendly interface

## 📝 Additional Enhancements to Consider

1. **Payment Integration** - Add Stripe/PayPal for tournament fees
2. **Email Automation** - Use Zapier for auto-confirmations
3. **Photo Gallery** - Showcase tournament photos
4. **Testimonials** - Player reviews and feedback
5. **Results Section** - Past tournament rankings
6. **Blog** - Tennis tips and updates
7. **Newsletter** - Email signup form

## 🆘 Need Help?

**For Google Forms Issues:**
- [Google Forms Help](https://support.google.com/docs/answer/87809)

**For GitHub Pages:**
- [GitHub Pages Docs](https://docs.github.com/en/pages)

**For General Web Questions:**
- [MDN Web Docs](https://developer.mozilla.org)

## ✅ Quick Checklist Before Publishing

- [ ] Created Google Form with all fields
- [ ] Copied Google Form ID
- [ ] Updated `index.html` with form ID
- [ ] Updated contact information
- [ ] Updated tournament details
- [ ] Pushed all 4 files to GitHub (index.html, styles.css, script.js, README.md)
- [ ] Enabled GitHub Pages in Settings
- [ ] Website is live at your GitHub Pages URL

## 📞 Contact Information to Update

Default placeholder info in the website:
- Email: `info@sunsetspininvitational.com`
- Phone: `+1 (555) 836-6471`
- Location: `Sunset Tennis Complex, 123 Tennis Court Way, Sunset Valley, CA 90210`

**Remember to update these with your actual contact details!**

---

**🎾 Your Sunset Spin Invitational website is ready to go live! 🎾**

**Need assistance? Feel free to reach out or check the troubleshooting section above.**
