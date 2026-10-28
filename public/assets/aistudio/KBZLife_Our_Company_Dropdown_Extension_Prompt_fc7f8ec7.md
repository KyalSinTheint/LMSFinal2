# KBZLife Employee Learning Portal
## Page 1 Extension — Our Company Dropdown Sections
### Build Prompt (Continue From `KBZLife_Our_Company_Page1_Build_Prompt.md`)

## 1. Context and Continuity

Continue the existing KBZLife Employee Learning Portal project and extend the previously specified **Our Company** page. Do not start a separate website or redesign the shared shell from scratch.

Preserve the existing blue-primary/white-secondary design, responsive layouts, shared header and footer, four main navigation tabs, footer-only Quick Links rule, and modular architecture.

The four main navigation tabs remain in this exact order:
1. **Our Company**
2. **Product Knowledge Hub**
3. **Learning & Development Hub**
4. **HR Hub**

## 2. Our Company Dropdown Menu

Add a dropdown menu under **Our Company** in the main navigation. It must contain these three subpages/sections in this exact order:
1. **Our Company News**
2. **Company Update Video**
3. **Top Performer**

Requirements:
- On desktop, open the dropdown on click and support keyboard navigation. Hover may be an enhancement, but must not be the only way to open it.
- On mobile, show the same options in an accessible expandable navigation item.
- Clearly indicate the active subpage/section.
- Prevent clipping, viewport overflow, and inaccessible links.
- Use real routes or real in-page navigation; no decorative controls.
- Keep the shared header/footer consistent with the previous prompt.
- Keep Quick Links in the footer only; do not add a separate Quick Links block elsewhere.

## 3. Our Company News

Create a beautiful, editorial **newspaper/news-style** page for internal company news. It should feel modern, trustworthy, readable, and premium rather than like a plain list of blog links.

### Layout
- Page title: **Our Company News**.
- A featured news area with a large image, headline, short summary, and date/category metadata when supplied.
- A responsive grid or editorial list of additional news articles.
- Each news item supports an image, headline, short excerpt, date and optional category, and a clear action to open the full article/detail view.
- Use varied but consistent image sizes to create an editorial rhythm while keeping alignment clean.
- Make typography, whitespace, image crops, and dividers intentional and polished.
- Provide an article detail view/page for longer text.
- On mobile, use a single-column layout with readable text and appropriately sized images.
- Add search/category filters only if the actual content volume makes them useful.

### Content and empty states
- Make it easy for an administrator/content editor to add an image, headline, body text, date, and category.
- Keep content separate from presentation code.
- Do not invent official news, dates, or announcements.
- Until real content is supplied, use clearly labelled demo entries or an empty state such as **“No company news has been published yet.”** Never present fake news as real announcements.
- Ensure article cards and actions work.

## 4. Company Update Video

Create a dedicated **Company Update Video** page for internal update videos hosted on YouTube.

### Video cards
- Display videos in polished, responsive cards in a clean grid.
- Each card can include a YouTube thumbnail/preview, title, optional description, optional publication date/category (only if supplied), and a play affordance.
- Use YouTube links supplied by the user or administrator. Safely validate and parse supported YouTube URL formats before embedding.
- Where appropriate, embed responsively using a privacy-enhanced YouTube embed domain. Include a descriptive iframe title and allow fullscreen.
- If a video cannot be embedded, show a clear **Watch on YouTube** link rather than a broken player.
- Do not invent video URLs, titles, thumbnails, or company update content.
- On mobile, use a single-column or compact grid without horizontal overflow.
- Show a friendly empty state if no videos have been added.

### Video content fields
Keep video content configurable with fields such as title, YouTube URL/video ID, optional description, optional publish date, and optional category. Only show optional metadata when real values exist.

## 5. Top Performer

Create a dedicated **Top Performer** section/page to recognise three channel representatives across 12 months. The design must be premium, responsive, and easy to scan.

### Channels
Each month can have one performer for each of these channels:
1. **Alliance Channel**
2. **Bancassurance Channel**
3. **Corporate Channel**

Use these labels consistently when actual performer details are available.

### Card grid and carousel behaviour
- On wide desktop screens, show **four cards side by side** in each visible row/view.
- The full year contains 12 monthly groups/sets, arranged as **three rows/sets of four cards** in a year overview.
- Each monthly card represents one month and contains the three channel performers for that month.
- Provide horizontal sliding/carousel controls to move sideways to the previous or next set of cards.
- Support mouse, touch swipe, and keyboard interaction where practical.
- Responsive behaviour: wide desktop shows four cards; tablet reduces visible cards to fit; mobile shows one card or a compact partial next-card preview with touch swipe and clear controls.
- Preserve the 12-month order and make the three sets/rows clear.
- Do not auto-advance in a way that makes content difficult to read. Prefer user-controlled sliding.

### Monthly card content
Each monthly card must:
- Display a month label (use the actual month name supplied by the site owner).
- Have a **top image area** for the performer’s photo.
- Have a **bottom information area** for the performer’s name and channel.
- Represent the three channel performers for that month: Alliance Channel, Bancassurance Channel, and Corporate Channel.
- Keep image dimensions, card heights, typography, padding, and alignment consistent.
- Crop profile photos responsively without distortion.

### Missing photos / future months
- For months or performer entries with no photo/details yet, show a neutral **silhouette/avatar placeholder with a question mark (?)** in the image area.
- For these empty placeholders, **do not show a name or channel text**. Leave the card’s information area blank until details are supplied.
- Do not invent employee names, photos, rankings, achievements, or channel assignments.
- Make the placeholder intentional and polished, not a broken-image icon.
- Use a local placeholder asset or CSS/SVG silhouette that does not depend on an external URL.
- Provide suitable accessible text without exposing nonexistent personal details.

### Data structure
Keep content data-driven. Suggested fields: month, performer photo (optional), performer name (optional), channel (optional; only one of the three approved labels), optional approved recognition note.

Show name and channel only when those fields are supplied. If no photo/details exist, render the question-mark silhouette and leave the text area blank. Do not invent a scoring method or imply a metric that has not been approved. This section displays approved recognition information; do not calculate rankings unless specified later.

## 6. Shared UI and Footer

- Retain the same header, navigation, brand colours, typography, and footer from the previous Our Company prompt.
- Keep **Quick Links only in the footer**.
- Footer Quick Links must include:
  1. Our Company
  2. Product Knowledge Hub
  3. Learning & Development Hub
  4. HR Hub
- Do not replace or reorder the four main navigation tabs.
- The three Our Company subpages are nested under Our Company, not additional top-level tabs.
- Ensure all links lead to real routes or real page sections.

## 7. Accessibility, Responsive Design, and Quality

- Use semantic HTML, logical headings, keyboard-accessible dropdowns, visible focus states, and descriptive alt text.
- Ensure sufficient contrast and do not rely on colour alone for active states.
- Respect reduced-motion preferences.
- Avoid horizontal overflow on all viewport sizes.
- Make cards and carousel controls usable with keyboard, mouse, and touch.
- Ensure YouTube embeds resize correctly and include accessible titles.
- Provide loading, error, and empty states where needed.
- Do not include fake controls or links that do nothing.

## 8. Suggested Component Structure

Extend the existing architecture with reusable components such as:
- `OurCompanyDropdown`
- `OurCompanyNewsPage`
- `FeaturedNewsArticle`
- `NewsArticleCard`
- `NewsArticleDetail`
- `CompanyUpdateVideoPage`
- `YouTubeVideoCard`
- `ResponsiveYouTubeEmbed`
- `TopPerformerPage`
- `TopPerformerMonthCard`
- `PerformerAvatarPlaceholder`
- `PerformerCarousel`
- Existing shared `PortalHeader`, `PrimaryNavigation`, `PortalFooter`, and `FooterQuickLinks`

Keep content/data separate from presentation so news, videos, and performer records can be updated without rewriting the UI.

## 9. Acceptance Criteria

The extension is ready for review when:
- Our Company has a working dropdown with Our Company News, Company Update Video, and Top Performer.
- The four main navigation tabs remain unchanged.
- Our Company News has a polished newspaper-style layout with image/text areas and article detail support.
- Company Update Video displays responsive video cards using supplied YouTube links.
- Top Performer supports 12 months and the three channels: Alliance Channel, Bancassurance Channel, and Corporate Channel.
- Four monthly cards are visible side by side on wide desktop and can be horizontally navigated.
- The 12 months can be presented as three sets/rows of four cards.
- Missing performer entries use a silhouette with a question mark and have no name/channel text.
- Desktop, tablet, and mobile layouts are responsive.
- Quick Links remain in the footer only.
- No company news, video details, employee names, photos, or performance claims are fabricated.
- All navigation, article actions, video links, and carousel controls work.
- The extension continues from the existing Our Company prompt rather than creating a disconnected website.

## 10. Content Needed Later

The user may provide later:
- News photos, headlines, article copy, dates, and categories.
- YouTube links and video titles.
- Month-by-month Top Performer photos, names, and channel assignments.
- Additional design screenshots or page requirements.

**Final instruction:** Extend the existing KBZLife Employee Learning Portal’s Our Company page with the three dropdown sections specified above. Keep the existing brand and navigation system, make the news experience editorial and attractive, connect video cards to supplied YouTube links, and build a responsive Top Performer carousel with four monthly cards visible on desktop. Use question-mark silhouette placeholders for missing performer entries, leaving their text areas blank. Do not invent official or personal information.
