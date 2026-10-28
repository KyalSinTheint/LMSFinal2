# KBZLife Employee Learning Portal
## Website Build Prompt — Page 1: Our Company

> **Scope:** This prompt defines the shared website shell and the first complete page, **Our Company**. More pages and requirements will be provided later. Build the architecture modularly so new sections can be added without redesigning the entire application.

## 1. Project Objective

Build a polished, modern **internal Employee Learning Portal for KBZLife Insurance**. The website must work well on desktop, tablet, and mobile.

Use the two user-provided dashboard/website screenshots as visual inspiration:
- A clean, spacious hero section with strong typography and a clear visual focus.
- A premium corporate look with carefully placed imagery.
- A clear header and simple navigation.
- A distinctive feature/content section with good contrast.
- Modern spacing, rounded corners where appropriate, subtle shadows, and restrained interactions.

These screenshots are visual references only. Do not copy their logos, wording, product claims, or exact layouts. Use official KBZLife assets and approved content when supplied. Do not invent official company facts.

## 2. Brand and Visual Design

- **Primary colour:** KBZLife blue.
- **Secondary colour:** white.
- Use deep navy or darker blue for important text and high-contrast sections.
- Use pale blue and neutral grey sparingly for backgrounds, borders, and subtle visual grouping.
- Use a clean, professional type scale with readable body text and clear headings.
- Use consistent spacing, alignment, card styles, iconography, border radii, and shadows.
- Avoid excessive gradients, decorative clutter, emoji-heavy UI, generic dashboard templates, tiny text, and oversized empty areas.
- Use a consistent professional line-icon library rather than emojis for interface icons.
- Use the official KBZLife logo, approved brand imagery, and supplied assets when available. Do not recreate or fabricate an official logo.
- Include restrained hover/focus states and subtle transitions. Respect reduced-motion preferences.
- Maintain accessible colour contrast and visible keyboard focus.

If official brand hex codes or font files have not been provided, use a temporary, clearly documented blue-and-white design token system that can be updated later. Do not claim the temporary values are official brand specifications.

## 3. Shared Header and Navigation

Create a consistent header for the portal.

### Required navigation tabs — exact labels and order
1. **Our Company**
2. **Product Knowledge Hub**
3. **Learning & Development Hub**
4. **HR Hub**

Requirements:
- Place the official KBZLife logo at the left when the asset is available.
- Display the four navigation items clearly on desktop.
- Show the active tab using a clear, accessible state (not colour alone).
- Use an accessible mobile menu on smaller screens; ensure it works with keyboard and touch.
- Keep the header responsive and avoid horizontal overflow.
- The four tabs must be separate, modular routes/pages or route-ready sections.
- Fully implement **Our Company** in this phase.
- For the other three tabs, do not invent content or show fake working controls. They may be route-ready placeholders clearly labelled “Coming soon” until the user supplies page-specific requirements.
- Use the same header and navigation system across future pages.

## 4. Page 1 — Our Company

Build a visually engaging company-information page. It should feel like a premium corporate introduction, not an analytics dashboard.

### 4.1 Hero Section

Create a two-column desktop hero inspired by the user-provided references:
- **Left side:** small eyebrow label, prominent heading, concise introductory copy, and optional internal-page anchor such as “Explore our purpose” that scrolls to a real section.
- **Right side:** a large approved KBZLife/company image or visual supplied by the user.
- Use generous but efficient spacing and balanced proportions.
- Consider a soft pale-blue background or subtle blue visual treatment, while keeping the main page bright and clean.
- On mobile, stack the text and image vertically with the heading and main information first.
- Do not use the reference screenshots’ unrelated brand marks, car imagery, wording, partner logos, or claims.
- If the official image or company introduction has not been supplied, use a clearly marked placeholder and make the image/content easy to replace.

### 4.2 CEO Motto

Include a dedicated CEO Motto section:
- Show the CEO’s approved portrait/photo.
- Display the official CEO motto or message prominently as a quotation.
- Include the CEO’s name and title only if confirmed by the user or an official approved source.
- Use a refined layout, for example a portrait beside a quotation panel, with a blue accent.
- On mobile, stack the portrait and message for comfortable reading.
- Do not fabricate a quote, portrait, name, title, or executive statement. If missing, use an explicit content placeholder such as `[Add approved CEO motto]` and `[Add approved CEO photo]`.

### 4.3 About KBZLife Insurance

Include a section introducing KBZLife Insurance:
- Use an approved company description.
- Make the text readable with an appropriate line length and heading hierarchy.
- A company image may be included if approved assets are available.
- Do not invent company history, product benefits, statistics, market position, or insurance promises.
- If source content has not been provided, use `[Add approved KBZLife Insurance introduction]` as editable placeholder content.

### 4.4 Our Vision

- A clear heading: **Our Vision**.
- A concise, editable statement supplied or approved by the user.
- Use a simple visual treatment such as a highlighted statement panel or subtle icon.
- If the official wording is missing, show `[Add approved vision statement]`; do not invent the official vision.

### 4.5 Our Mission

- A clear heading: **Our Mission**.
- Display the approved mission statement in a readable, visually distinct block.
- If missing, show `[Add approved mission statement]`.

### 4.6 Our Purpose

- A clear heading: **Our Purpose**.
- Explain the organisation’s purpose using approved content only.
- If missing, show `[Add approved purpose statement]`.

### 4.7 Core Values

- A clear heading: **Core Values**.
- Present each approved value as a consistent card or item with a professional icon, short title, and optional explanation.
- Keep card heights, spacing, and typography consistent.
- Make the number of values data-driven so the user can add or remove items without changing the layout.
- Do not make up official core values. If not supplied, use a clearly labelled placeholder list or an empty-state message requesting approved values.

### 4.8 ရည်မှန်းထားသောအရာ (Our Aspirations / Goals)

- Include a section using the Burmese heading **ရည်မှန်းထားသောအရာ**. An English subtitle such as **Our Aspirations** may be included if helpful.
- Display the company’s approved goals or aspirations as a readable list or cards.
- Keep the content editable and separate from UI code.
- Do not invent corporate goals. If missing, show `[Add approved company aspirations/goals]`.

### 4.9 Optional Supporting Sections

The layout may include a compact section divider, approved company image, or short content highlight if it improves the story. Do not add unsupported company claims, fabricated statistics, fake testimonials, or unapproved partner logos.

## 5. Footer — Quick Links

**Quick Links must appear in the footer only. Do not add a separate Quick Links panel elsewhere on the page.**

Include these four links in the footer:
1. Our Company
2. Product Knowledge Hub
3. Learning & Development Hub
4. HR Hub

Footer requirements:
- Use a clean, balanced layout consistent with the blue-and-white identity.
- Include the official KBZLife logo if supplied.
- Keep link labels readable and keyboard-accessible.
- Link Our Company to the implemented page.
- Link the other items to their real routes or clearly labelled coming-soon pages; do not use dead or fake links.
- Add copyright, contact, help, or policy links only if approved details are supplied. Do not invent phone numbers, email addresses, or official URLs.
- On mobile, stack footer columns neatly and prevent overflow.

## 6. Responsive Behaviour

The website must work at common desktop, tablet, and mobile widths.

- Use responsive grids and fluid typography rather than fixed-width page layouts.
- Desktop: use a spacious hero, well-balanced content sections, and multi-column cards where suitable.
- Tablet: reduce columns and spacing while retaining hierarchy.
- Mobile: stack content vertically; make text, buttons, navigation, images, and cards fit the viewport.
- Prevent horizontal scrolling.
- Ensure tap targets are comfortably sized.
- Ensure CEO portrait, company imagery, value cards, and footer links remain readable and usable on small screens.
- Test navigation, page sections, and footer at narrow widths.

## 7. Accessibility and UX

- Use semantic HTML landmarks and a logical heading hierarchy.
- Provide meaningful alternative text for informative images; use empty alt text for decorative images.
- Ensure all navigation and interactive elements work with keyboard and touch.
- Provide visible focus states.
- Do not rely on colour alone to show active states.
- Respect reduced-motion preferences.
- Use readable font sizes and adequate contrast.
- Keep copy concise, professional, and friendly.
- Use real anchors for in-page navigation and valid links for navigation.
- Avoid decorative buttons that do nothing.

## 8. Content and Asset Integrity

- Use official KBZLife information and approved assets supplied by the user.
- Do not copy unrelated brands, logos, text, product claims, or partner marks from the reference screenshots.
- Do not fabricate the CEO motto, CEO identity/photo, company description, vision, mission, purpose, core values, aspirations, or company statistics.
- Keep page content in a separate data/content file or CMS-ready structure so the user can update wording and imagery without rewriting UI components.
- Use clearly marked placeholders where approved content is not yet available.
- Do not include real employee information or confidential company information in demo content.

## 9. Suggested Technical Architecture

Use the existing project stack if one has already been established. Otherwise, a suitable starting point is:
- Next.js
- TypeScript
- Tailwind CSS
- Reusable accessible UI components
- Shared layout components for header, navigation, and footer
- Separate page/route modules for each of the four tabs
- A content data file for Our Company sections and approved image paths

Keep the implementation modular. Do not build unrelated future-page features before their requirements are supplied. Database and authentication requirements can be added in a later phase when the user confirms the full portal scope.

## 10. Suggested Component Structure

Possible component breakdown:
- `PortalHeader`
- `PrimaryNavigation`
- `MobileNavigation`
- `OurCompanyHero`
- `CeoMottoSection`
- `AboutKBZLifeSection`
- `VisionSection`
- `MissionSection`
- `PurposeSection`
- `CoreValuesSection`
- `AspirationsSection`
- `PortalFooter`
- `FooterQuickLinks`

Use shared design tokens for colours, spacing, typography, shadows, and border radii.

## 11. Acceptance Criteria

The Our Company page is ready for review when:
- The four required navigation tabs appear in the specified order.
- Our Company is the active and fully implemented page.
- The page contains CEO Motto with photo, About KBZLife Insurance, Our Vision, Our Mission, Our Purpose, Core Values, and ရည်မှန်းထားသောအရာ sections.
- Missing official content is clearly marked as a placeholder rather than fabricated.
- Quick Links appear in the footer only and contain the same four navigation destinations.
- The visual design follows the supplied screenshots’ general quality and composition cues without copying unrelated branding or claims.
- Primary colour is blue and secondary colour is white.
- Desktop, tablet, and mobile layouts are responsive and have no horizontal overflow.
- Navigation, anchor links, and footer links work as described.
- The page uses accessible semantic structure and keyboard focus states.
- Content and assets can be updated without rebuilding the page components.
- The other three pages remain modular and ready for future requirements.

## 12. Development Workflow

1. Review the supplied screenshots and official KBZLife assets.
2. Establish the blue-and-white design tokens and shared header/footer.
3. Implement the responsive navigation and footer Quick Links.
4. Build the Our Company page sections in the order described above.
5. Populate only approved content; clearly mark missing material.
6. Test desktop, tablet, and mobile layouts.
7. Verify every navigation and footer link.
8. Review accessibility, contrast, keyboard interaction, and reduced-motion behaviour.
9. Keep the code modular so Product Knowledge Hub, Learning & Development Hub, and HR Hub can be implemented later from separate specifications.

## 13. Content Needed From the User Later

To replace placeholders accurately, request:
- Official KBZLife logo and approved company images.
- CEO portrait, full approved name/title, and exact motto/message.
- Approved KBZLife Insurance company introduction.
- Exact official vision, mission, and purpose statements.
- Official core values and their descriptions.
- Company aspirations/goals under **ရည်မှန်းထားသောအရာ**.
- Official brand hex codes and font guidelines, if available.
- Additional desktop/mobile reference screenshots.

**Final instruction:** Build Page 1 as a high-quality, responsive Our Company experience for an internal KBZLife employee portal. Treat the screenshots as design inspiration, preserve the blue-and-white brand direction, put Quick Links in the footer only, and do not fabricate official company content. Keep the other three navigation pages modular for the next phase.
