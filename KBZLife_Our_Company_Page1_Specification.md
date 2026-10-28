# KBZLife Employee Learning Portal — Architecture & Page 1 Specification

## Project Overview
This repository contains the production implementation of the **KBZLife Employee Learning Portal**, specifically delivering **Page 1: Our Company** along with the shared responsive shell, brand design tokens, accessible navigation, and footer architecture.

---

## 1. Brand & Design Tokens

| Token | CSS Variable / Value | Purpose |
| :--- | :--- | :--- |
| **Primary Blue** | `#003366` (`var(--kbz-blue-primary)`) | Primary brand colour, header accents, high-contrast headings |
| **Secondary Blue** | `#00529B` (`var(--kbz-blue-secondary)`) | Interactive elements, active tab indicators, primary buttons |
| **Sky Accent** | `#0284C7` (`var(--kbz-blue-accent)`) | Icons, focal accents, subtle highlight rings |
| **Pale Blue Background** | `#F0F5FA` (`var(--kbz-blue-pale)`) | Hero background tint, quote panel surface, subtle card groupings |
| **Deep Navy Text** | `#0A192F` (`var(--kbz-navy-dark)`) | High-contrast body titles and headings |
| **Neutral Border** | `#E2E8F0` (`var(--kbz-border-subtle)`) | Card boundaries and hairline horizontal dividers |
| **White** | `#FFFFFF` | Secondary brand canvas, card surfaces, clean contrast |

> *Note: In accordance with the prompt guidelines, these blue-and-white design tokens provide a clear, professional foundation that can be updated with official hex codes if provided.*

---

## 2. Navigation & Hub Structure

The portal shell provides a persistent, accessible header and footer with the exact four navigation tabs in order:

1. **Our Company** (Active & Fully Implemented, with Dropdown)
   - **Our Company (Overview)**: Strategic pillars, CEO motto, vision, mission, purpose, core values, aspirations.
   - **Our Company News**: Editorial internal gazette, featured story, category filter, and modal reader view.
   - **Company Update Video**: Clean video cards with safe YouTube parsing, responsive embedded player, and external links.
   - **Top Performer**: 12-month recognition across **Alliance Channel**, **Bancassurance Channel**, and **Corporate Channel**, with 4-card desktop carousel, 3-row year overview, and question-mark silhouette placeholders for unpopulated months.
2. **Product Knowledge Hub** (Route-ready "Coming soon" placeholder)
3. **Learning & Development Hub** (Route-ready "Coming soon" placeholder)
4. **HR Hub** (Route-ready "Coming soon" placeholder)

### Strict Top-Bar Contract
- **Brand Zone**: KBZLife Insurance wordmark and portal badge with designated slot for the official logo asset.
- **Nav Links**: The 4 single-line text tabs with accessible active states (underline indicator, font weight, aria-current).
- **Primary Action**: Quick Jump / Content Guide drawer or Helpdesk affordance.
- **Mobile Menu**: Responsive sliding drawer supporting keyboard navigation, visible focus, and touch accessibility.

### Footer Quick Links Constraint
- As mandated by the specification: **Quick Links appear strictly in the footer** and nowhere else on the page.

---

## 3. Page 1: Our Company Sections Breakdown

| Section | Heading / Title | Content Source / Placeholder Rule |
| :--- | :--- | :--- |
| **4.1 Hero** | *Welcome to KBZLife Insurance* | Eyebrow, headline, concise description, in-page anchor `"Explore our purpose"`, and approved hero company image slot (`[Add approved KBZLife hero image]`). |
| **4.2 CEO Motto** | *CEO Motto* | Dedicated portrait frame (`[Add approved CEO photo]`), quotation panel (`"[Add approved CEO motto]"`), and attribution (`[Add approved CEO Name & Official Title]`). No fabricated identities or quotes. |
| **4.3 About** | *About KBZLife Insurance* | Company role and overview placeholder: `[Add approved KBZLife Insurance introduction]`. |
| **4.4 Vision** | *Our Vision* | Statement card with visual icon: `[Add approved vision statement]`. |
| **4.5 Mission** | *Our Mission* | Dedicated readable card: `[Add approved mission statement]`. |
| **4.6 Purpose** | *Our Purpose* | Accessible distinct block: `[Add approved purpose statement]`. |
| **4.7 Core Values** | *Core Values* | Dynamic data-driven card grid with professional line icons (e.g., Integrity, Customer First, Excellence, Empathy, Collaboration). |
| **4.8 Aspirations** | **ရည်မှန်းထားသောအရာ** (*Our Aspirations*) | Burmese heading with typography support (`Noto Sans Myanmar`), data-driven goals list: `[Add approved company aspirations/goals]`. |

---

## 4. Content Architecture & Modularity

All text copy, image paths, and list items are decoupled from React UI components in:
- `src/data/companyContent.ts`

This allows marketing, communications, or HR teams to replace placeholders with approved official copy and image URLs without touching component markup.

### Content Configuration Structure
```typescript
export interface CompanyContent {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    anchorText: string;
    imageUrl: string | null;
  };
  ceoMotto: {
    motto: string;
    ceoName: string;
    ceoTitle: string;
    photoUrl: string | null;
  };
  about: {
    title: string;
    paragraphs: string[];
    imageUrl: string | null;
  };
  vision: {
    statement: string;
  };
  mission: {
    statement: string;
  };
  purpose: {
    statement: string;
  };
  coreValues: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  aspirations: {
    burmeseTitle: string;
    englishSubtitle: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
}
```

---

## 5. Responsive & Accessibility Conformance
- **Viewport Support**: Fluid responsive layout across Mobile (320px–480px), Tablet (768px–1024px), and Desktop (1280px–1440px+).
- **WCAG AA Compliance**: High-contrast ratios on dark and light surfaces; focus rings via `focus-visible`.
- **Reduced Motion**: All animations disabled if `prefers-reduced-motion: reduce` is detected.
- **Burmese Typography**: Integrated `Noto Sans Myanmar` Google font alongside `Plus Jakarta Sans` for clean, legibly rendered Burmese script.
