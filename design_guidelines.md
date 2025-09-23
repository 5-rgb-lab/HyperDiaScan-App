# HyperDiaScan Design Guidelines

## Design Approach
**Medical App Design System**: Following healthcare app standards with clean, trustworthy aesthetics inspired by modern medical applications like Teladoc and Mayo Clinic app. Prioritizing clarity, accessibility, and professional credibility.

## Core Design Elements

### Color Palette
**Primary Brand Colors:**
- Primary Blue: 220 85% 25% (deep medical blue for trust)
- Secondary Blue: 220 60% 45% (lighter blue for interactive elements)
- Success Green: 142 70% 35% (for positive health indicators)
- Warning Orange: 35 85% 55% (for moderate risk alerts)
- Danger Red: 0 75% 45% (for high risk warnings)

**Background Colors:**
- Light mode: 220 15% 98% (soft medical white)
- Dark mode: 220 25% 8% (deep blue-black)
- Card backgrounds maintain subtle blue undertones

### Typography
- **Primary Font**: Inter (Google Fonts) - clean, medical-grade readability
- **Headings**: 600-700 weight, larger sizes for hierarchy
- **Body**: 400-500 weight, optimized for health data readability
- **Medical Data**: 500 weight, slightly larger for nutrition facts

### Layout System
**Tailwind Spacing**: Primary units of 4, 6, 8, and 12
- Component padding: p-6
- Section margins: my-8
- Card spacing: gap-4
- Button padding: px-6 py-3

### Component Library

**Navigation:**
- Clean header with app logo and profile icon
- Bottom tab navigation for main sections: Scanner, History, Profile
- Breadcrumb navigation for multi-step processes

**Scanner Interface:**
- Large camera viewfinder with overlay guides
- Floating capture button with pulse animation
- Progress indicator for OCR processing
- Editable nutrition facts grid with clear labels

**Health Assessment Cards:**
- Color-coded risk indicators (green/orange/red borders)
- Confidence percentage with progress bar
- Expandable medical reasoning sections
- Clear typography hierarchy for health data

**Data Displays:**
- Nutrition facts table with emphasized key values
- Timeline view for scan history
- Condition-specific filtering chips
- Summary cards with health metrics

**Forms & Inputs:**
- Medical-grade form styling with clear labels
- Toggle switches for health conditions
- Number inputs with step controls for health data
- Validation states with helpful medical context

**Overlays:**
- Modal dialogs for profile setup
- Toast notifications for scan completion
- Loading states with medical iconography
- Confirmation dialogs for health-sensitive actions

### Visual Treatments
- **Gradients**: Subtle blue gradients (220 60% 50% to 220 40% 60%) for headers and cards
- **Shadows**: Soft, medical-appropriate shadows using blue undertones
- **Borders**: Subtle 1px borders with health-status color coding
- **Iconography**: Medical and health-focused icons from Heroicons

## Images
**Hero Section**: Clean, minimal hero with abstract medical/health imagery showing healthy foods or medical symbols. Background should be subtle gradient.

**Scanner Interface**: No decorative images - focus on camera functionality with overlay guides.

**Health Icons**: Use consistent medical iconography for diabetes/hypertension indicators, nutrition categories, and health status indicators.

This design ensures medical credibility while maintaining modern app usability standards.