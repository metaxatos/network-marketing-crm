Network Marketing CRM - Redesigned Design System & Page Specifications
🎨 Core Design System - Warm & Intuitive
Color Palette - Friendly & Energizing
scss
// Primary Background Gradients (UPDATED)
$gradient-main: linear-gradient(135deg, #F0F4F8 0%, #E6EEF5 50%, #F5F3FF 100%);    // Professional blue-gray to light purple
$gradient-dawn: linear-gradient(135deg, #FAF9FC 0%, #F0F7FF 50%, #FFF9F0 100%);    // Light purple to cream
$gradient-sunset: linear-gradient(180deg, #FAFBFD 0%, #EEF2F7 100%);               // Clean vertical gradient

// Glass Morphism Effects (NEW)
$glass-white: rgba(255, 255, 255, 0.7);
$glass-white-light: rgba(255, 255, 255, 0.6);
$glass-blur: blur(10px);

// Action Colors - Vibrant & Friendly
$action-teal: #4ECDC4;        // Contact/Communication
$action-coral: #FF6B6B;       // Follow-ups/Urgent
$action-purple: #A78BFA;      // Meetings/Events
$action-golden: #FFD93D;      // Achievements/Training
$action-green: #4ADE80;       // Success/Complete
$action-blue: #60A5FA;        // Information/Links

// Text Colors
$text-primary: #2D3748;       // Main headings
$text-secondary: #4A5568;     // Body text
$text-light: #718096;         // Secondary info
$text-white: #FFFFFF;         // On colored backgrounds

// Background Colors
$bg-white: #FFFFFF;           // Cards
$bg-soft: #FAFBFC;           // Subtle backgrounds
$bg-hover: #F7F9FB;          // Hover states

// Shadow Colors
$shadow-teal: rgba(78, 205, 196, 0.2);
$shadow-coral: rgba(255, 107, 107, 0.2);
$shadow-purple: rgba(167, 139, 250, 0.2);
$shadow-golden: rgba(255, 217, 61, 0.2);
Typography - Friendly & Clear
scss
// Font Stack
$font-primary: 'Poppins', -apple-system, sans-serif;      // Rounded, friendly
$font-secondary: 'Inter', -apple-system, sans-serif;      // Clean body text

// Desktop Sizes
$text-xs: 13px;      // Small labels
$text-sm: 15px;      // Secondary text
$text-base: 17px;    // Body text (larger for readability)
$text-lg: 20px;      // Emphasized text
$text-xl: 26px;      // Section headers
$text-2xl: 34px;     // Page headers
$text-3xl: 42px;     // Hero text

// Mobile Sizes
$mobile-text-base: 16px;
$mobile-text-lg: 18px;
$mobile-text-xl: 24px;
$mobile-text-2xl: 30px;

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
Component Standards
scss
// Border Radius - Soft & Friendly
$radius-sm: 8px;      // Small elements
$radius-md: 12px;     // Buttons, inputs
$radius-lg: 16px;     // Cards
$radius-xl: 24px;     // Feature cards
$radius-full: 50%;    // Circular elements

// Shadows - Colorful & Soft
$shadow-sm: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8px 24px 0 rgba(0, 0, 0, 0.1);
$shadow-colored: 0 8px 24px -4px; // + color specific rgba

// Spacing
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;
$space-12: 48px;
$space-16: 64px;

// Transitions - Smooth & Pleasant
$transition-fast: all 0.2s ease-out;
$transition-base: all 0.3s ease-out;
$transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);

// Glass Morphism Components (NEW)
$glass-card: {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

$glass-card-hover: {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

🎯 Key Design Principles

### 1. Celebration Over Tasks
Transform mundane actions into achievements with visual feedback and encouraging messaging.

### 2. One-Click Actions  
Minimize steps between intention and completion. Pre-fill forms and provide smart defaults.

### 3. Visual Hierarchy
Guide users naturally through priority actions using size, color, and positioning.

### 4. Touch-Friendly Design
44px minimum touch targets with generous spacing for comfortable mobile interaction.

### 5. Progressive Disclosure
Show essential information first, reveal complexity only when needed.

### 6. Emotional Design
Use warm colors, friendly animations, and celebratory feedback to create positive associations.

### 7. Mobile-First Responsive
Design for mobile constraints first, then enhance for larger screens.

### 8. Performance Focused
Fast loading with skeleton states, never keep users waiting without feedback.

### 9. Accessibility Minded
Clear contrast ratios, focus states, and semantic markup for all users.

### 10. Data-Driven Empathy
Use analytics to understand user struggles and optimize accordingly.

### 11. Glass Morphism for Depth
Use semi-transparent backgrounds with backdrop blur to create depth without harsh borders. Maintains visual continuity with gradient backgrounds while ensuring readability and feeling modern.

📱 Navigation Structure
Mobile Navigation (Bottom Tab Bar)
scss
Position: Fixed
Bottom: 0
Width: 100%
Height: 70px
Background: White with top shadow
Border-top: 1px solid rgba(0,0,0,0.05)

// Tab Items
Display: Flex
Justify-content: Space-around
Align-items: Center

// Each Tab
Icon: 24px (filled when active, outline when inactive)
Label: $text-xs, always visible
Active Color: $action-purple
Inactive Color: $text-light
Active Background: Subtle purple glow

// Tab Order
1. Dashboard (Home icon)
2. Contacts (People icon)
3. Add New (Plus in circle - larger, prominent)
4. Events (Calendar icon)
5. More (Grid icon)
Desktop Navigation (Sidebar)
scss
Position: Fixed
Left: 0
Width: 260px
Height: 100vh
Background: White
Box-shadow: $shadow-md

// Logo Section
Height: 80px
Display: Flex
Align-items: Center
Padding: 0 24px
Border-bottom: 1px solid $bg-soft

// User Profile Section
Padding: 24px
Background: $gradient-main
Display: Flex
Align-items: Center
Gap: 12px

// Avatar
Width: 48px
Height: 48px
Border-radius: $radius-full
Border: 3px solid white

// Navigation Items
Padding: 12px 20px
Margin: 8px 16px
Border-radius: $radius-md
Display: Flex
Align-items: Center
Gap: 12px
Transition: $transition-fast

// Active State
Background: Colored gradient (10% opacity)
Color: Matching action color
Font-weight: $font-semibold

// Icons
Width: 20px
Height: 20px
Stroke-width: 2px
📊 Dashboard Page
Mobile Version
scss
Background: $gradient-main
Min-height: 100vh
Padding-bottom: 80px // Space for bottom nav

// Welcome Header Card
Background: White
Margin: 16px
Padding: 24px
Border-radius: $radius-xl
Box-shadow: $shadow-md

// Greeting Section
Display: Flex
Justify-content: Space-between
Align-items: Start

// Left Side
Title: $font-primary, $text-xl, $font-bold, $text-primary
Subtitle: $font-secondary, $text-base, $text-secondary
Quote: $text-sm, Italic, $text-light, margin-top: 12px

// Right Side
Weather Widget: Icon + temp in small card
Streak Badge: Golden circle with number + "day streak"

// Quick Stats Row
Display: Flex
Gap: 12px
Margin: 20px 16px
Overflow-x: Auto
-webkit-overflow-scrolling: touch

// Stat Bubble
Min-width: 100px
Background: White
Padding: 16px
Border-radius: $radius-lg
Text-align: Center
Box-shadow: $shadow-sm

Number: $text-xl, $font-bold, Action color
Label: $text-xs, $text-light

// Quick Actions Section (UPDATED)
Margin-top: 24px

.section-title {
  Font-size: $text-lg
  Font-weight: $font-semibold
  Color: $text-primary
  Margin-bottom: 16px
}

.action-cards {
  Display: Grid
  Grid-template-columns: 1fr
  Gap: 12px
  
  .action-card {
    Background: $glass-white
    Backdrop-filter: $glass-blur
    Border: 1px solid rgba(255, 255, 255, 0.5)
    Border-radius: $radius-lg
    Padding: 20px
    Display: Flex
    Align-items: Center
    Gap: 16px
    Box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.05)
    Transition: $transition-base
    Height: 100px
    
    &:active {
      Transform: scale(0.98)
    }
    
    .icon-wrapper {
      Width: 60px
      Height: 60px
      Border-radius: $radius-full
      Display: Flex
      Align-items: Center
      Justify-content: Center
      
      &.email { Background: $action-coral }
      &.contacts { Background: $action-teal }
      &.events { Background: $action-purple }
      
      .icon {
        Width: 28px
        Height: 28px
        Color: White
      }
    }
    
    .card-content {
      Flex: 1
      
      .title {
        Font-size: $text-base
        Font-weight: $font-semibold
        Color: $text-primary
      }
      
      .subtitle {
        Font-size: $text-sm
        Color: $text-light
        Margin-top: 2px
      }
    }
  }
}

// Smart Suggestion Section (NEW)
.smart-suggestion {
  Background: rgba($action-purple, 0.05)
  Border: 2px solid rgba($action-purple, 0.2)
  Border-radius: $radius-lg
  Padding: 20px
  Margin: 20px 0
  Display: Flex
  Align-items: Center
  Gap: 12px
  
  .suggestion-icon {
    Width: 24px
    Height: 24px
    Color: $action-golden
  }
  
  .suggestion-content {
    Flex: 1
    
    .label {
      Font-size: $text-sm
      Font-weight: $font-medium
      Color: $text-secondary
      Margin-bottom: 4px
    }
    
    .message {
      Font-size: $text-base
      Color: $text-primary
    }
  }
  
  .action-button {
    Background: $action-purple
    Color: White
    Padding: 10px 20px
    Border-radius: $radius-full
    Font-weight: $font-medium
    White-space: Nowrap
  }
}

// Quick Wins Section (NEW)
.quick-wins {
  Margin-top: 24px
  
  .section-subtitle {
    Font-size: $text-sm
    Font-weight: $font-medium
    Color: $text-secondary
    Margin-bottom: 12px
  }
  
  .mini-cards {
    Display: Grid
    Grid-template-columns: 1fr
    Gap: 8px
    
    .mini-card {
      Background: $bg-soft
      Border-radius: $radius-md
      Padding: 16px
      Display: Flex
      Align-items: Center
      Gap: 12px
      Min-height: 60px
      
      .icon-circle {
        Width: 40px
        Height: 40px
        Border-radius: $radius-full
        Display: Flex
        Align-items: Center
        Justify-content: Center
        
        &.training { Background: rgba($action-golden, 0.2) }
        &.team { Background: rgba($action-green, 0.2) }
        &.landing { Background: rgba($action-blue, 0.2) }
      }
      
      .content {
        Flex: 1
        
        .title {
          Font-size: $text-sm
          Font-weight: $font-medium
          Color: $text-primary
        }
        
        .detail {
          Font-size: $text-xs
          Color: $text-light
        }
      }
    }
  }
}

// Progress Section
Background: White
Margin: 16px
Padding: 20px
Border-radius: $radius-xl

Title: $text-lg, $font-semibold, margin-bottom: 16px

// Progress Rings Container
Display: Grid
Grid-template-columns: 1fr 1fr
Gap: 20px

// Progress Ring Card
Text-align: Center

// Circular Progress
Width: 80px
Height: 80px
Margin: 0 auto 8px
SVG Circle with gradient stroke
Animated fill on load
Small celebration particles at 100%

Percentage: $text-xl, $font-bold, Center of circle
Label: $text-sm, $text-secondary
Desktop Version

// Page Container (UPDATED)
Background: $gradient-main  // Full viewport gradient
Min-height: 100vh
Display: Flex

// Main Content Area (UPDATED)
.dashboard-main {
  Flex: 1
  Padding: 32px
  
  .content-wrapper {
    Max-width: 1200px
    Margin: 0 auto
  }
  
  // Quick Actions - Desktop Grid
  .quick-actions {
    .action-cards {
      Grid-template-columns: repeat(3, 1fr)
      Gap: 20px
      
      .action-card {
        Height: 120px
        Cursor: Pointer
        
        &:hover {
          Transform: translateY(-4px)
          Box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.1)
        }
      }
    }
  }
  
  // Smart Suggestion - Enhanced for Desktop
  .smart-suggestion {
    Margin: 32px 0
    Padding: 24px
    
    &:hover {
      Border-color: rgba($action-purple, 0.3)
      Background: rgba($action-purple, 0.08)
    }
  }
  
  // Quick Wins - Horizontal on Desktop
  .quick-wins {
    .mini-cards {
      Grid-template-columns: repeat(3, 1fr)
      Gap: 16px
      
      .mini-card {
        Cursor: Pointer
        Transition: $transition-base
        
        &:hover {
          Background: White
          Box-shadow: $shadow-sm
        }
      }
    }
  }
}

// Right Sidebar (UPDATED)
.dashboard-sidebar {
  Width: 320px
  Padding: 32px 24px
  Background: $glass-white-light
  Backdrop-filter: $glass-blur
  Border-left: 1px solid rgba(255, 255, 255, 0.5)
  
  // All existing sidebar content remains the same
  // Just wrapped in the glass morphism container
}
📅 Events Page
Mobile Version
scss
// Page Header
Background: White
Padding: 16px
Position: Sticky
Top: 0
Z-index: 40
Box-shadow: $shadow-sm

// Title Row
Display: Flex
Justify-content: Space-between
Align-items: Center

Title: $text-xl, $font-bold
Add Button: Floating action button style

// Event Type Filters
Display: Flex
Gap: 8px
Overflow-x: Auto
Margin-top: 12px
Padding: 4px 0

// Filter Pill
Padding: 8px 16px
Border-radius: 20px
White-space: Nowrap
Background: $bg-soft
Color: $text-secondary
Border: 2px solid transparent

&.active {
  Background: Action color (10% opacity)
  Color: Action color
  Border-color: Action color
  Font-weight: $font-medium
}

// Events List
Background: $gradient-dawn
Padding: 16px
Padding-bottom: 86px

// Event Card
Background: White
Border-radius: $radius-xl
Margin-bottom: 12px
Overflow: Hidden
Box-shadow: $shadow-md
Border-left: 4px solid [event-type-color]

// Card Header
Padding: 20px 20px 0
Display: Flex
Justify-content: Space-between
Align-items: Start

// Event Type Badge
Background: Event color (10% opacity)
Color: Event color
Padding: 6px 12px
Border-radius: 16px
Font-size: $text-xs
Font-weight: $font-medium

// Card Body
Padding: 12px 20px 20px

Title: $text-lg, $font-semibold, $text-primary
Date/Time: $text-base, $text-secondary, margin: 8px 0

// Attendee Avatars
Display: Flex
Margin-top: 12px

.avatar {
  Width: 32px
  Height: 32px
  Border-radius: $radius-full
  Border: 2px solid white
  Margin-left: -8px
  
  &:first-child {
    Margin-left: 0
  }
}

// More count
Background: $bg-soft
Color: $text-secondary
Display: Flex
Align-items: Center
Justify-content: Center
Font-size: $text-xs

// Action Row
Border-top: 1px solid $bg-soft
Padding: 12px 20px
Display: Flex
Gap: 8px

// Action Buttons
Flex: 1
Padding: 10px
Border-radius: $radius-md
Text-align: Center
Font-weight: $font-medium
Transition: $transition-fast

.primary {
  Background: Event color
  Color: White
}

.secondary {
  Background: $bg-soft
  Color: $text-secondary
}
Desktop Version
scss
// Page Container
Margin-left: 260px
Background: $gradient-dawn
Min-height: 100vh

// Header Section
Background: White
Padding: 24px 32px
Box-shadow: $shadow-sm

// Calendar/List Toggle
Position: Absolute
Right: 32px
Top: 24px
Display: Flex
Background: $bg-soft
Padding: 4px
Border-radius: $radius-md

.toggle-option {
  Padding: 8px 16px
  Border-radius: $radius-sm
  Cursor: Pointer
  Transition: $transition-fast
  
  &.active {
    Background: White
    Box-shadow: $shadow-sm
  }
}

// Events Grid View
Padding: 32px
Display: Grid
Grid-template-columns: repeat(auto-fill, minmax(380px, 1fr))
Gap: 24px

// Event Card (Desktop)
Cursor: Pointer
Transition: $transition-base
Position: Relative

&:hover {
  Transform: translateY(-4px)
  Box-shadow: $shadow-lg
  
  .action-row {
    Opacity: 1
  }
}

// Hidden Action Row (Shows on hover)
.action-row {
  Opacity: 0
  Transition: $transition-fast
}

// Calendar View (When toggled)
.calendar-container {
  Background: White
  Border-radius: $radius-xl
  Padding: 32px
  Margin: 32px
  Box-shadow: $shadow-lg
  
  // Calendar Grid
  Display: Grid
  Grid-template-columns: repeat(7, 1fr)
  Gap: 0
  
  // Day Cell
  Min-height: 120px
  Border: 1px solid $bg-soft
  Padding: 8px
  
  // Event Dots
  .event-indicator {
    Width: 8px
    Height: 8px
    Border-radius: $radius-full
    Background: Event type color
    Display: Inline-block
    Margin: 2px
  }
}
✉️ Email Builder Page
Mobile Version
scss
// Step Progress Header
Background: White
Padding: 20px 16px
Position: Sticky
Top: 0
Z-index: 50
Box-shadow: $shadow-sm

// Progress Container
Display: Flex
Align-items: Center
Justify-content: Space-between

// Step Circle
Width: 40px
Height: 40px
Border-radius: $radius-full
Display: Flex
Align-items: Center
Justify-content: Center
Font-weight: $font-bold
Position: Relative

&.completed {
  Background: $action-green
  Color: White
  
  // Checkmark instead of number
  &::after {
    Content: '✓'
  }
}

&.active {
  Background: $action-purple
  Color: White
  Box-shadow: 0 0 0 4px rgba($action-purple, 0.2)
}

&.upcoming {
  Background: $bg-soft
  Color: $text-light
}

// Connection Line
.step-line {
  Position: Absolute
  Top: 50%
  Right: -100%
  Width: 100%
  Height: 2px
  Background: $bg-soft
  
  &.completed {
    Background: $action-green
  }
}

// Template Selection Step
.template-grid {
  Padding: 16px
  Display: Grid
  Gap: 12px
  
  .template-card {
    Background: White
    Border-radius: $radius-lg
    Padding: 20px
    Border: 2px solid $bg-soft
    Position: Relative
    
    &.selected {
      Border-color: $action-purple
      Background: rgba($action-purple, 0.02)
      
      // Selected checkmark
      &::after {
        Content: '✓'
        Position: Absolute
        Top: 12px
        Right: 12px
        Width: 24px
        Height: 24px
        Background: $action-purple
        Color: White
        Border-radius: $radius-full
        Display: Flex
        Align-items: Center
        Justify-content: Center
      }
    }
    
    .template-icon {
      Width: 48px
      Height: 48px
      Background: Gradient based on template type
      Border-radius: $radius-md
      Display: Flex
      Align-items: Center
      Justify-content: Center
      Margin-bottom: 12px
    }
    
    .template-name {
      Font-size: $text-base
      Font-weight: $font-semibold
      Margin-bottom: 8px
    }
    
    .template-description {
      Font-size: $text-sm
      Color: $text-light
      Line-height: 1.4
    }
  }
}

// Personalization Step
.personalization-form {
  Background: White
  Margin: 16px
  Padding: 20px
  Border-radius: $radius-lg
  
  .form-group {
    Margin-bottom: 20px
    
    label {
      Display: Block
      Font-size: $text-sm
      Font-weight: $font-medium
      Color: $text-secondary
      Margin-bottom: 8px
    }
    
    input, textarea {
      Width: 100%
      Padding: 12px 16px
      Border: 2px solid $bg-soft
      Border-radius: $radius-md
      Font-size: $text-base
      Transition: $transition-fast
      
      &:focus {
        Border-color: $action-purple
        Outline: None
        Box-shadow: 0 0 0 3px rgba($action-purple, 0.1)
      }
    }
    
    .helper-text {
      Font-size: $text-xs
      Color: $text-light
      Margin-top: 4px
    }
  }
}

// Bottom Action Bar
Position: Fixed
Bottom: 70px // Above navigation
Left: 0
Right: 0
Background: White
Padding: 16px
Box-shadow: 0 -2px 10px rgba(0,0,0,0.05)

Display: Flex
Gap: 12px

.btn-secondary {
  Flex: 1
  Padding: 14px
  Border-radius: $radius-md
  Background: $bg-soft
  Color: $text-secondary
  Font-weight: $font-medium
}

.btn-primary {
  Flex: 2
  Padding: 14px
  Border-radius: $radius-md
  Background: $action-purple
  Color: White
  Font-weight: $font-medium
}
Desktop Version
scss
// Split View Layout
Margin-left: 260px
Display: Grid
Grid-template-columns: 480px 1fr
Height: 100vh

// Left Panel - Builder Steps
Background: White
Border-right: 1px solid $bg-soft
Overflow-y: Auto
Padding: 32px

// Progress Indicator (Vertical)
.progress-vertical {
  Display: Flex
  Flex-direction: Column
  Gap: 24px
  Margin-bottom: 40px
  
  .step-item {
    Display: Flex
    Align-items: Center
    Gap: 16px
    Position: Relative
    
    // Vertical line
    &:not(:last-child)::after {
      Content: ''
      Position: Absolute
      Left: 20px
      Top: 44px
      Width: 2px
      Height: 24px
      Background: $bg-soft
    }
    
    &.completed::after {
      Background: $action-green
    }
  }
}

// Right Panel - Live Preview
Background: Linear-gradient(180deg, #F8F9FA 0%, #E9ECEF 100%)
Padding: 48px
Display: Flex
Align-items: Center
Justify-content: Center

.preview-container {
  Background: White
  Border-radius: $radius-xl
  Box-shadow: $shadow-lg
  Width: 100%
  Max-width: 700px
  Overflow: Hidden
  
  .preview-header {
    Background: $bg-soft
    Padding: 16px 24px
    Border-bottom: 1px solid #E0E0E0
    
    .browser-dots {
      Display: Flex
      Gap: 8px
      
      .dot {
        Width: 12px
        Height: 12px
        Border-radius: $radius-full
        Background: #DDD
      }
    }
  }
  
  .preview-content {
    Padding: 40px
    Min-height: 600px
    
    // Email preview styling
    .email-preview {
      Font-family: Arial, sans-serif
      Line-height: 1.6
      Color: #333
    }
  }
}

// Floating Save Indicator
Position: Fixed
Bottom: 32px
Right: 32px
Background: White
Padding: 12px 24px
Border-radius: 24px
Box-shadow: $shadow-lg
Display: Flex
Align-items: Center
Gap: 8px

.save-icon {
  Width: 16px
  Height: 16px
  Color: $action-green
  Animation: pulse 2s infinite
}
👥 Contacts Page
Mobile Version
scss
// Search Header
Background: White
Padding: 16px
Position: Sticky
Top: 0
Z-index: 50

// Search Container
Position: Relative

.search-icon {
  Position: Absolute
  Left: 16px
  Top: 50%
  Transform: translateY(-50%)
  Color: $text-light
}

.search-input {
  Width: 100%
  Padding: 14px 16px 14px 48px
  Border: 2px solid $bg-soft
  Border-radius: $radius-full
  Font-size: $text-base
  Background: $bg-soft
  
  &:focus {
    Background: White
    Border-color: $action-purple
    Outline: None
  }
}

// Category Pills
Display: Flex
Gap: 8px
Overflow-x: Auto
Margin-top: 12px
Padding: 4px 0

.category-pill {
  Display: Flex
  Align-items: Center
  Gap: 6px
  Padding: 8px 16px
  Border-radius: 20px
  Background: $bg-soft
  White-space: Nowrap
  
  &.active {
    Background: $action-purple
    Color: White
    
    .count {
      Background: rgba(255,255,255,0.2)
    }
  }
  
  .count {
    Padding: 2px 8px
    Border-radius: 12px
    Font-size: $text-xs
    Background: rgba(0,0,0,0.08)
  }
}

// Empty State (Beautiful)
.empty-state {
  Display: Flex
  Flex-direction: Column
  Align-items: Center
  Padding: 60px 20px
  Text-align: Center
  
  .illustration {
    Width: 200px
    Height: 200px
    Margin-bottom: 24px
    // Beautiful gradient illustration
    Background: Linear-gradient(135deg, $action-purple 0%, $action-coral 100%)
    Border-radius: $radius-full
    Display: Flex
    Align-items: Center
    Justify-content: Center
    Position: Relative
    
    // Decorative circles
    &::before, &::after {
      Content: ''
      Position: Absolute
      Border-radius: $radius-full
      Border: 2px solid rgba(255,255,255,0.3)
    }
    
    &::before {
      Width: 240px
      Height: 240px
    }
    
    &::after {
      Width: 280px
      Height: 280px
    }
    
    .icon {
      Width: 80px
      Height: 80px
      Color: White
    }
  }
  
  h3 {
    Font-size: $text-xl
    Font-weight: $font-bold
    Color: $text-primary
    Margin-bottom: 12px
  }
  
  p {
    Font-size: $text-base
    Color: $text-secondary
    Line-height: 1.5
    Max-width: 280px
    Margin-bottom: 24px
  }
  
  .cta-button {
    Background: $action-purple
    Color: White
    Padding: 14px 32px
    Border-radius: $radius-full
    Font-weight: $font-medium
    Display: Inline-flex
    Align-items: Center
    Gap: 8px
    Box-shadow: 0 4px 16px rgba($action-purple, 0.3)
  }
}

// Contact List
.contact-item {
  Background: White
  Margin: 8px 16px
  Padding: 16px
  Border-radius: $radius-lg
  Display: Flex
  Align-items: Center
  Gap: 12px
  Box-shadow: $shadow-sm
  
  .avatar {
    Width: 48px
    Height: 48px
    Border-radius: $radius-full
    Background: Linear-gradient(135deg, #667EEA 0%, #764BA2 100%)
    Display: Flex
    Align-items: Center
    Justify-content: Center
    Color: White
    Font-weight: $font-semibold
  }
  
  .contact-info {
    Flex: 1
    
    .name {
      Font-size: $text-base
      Font-weight: $font-semibold
      Color: $text-primary
    }
    
    .details {
      Font-size: $text-sm
      Color: $text-light
      Display: Flex
      Align-items: Center
      Gap: 8px
      Margin-top: 2px
    }
  }
  
  .contact-actions {
    Display: Flex
    Gap: 8px
    
    .action-btn {
      Width: 36px
      Height: 36px
      Border-radius: $radius-full
      Border: 1px solid $bg-soft
      Display: Flex
      Align-items: Center
      Justify-content: Center
      Color: $text-secondary
      
      &:active {
        Background: $bg-soft
      }
    }
  }
}
Desktop Version
scss
// Page Layout
Margin-left: 260px
Background: $gradient-main
Min-height: 100vh

// Header Bar
Background: White
Padding: 24px 32px
Box-shadow: $shadow-sm
Display: Flex
Justify-content: Space-between
Align-items: Center

.search-section {
  Display: Flex
  Align-items: Center
  Gap: 16px
  Flex: 1
  Max-width: 600px
  
  // Advanced Filters Button
  .filter-button {
    Display: Flex
    Align-items: Center
    Gap: 8px
    Padding: 10px 16px
    Border: 2px solid $bg-soft
    Border-radius: $radius-md
    Color: $text-secondary
    
    &.active {
      Border-color: $action-purple
      Color: $action-purple
      Background: rgba($action-purple, 0.05)
    }
  }
}

// View Toggle
.view-toggle {
  Display: Flex
  Background: $bg-soft
  Padding: 4px
  Border-radius: $radius-md
  
  button {
    Padding: 8px 12px
    Border-radius: $radius-sm
    Color: $text-secondary
    
    &.active {
      Background: White
      Color: $text-primary
      Box-shadow: $shadow-sm
    }
  }
}

// Table View
.contacts-table {
  Background: White
  Margin: 32px
  Border-radius: $radius-xl
  Overflow: Hidden
  Box-shadow: $shadow-lg
  
  table {
    Width: 100%
    
    thead {
      Background: $bg-soft
      
      th {
        Padding: 16px 24px
        Text-align: Left
        Font-size: $text-sm
        Font-weight: $font-semibold
        Color: $text-secondary
        Text-transform: Uppercase
        Letter-spacing: 0.05em
      }
    }
    
    tbody {
      tr {
        Border-bottom: 1px solid $bg-soft
        Transition: $transition-fast
        
        &:hover {
          Background: rgba($action-purple, 0.02)
        }
        
        td {
          Padding: 20px 24px
          
          .name-cell {
            Display: Flex
            Align-items: Center
            Gap: 12px
            
            .avatar {
              Width: 40px
              Height: 40px
              Border-radius: $radius-full
            }
          }
          
          .tag {
            Display: Inline-block
            Padding: 4px 12px
            Border-radius: 12px
            Font-size: $text-xs
            Font-weight: $font-medium
            
            &.lead { 
              Background: rgba($action-purple, 0.1)
              Color: $action-purple
            }
            
            &.customer {
              Background: rgba($action-green, 0.1)
              Color: $action-green
            }
          }
          
          .actions {
            Display: Flex
            Gap: 8px
            Opacity: 0
            Transition: $transition-fast
          }
        }
        
        &:hover .actions {
          Opacity: 1
        }
      }
    }
  }
}

// Grid View (Cards)
.contacts-grid {
  Display: Grid
  Grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))
  Gap: 24px
  Padding: 32px
  
  .contact-card {
    Background: White
    Border-radius: $radius-xl
    Padding: 24px
    Box-shadow: $shadow-md
    Transition: $transition-base
    Cursor: Pointer
    
    &:hover {
      Transform: translateY(-4px)
      Box-shadow: $shadow-lg
    }
    
    .card-header {
      Display: Flex
      Align-items: Center
      Gap: 16px
      Margin-bottom: 20px
      
      .avatar {
        Width: 64px
        Height: 64px
        Border-radius: $radius-full
      }
      
      .contact-name {
        Font-size: $text-lg
        Font-weight: $font-semibold
      }
    }
    
    .contact-details {
      Display: Grid
      Gap: 12px
      
      .detail-row {
        Display: Flex
        Align-items: Center
        Gap: 8px
        Font-size: $text-sm
        Color: $text-secondary
        
        .icon {
          Width: 16px
          Height: 16px
          Color: $text-light
        }
      }
    }
    
    .quick-actions {
      Display: Flex
      Gap: 8px
      Margin-top: 20px
      Padding-top: 20px
      Border-top: 1px solid $bg-soft
      
      button {
        Flex: 1
        Padding: 10px
        Border-radius: $radius-md
        Font-size: $text-sm
        Font-weight: $font-medium
        
        &.primary {
          Background: $action-purple
          Color: White
        }
        
        &.secondary {
          Background: $bg-soft
          Color: $text-secondary
        }
      }
    }
  }
}
🎯 Landing Page Builder
Mobile Version
scss
// Preview Mode Toggle
Position: Fixed
Bottom: 90px // Above nav
Left: 50%
Transform: translateX(-50%)
Background: White
Border-radius: $radius-full
Box-shadow: $shadow-lg
Padding: 4px
Display: Flex
Z-index: 50

.toggle-option {
  Padding: 10px 20px
  Border-radius: 24px
  Font-size: $text-sm
  Font-weight: $font-medium
  Color: $text-secondary
  
  &.active {
    Background: $action-purple
    Color: White
  }
}

// Component Palette (Bottom Sheet)
.component-sheet {
  Position: Fixed
  Bottom: 0
  Left: 0
  Right: 0
  Background: White
  Border-radius: $radius-xl $radius-xl 0 0
  Box-shadow: 0 -4px 20px rgba(0,0,0,0.1)
  Transform: translateY(calc(100% - 140px))
  Transition: $transition-base
  
  &.expanded {
    Transform: translateY(0)
  }
  
  .sheet-handle {
    Width: 40px
    Height: 4px
    Background: $bg-soft
    Border-radius: 2px
    Margin: 12px auto
  }
  
  .sheet-title {
    Text-align: Center
    Font-size: $text-lg
    Font-weight: $font-semibold
    Padding-bottom: 16px
  }
  
  .components-grid {
    Display: Grid
    Grid-template-columns: repeat(3, 1fr)
    Gap: 12px
    Padding: 0 16px 20px
    Max-height: 300px
    Overflow-y: Auto
    
    .component-item {
      Background: $bg-soft
      Border-radius: $radius-md
      Padding: 16px
      Text-align: Center
      Display: Flex
      Flex-direction: Column
      Align-items: Center
      Gap: 8px
      
      .icon {
        Width: 32px
        Height: 32px
        Color: $action-purple
      }
      
      .label {
        Font-size: $text-xs
        Color: $text-secondary
      }
    }
  }
}

// Canvas Area
.mobile-canvas {
  Background: $gradient-main
  Min-height: 100vh
  Padding: 16px
  Padding-bottom: 240px // Space for bottom sheet
  
  .canvas-container {
    Background: White
    Border-radius: $radius-xl
    Min-height: 600px
    Box-shadow: $shadow-lg
    Overflow: Hidden
    
    // Drop Zone Indicator
    .drop-zone {
      Border: 2px dashed $action-purple
      Border-radius: $radius-md
      Padding: 40px 20px
      Text-align: Center
      Color: $action-purple
      Margin: 16px
      
      .icon {
        Width: 48px
        Height: 48px
        Margin: 0 auto 12px
        Opacity: 0.5
      }
    }
  }
}
Desktop Version
scss
// Three Panel Layout
Margin-left: 260px
Display: Grid
Grid-template-columns: 300px 1fr 320px
Height: 100vh

// Left Panel - Components
Background: White
Border-right: 1px solid $bg-soft
Overflow-y: Auto
Padding: 24px

.component-categories {
  .category {
    Margin-bottom: 24px
    
    .category-title {
      Font-size: $text-sm
      Font-weight: $font-semibold
      Color: $text-secondary
      Text-transform: Uppercase
      Letter-spacing: 0.05em
      Margin-bottom: 12px
    }
    
    .component-list {
      Display: Grid
      Gap: 8px
      
      .component-card {
        Background: $bg-soft
        Border: 2px solid transparent
        Border-radius: $radius-md
        Padding: 12px
        Cursor: Grab
        Transition: $transition-fast
        
        &:hover {
          Border-color: $action-purple
          Background: White
          Box-shadow: $shadow-sm
        }
        
        &:active {
          Cursor: Grabbing
        }
        
        .preview {
          Width: 100%
          Height: 60px
          Background: White
          Border-radius: $radius-sm
          Margin-bottom: 8px
          Display: Flex
          Align-items: Center
          Justify-content: Center
        }
        
        .name {
          Font-size: $text-sm
          Font-weight: $font-medium
        }
      }
    }
  }
}

// Center Panel - Canvas
Background: $gradient-main
Padding: 32px
Overflow-y: Auto

.canvas-wrapper {
  Max-width: 1200px
  Margin: 0 auto
  
  .device-frame {
    Background: White
    Border-radius: $radius-xl
    Box-shadow: $shadow-lg
    Min-height: 800px
    Position: Relative
    
    // Responsive toggles
    .device-toggles {
      Position: Absolute
      Top: -48px
      Right: 0
      Display: Flex
      Gap: 8px
      
      button {
        Padding: 8px 16px
        Background: White
        Border-radius: $radius-md
        Border: 2px solid $bg-soft
        Color: $text-secondary
        
        &.active {
          Border-color: $action-purple
          Color: $action-purple
        }
      }
    }
    
    .canvas {
      Padding: 32px
      Min-height: 100%
      
      // Component on canvas
      .canvas-component {
        Position: Relative
        Margin-bottom: 16px
        Border: 2px solid transparent
        Border-radius: $radius-md
        Transition: $transition-fast
        
        &:hover {
          Border-color: $action-purple
          
          .component-controls {
            Opacity: 1
          }
        }
        
        &.selected {
          Border-color: $action-purple
          Box-shadow: 0 0 0 4px rgba($action-purple, 0.1)
        }
        
        .component-controls {
          Position: Absolute
          Top: -36px
          Right: 0
          Display: Flex
          Gap: 4px
          Background: White
          Padding: 4px
          Border-radius: $radius-md
          Box-shadow: $shadow-md
          Opacity: 0
          Transition: $transition-fast
          
          button {
            Width: 28px
            Height: 28px
            Border-radius: $radius-sm
            Display: Flex
            Align-items: Center
            Justify-content: Center
            Color: $text-secondary
            
            &:hover {
              Background: $bg-soft
            }
          }
        }
      }
    }
  }
}

// Right Panel - Properties
Background: White
Border-left: 1px solid $bg-soft
Overflow-y: Auto
Padding: 24px

.properties-panel {
  .panel-section {
    Margin-bottom: 32px
    
    .section-title {
      Font-size: $text-base
      Font-weight: $font-semibold
      Margin-bottom: 16px
      Display: Flex
      Align-items: Center
      Justify-content: Space-between
    }
    
    .property-group {
      Margin-bottom: 16px
      
      label {
        Display: Block
        Font-size: $text-sm
        Color: $text-secondary
        Margin-bottom: 8px
      }
      
      input, select, textarea {
        Width: 100%
        Padding: 10px 12px
        Border: 2px solid $bg-soft
        Border-radius: $radius-md
        Font-size: $text-sm
        
        &:focus {
          Border-color: $action-purple
          Outline: None
        }
      }
      
      // Color Picker
      .color-picker {
        Display: Grid
        Grid-template-columns: repeat(6, 1fr)
        Gap: 8px
        
        .color-swatch {
          Width: 36px
          Height: 36px
          Border-radius: $radius-sm
          Cursor: Pointer
          Position: Relative
          
          &.selected::after {
            Content: '✓'
            Position: Absolute
            Color: White
            Font-weight: Bold
            Top: 50%
            Left: 50%
            Transform: translate(-50%, -50%)
          }
        }
      }
    }
  }
}

// Publishing Bar
Position: Fixed
Bottom: 0
Left: 260px
Right: 0
Background: White
Padding: 16px 32px
Box-shadow: 0 -2px 10px rgba(0,0,0,0.05)
Display: Flex
Justify-content: Space-between
Align-items: Center

.save-status {
  Display: Flex
  Align-items: Center
  Gap: 8px
  Color: $text-light
  Font-size: $text-sm
  
  .status-icon {
    Width: 16px
    Height: 16px
    Color: $action-green
  }
}

.publish-actions {
  Display: Flex
  Gap: 12px
  
  button {
    Padding: 10px 24px
    Border-radius: $radius-md
    Font-weight: $font-medium
    
    &.secondary {
      Background: $bg-soft
      Color: $text-secondary
    }
    
    &.primary {
      Background: $action-purple
      Color: White
    }
  }
}
🎓 Training Page
Mobile Version
scss
// Header Stats
Background: Linear-gradient(135deg, $action-purple 0%, $action-golden 100%)
Padding: 24px 16px
Color: White

.stats-row {
  Display: Grid
  Grid-template-columns: repeat(3, 1fr)
  Gap: 12px
  Margin-top: 16px
  
  .stat-card {
    Background: rgba(255,255,255,0.15)
    Backdrop-filter: blur(10px)
    Padding: 16px
    Border-radius: $radius-md
    Text-align: Center
    
    .number {
      Font-size: $text-xl
      Font-weight: $font-bold
    }
    
    .label {
      Font-size: $text-xs
      Opacity: 0.9
      Margin-top: 4px
    }
  }
}

// Course Categories
.category-tabs {
  Background: White
  Padding: 16px
  Display: Flex
  Gap: 8px
  Overflow-x: Auto
  Box-shadow: $shadow-sm
  
  .tab {
    Padding: 8px 16px
    Border-radius: 20px
    White-space: Nowrap
    Background: $bg-soft
    Color: $text-secondary
    
    &.active {
      Background: $action-purple
      Color: White
    }
  }
}

// Course List
Padding: 16px
Background: $gradient-dawn

.course-card {
  Background: White
  Border-radius: $radius-xl
  Overflow: Hidden
  Margin-bottom: 16px
  Box-shadow: $shadow-md
  
  .thumbnail {
    Width: 100%
    Height: 180px
    Object-fit: Cover
    Position: Relative
    
    .duration-badge {
      Position: Absolute
      Bottom: 12px
      Right: 12px
      Background: rgba(0,0,0,0.7)
      Color: White
      Padding: 4px 12px
      Border-radius: 16px
      Font-size: $text-xs
    }
    
    .progress-overlay {
      Position: Absolute
      Bottom: 0
      Left: 0
      Right: 0
      Height: 4px
      Background: rgba(0,0,0,0.2)
      
      .progress-bar {
        Height: 100%
        Background: $action-green
        Width: var(--progress)
      }
    }
  }
  
  .course-content {
    Padding: 20px
    
    .course-title {
      Font-size: $text-lg
      Font-weight: $font-semibold
      Margin-bottom: 8px
    }
    
    .instructor {
      Display: Flex
      Align-items: Center
      Gap: 8px
      Font-size: $text-sm
      Color: $text-light
      Margin-bottom: 12px
      
      .avatar {
        Width: 24px
        Height: 24px
        Border-radius: $radius-full
      }
    }
    
    .course-meta {
      Display: Flex
      Justify-content: Space-between
      Align-items: Center
      
      .rating {
        Display: Flex
        Align-items: Center
        Gap: 4px
        
        .stars {
          Color: $action-golden
        }
        
        .count {
          Font-size: $text-xs
          Color: $text-light
        }
      }
      
      .continue-btn {
        Background: $action-purple
        Color: White
        Padding: 8px 16px
        Border-radius: $radius-full
        Font-size: $text-sm
        Font-weight: $font-medium
      }
    }
  }
}

// Achievement Celebration Modal
.achievement-modal {
  Position: Fixed
  Top: 0
  Left: 0
  Right: 0
  Bottom: 0
  Background: rgba(0,0,0,0.8)
  Display: Flex
  Align-items: Center
  Justify-content: Center
  Z-index: 100
  
  .achievement-content {
    Background: White
    Border-radius: $radius-xl
    Padding: 32px
    Text-align: Center
    Max-width: 320px
    
    .trophy-icon {
      Width: 80px
      Height: 80px
      Background: Linear-gradient(135deg, $action-golden 0%, #FFA000 100%)
      Border-radius: $radius-full
      Display: Flex
      Align-items: Center
      Justify-content: Center
      Margin: 0 auto 20px
      
      // Pulse animation
      Animation: pulse 1s ease-out infinite
    }
    
    h3 {
      Font-size: $text-xl
      Font-weight: $font-bold
      Margin-bottom: 8px
    }
    
    p {
      Font-size: $text-base
      Color: $text-secondary
      Margin-bottom: 24px
    }
    
    button {
      Background: $action-purple
      Color: White
      Padding: 12px 32px
      Border-radius: $radius-full
      Font-weight: $font-medium
    }
  }
}
Desktop Version
scss
// Page Layout
Margin-left: 260px
Background: $gradient-dawn
Min-height: 100vh

// Hero Section
Background: Linear-gradient(135deg, $action-purple 0%, $action-golden 100%)
Padding: 48px 32px
Color: White

.hero-content {
  Max-width: 1200px
  Margin: 0 auto
  Display: Grid
  Grid-template-columns: 1fr auto
  Gap: 32px
  Align-items: Center
  
  .hero-text {
    h1 {
      Font-size: $text-3xl
      Font-weight: $font-bold
      Margin-bottom: 16px
    }
    
    p {
      Font-size: $text-lg
      Opacity: 0.9
      Margin-bottom: 24px
    }
    
    .cta-buttons {
      Display: Flex
      Gap: 16px
      
      button {
        Padding: 14px 28px
        Border-radius: $radius-full
        Font-weight: $font-medium
        
        &.primary {
          Background: White
          Color: $action-purple
        }
        
        &.secondary {
          Background: rgba(255,255,255,0.2)
          Border: 2px solid White
          Color: White
        }
      }
    }
  }
  
  .hero-stats {
    Display: Grid
    Grid-template-columns: repeat(2, 1fr)
    Gap: 20px
    
    .stat-box {
      Background: rgba(255,255,255,0.15)
      Backdrop-filter: blur(10px)
      Padding: 24px
      Border-radius: $radius-lg
      Text-align: Center
      
      .number {
        Font-size: $text-2xl
        Font-weight: $font-bold
      }
      
      .label {
        Font-size: $text-sm
        Opacity: 0.9
      }
    }
  }
}

// Course Grid
Padding: 32px
Max-width: 1400px
Margin: 0 auto

.section-header {
  Display: Flex
  Justify-content: Space-between
  Align-items: Center
  Margin-bottom: 24px
  
  h2 {
    Font-size: $text-2xl
    Font-weight: $font-bold
  }
  
  .view-all {
    Color: $action-purple
    Font-weight: $font-medium
    Display: Flex
    Align-items: Center
    Gap: 4px
  }
}

.courses-grid {
  Display: Grid
  Grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))
  Gap: 24px
  
  .course-card {
    Background: White
    Border-radius: $radius-xl
    Overflow: Hidden
    Box-shadow: $shadow-md
    Transition: $transition-base
    Cursor: Pointer
    
    &:hover {
      Transform: translateY(-4px)
      Box-shadow: $shadow-lg
      
      .thumbnail img {
        Transform: scale(1.05)
      }
      
      .play-button {
        Opacity: 1
      }
    }
    
    .thumbnail {
      Position: Relative
      Overflow: Hidden
      Height: 200px
      
      img {
        Width: 100%
        Height: 100%
        Object-fit: Cover
        Transition: $transition-base
      }
      
      .play-button {
        Position: Absolute
        Top: 50%
        Left: 50%
        Transform: translate(-50%, -50%)
        Width: 64px
        Height: 64px
        Background: rgba(255,255,255,0.9)
        Border-radius: $radius-full
        Display: Flex
        Align-items: Center
        Justify-content: Center
        Opacity: 0
        Transition: $transition-base
        
        .icon {
          Width: 24px
          Height: 24px
          Color: $action-purple
          Margin-left: 4px // Visual centering
        }
      }
    }
  }
}

// Learning Path Section
.learning-path {
  Background: White
  Border-radius: $radius-xl
  Padding: 32px
  Margin: 32px
  Box-shadow: $shadow-lg
  
  .path-header {
    Display: Flex
    Align-items: Center
    Gap: 16px
    Margin-bottom: 32px
    
    .path-icon {
      Width: 64px
      Height: 64px
      Background: Linear-gradient(135deg, $action-purple 0%, $action-coral 100%)
      Border-radius: $radius-lg
      Display: Flex
      Align-items: Center
      Justify-content: Center
      
      .icon {
        Width: 32px
        Height: 32px
        Color: White
      }
    }
    
    .path-info {
      Flex: 1
      
      h3 {
        Font-size: $text-xl
        Font-weight: $font-bold
        Margin-bottom: 4px
      }
      
      p {
        Color: $text-secondary
      }
    }
    
    .path-progress {
      Text-align: Right
      
      .percentage {
        Font-size: $text-2xl
        Font-weight: $font-bold
        Color: $action-purple
      }
      
      .label {
        Font-size: $text-sm
        Color: $text-light
      }
    }
  }
  
  .path-steps {
    Display: Flex
    Flex-direction: Column
    Gap: 0
    
    .step {
      Display: Flex
      Align-items: Center
      Gap: 24px
      Padding: 20px
      Position: Relative
      
      // Connection line
      &:not(:last-child)::after {
        Content: ''
        Position: Absolute
        Left: 28px
        Top: 60px
        Width: 2px
        Height: calc(100% - 20px)
        Background: $bg-soft
      }
      
      &.completed::after {
        Background: $action-green
      }
      
      .step-indicator {
        Width: 56px
        Height: 56px
        Border-radius: $radius-full
        Display: Flex
        Align-items: Center
        Justify-content: Center
        Font-weight: $font-bold
        Position: Relative
        Z-index: 1
        
        &.completed {
          Background: $action-green
          Color: White
        }
        
        &.current {
          Background: $action-purple
          Color: White
          Box-shadow: 0 0 0 4px rgba($action-purple, 0.2)
        }
        
        &.upcoming {
          Background: $bg-soft
          Color: $text-light
        }
      }
      
      .step-content {
        Flex: 1
        
        .step-title {
          Font-size: $text-base
          Font-weight: $font-semibold
          Margin-bottom: 4px
        }
        
        .step-duration {
          Font-size: $text-sm
          Color: $text-light
        }
      }
      
      .step-action {
        button {
          Padding: 8px 20px
          Border-radius: $radius-full
          Font-size: $text-sm
          Font-weight: $font-medium
          
          &.start {
            Background: $action-purple
            Color: White
          }
          
          &.continue {
            Background: $action-green
            Color: White
          }
          
          &.locked {
            Background: $bg-soft
            Color: $text-light
            Cursor: Not-allowed
          }
        }
      }
    }
  }
}
🌳 Team Page
Mobile Version
scss
// Team Overview Header
Background: Linear-gradient(135deg, $action-purple 0%, $action-teal 100%)
Padding: 24px 16px
Color: White

.team-summary {
  Text-align: Center
  
  h1 {
    Font-size: $text-xl
    Font-weight: $font-bold
    Margin-bottom: 20px
  }
  
  .summary-grid {
    Display: Grid
    Grid-template-columns: 1fr 1fr
    Gap: 12px
    
    .summary-card {
      Background: rgba(255,255,255,0.15)
      Backdrop-filter: blur(10px)
      Padding: 16px
      Border-radius: $radius-lg
      
      .icon {
        Width: 32px
        Height: 32px
        Margin: 0 auto 8px
        Opacity: 0.9
      }
      
      .number {
        Font-size: $text-2xl
        Font-weight: $font-bold
      }
      
      .label {
        Font-size: $text-xs
        Opacity: 0.9
        Margin-top: 4px
      }
      
      .change {
        Font-size: $text-xs
        Margin-top: 4px
        Display: Flex
        Align-items: Center
        Justify-content: Center
        Gap: 4px
        
        &.positive {
          Color: $action-green
        }
        
        &.negative {
          Color: $action-coral
        }
      }
    }
  }
}

// View Toggle
Background: White
Padding: 12px 16px
Display: Flex
Justify-content: Center
Box-shadow: $shadow-sm

.view-toggle {
  Display: Flex
  Background: $bg-soft
  Padding: 4px
  Border-radius: $radius-full
  
  button {
    Padding: 8px 20px
    Border-radius: 20px
    Font-size: $text-sm
    Font-weight: $font-medium
    Color: $text-secondary
    
    &.active {
      Background: White
      Color: $action-purple
      Box-shadow: $shadow-sm
    }
  }
}

// Team List View
Background: $gradient-main
Padding: 16px
Min-height: 100vh

.team-member-card {
  Background: White
  Border-radius: $radius-lg
  Padding: 16px
  Margin-bottom: 12px
  Box-shadow: $shadow-sm
  
  .member-header {
    Display: Flex
    Align-items: Center
    Gap: 12px
    Margin-bottom: 16px
    
    .avatar {
      Width: 56px
      Height: 56px
      Border-radius: $radius-full
      Border: 3px solid White
      Box-shadow: $shadow-sm
      Position: Relative
      
      .status-dot {
        Position: Absolute
        Bottom: 2px
        Right: 2px
        Width: 14px
        Height: 14px
        Border-radius: $radius-full
        Border: 2px solid White
        
        &.active {
          Background: $action-green
        }
        
        &.inactive {
          Background: $text-light
        }
      }
    }
    
    .member-info {
      Flex: 1
      
      .name {
        Font-size: $text-base
        Font-weight: $font-semibold
        Color: $text-primary
      }
      
      .role {
        Font-size: $text-sm
        Color: $text-light
        Display: Flex
        Align-items: Center
        Gap: 4px
        
        .level-badge {
          Background: $action-golden
          Color: White
          Padding: 2px 8px
          Border-radius: 10px
          Font-size: 11px
          Font-weight: $font-medium
        }
      }
    }
    
    .quick-actions {
      Display: Flex
      Gap: 8px
      
      button {
        Width: 32px
        Height: 32px
        Border-radius: $radius-full
        Border: 1px solid $bg-soft
        Display: Flex
        Align-items: Center
        Justify-content: Center
        Color: $text-secondary
        
        &:active {
          Background: $bg-soft
        }
      }
    }
  }
  
  .member-stats {
    Display: Grid
    Grid-template-columns: repeat(3, 1fr)
    Gap: 12px
    
    .stat {
      Text-align: Center
      Padding: 12px
      Background: $bg-soft
      Border-radius: $radius-md
      
      .value {
        Font-size: $text-lg
        Font-weight: $font-bold
        Color: $text-primary
      }
      
      .label {
        Font-size: $text-xs
        Color: $text-light
        Margin-top: 2px
      }
    }
  }
}

// Tree View (Simplified for mobile)
.tree-mobile {
  Background: White
  Border-radius: $radius-xl
  Padding: 20px
  Margin: 16px
  
  .tree-note {
    Background: $bg-soft
    Padding: 12px
    Border-radius: $radius-md
    Text-align: Center
    Font-size: $text-sm
    Color: $text-secondary
    Margin-bottom: 20px
    
    .icon {
      Width: 16px
      Height: 16px
      Margin-right: 4px
    }
  }
  
  // Show hierarchical list instead of tree
  .tree-list {
    .tree-item {
      Padding: 12px
      Border-left: 3px solid $bg-soft
      Margin-left: var(--level) * 20px
      
      &.active {
        Border-left-color: $action-purple
        Background: rgba($action-purple, 0.05)
      }
    }
  }
}
Desktop Version
scss
// Page Layout
Margin-left: 260px
Background: $gradient-main
Min-height: 100vh

// Page Header
Background: White
Padding: 24px 32px
Box-shadow: $shadow-sm
Display: Flex
Justify-content: Space-between
Align-items: Center

.header-left {
  h1 {
    Font-size: $text-2xl
    Font-weight: $font-bold
    Margin-bottom: 4px
  }
  
  p {
    Color: $text-secondary
  }
}

.header-actions {
  Display: Flex
  Gap: 12px
  
  button {
    Padding: 10px 20px
    Border-radius: $radius-md
    Font-weight: $font-medium
    Display: Flex
    Align-items: Center
    Gap: 8px
    
    &.primary {
      Background: $action-purple
      Color: White
    }
    
    &.secondary {
      Background: $bg-soft
      Color: $text-secondary
    }
  }
}

// Team Statistics Bar
Background: White
Margin: 32px
Border-radius: $radius-xl
Padding: 24px
Box-shadow: $shadow-md
Display: Grid
Grid-template-columns: repeat(5, 1fr)
Gap: 24px

.stat-card {
  Text-align: Center
  Position: Relative
  
  &:not(:last-child)::after {
    Content: ''
    Position: Absolute
    Right: -12px
    Top: 10%
    Height: 80%
    Width: 1px
    Background: $bg-soft
  }
  
  .stat-icon {
    Width: 48px
    Height: 48px
    Background: Gradient based on stat type
    Border-radius: $radius-md
    Display: Flex
    Align-items: Center
    Justify-content: Center
    Margin: 0 auto 12px
    
    .icon {
      Width: 24px
      Height: 24px
      Color: White
    }
  }
  
  .stat-value {
    Font-size: $text-2xl
    Font-weight: $font-bold
    Color: $text-primary
    Margin-bottom: 4px
  }
  
  .stat-label {
    Font-size: $text-sm
    Color: $text-secondary
  }
  
  .stat-change {
    Font-size: $text-xs
    Margin-top: 8px
    Display: Inline-flex
    Align-items: Center
    Gap: 4px
    Padding: 4px 8px
    Border-radius: 12px
    
    &.positive {
      Background: rgba($action-green, 0.1)
      Color: $action-green
    }
    
    &.negative {
      Background: rgba($action-coral, 0.1)
      Color: $action-coral
    }
  }
}

// Tree View Container
.tree-view-container {
  Background: White
  Margin: 0 32px 32px
  Border-radius: $radius-xl
  Padding: 32px
  Box-shadow: $shadow-lg
  Position: Relative
  Overflow: Hidden
  
  // Controls
  .tree-controls {
    Position: Absolute
    Top: 24px
    Right: 24px
    Display: Flex
    Gap: 8px
    
    button {
      Padding: 8px 12px
      Background: $bg-soft
      Border-radius: $radius-md
      Color: $text-secondary
      Font-size: $text-sm
      
      &:hover {
        Background: $bg-hover
      }
    }
  }
  
  // Tree Canvas
  .tree-canvas {
    Min-height: 600px
    Position: Relative
    
    // SVG for connection lines
    svg {
      Position: Absolute
      Top: 0
      Left: 0
      Width: 100%
      Height: 100%
      Pointer-events: None
      
      path {
        Stroke: #E2E8F0
        Stroke-width: 2
        Fill: None
      }
      
      path.active {
        Stroke: $action-purple
        Stroke-width: 3
      }
    }
    
    // Team Member Nodes
    .tree-node {
      Position: Absolute
      Background: White
      Border: 2px solid #E2E8F0
      Border-radius: $radius-lg
      Padding: 16px
      Min-width: 200px
      Cursor: Pointer
      Transition: $transition-base
      
      &:hover {
        Border-color: $action-purple
        Box-shadow: $shadow-md
        Transform: scale(1.02)
      }
      
      &.selected {
        Border-color: $action-purple
        Box-shadow: 0 0 0 4px rgba($action-purple, 0.1)
      }
      
      &.root {
        Border-color: $action-golden
        Background: Linear-gradient(135deg, rgba($action-golden, 0.05) 0%, rgba($action-purple, 0.05) 100%)
      }
      
      .node-header {
        Display: Flex
        Align-items: Center
        Gap: 12px
        Margin-bottom: 12px
        
        .avatar {
          Width: 48px
          Height: 48px
          Border-radius: $radius-full
        }
        
        .node-info {
          Flex: 1
          
          .name {
            Font-size: $text-sm
            Font-weight: $font-semibold
          }
          
          .level {
            Font-size: $text-xs
            Color: $text-light
          }
        }
      }
      
      .node-stats {
        Display: Grid
        Grid-template-columns: 1fr 1fr
        Gap: 8px
        Font-size: $text-xs
        
        .stat {
          Display: Flex
          Align-items: Center
          Gap: 4px
          
          .icon {
            Width: 14px
            Height: 14px
            Color: $text-light
          }
          
          .value {
            Font-weight: $font-medium
          }
        }
      }
      
      // Expand/Collapse button
      .expand-btn {
        Position: Absolute
        Bottom: -12px
        Left: 50%
        Transform: translateX(-50%)
        Width: 24px
        Height: 24px
        Background: White
        Border: 2px solid #E2E8F0
        Border-radius: $radius-full
        Display: Flex
        Align-items: Center
        Justify-content: Center
        Cursor: Pointer
        
        &:hover {
          Border-color: $action-purple
          Background: $bg-soft
        }
      }
    }
  }
}

// Team Member Detail Panel (Slides in from right)
.member-detail-panel {
  Position: Fixed
  Right: 0
  Top: 0
  Height: 100vh
  Width: 400px
  Background: White
  Box-shadow: -4px 0 20px rgba(0,0,0,0.1)
  Transform: translateX(100%)
  Transition: $transition-base
  Z-index: 100
  Overflow-y: Auto
  
  &.open {
    Transform: translateX(0)
  }
  
  .panel-header {
    Padding: 24px
    Border-bottom: 1px solid $bg-soft
    Display: Flex
    Justify-content: Space-between
    Align-items: Center
    
    h3 {
      Font-size: $text-lg
      Font-weight: $font-semibold
    }
    
    .close-btn {
      Width: 32px
      Height: 32px
      Border-radius: $radius-full
      Display: Flex
      Align-items: Center
      Justify-content: Center
      Color: $text-secondary
      
      &:hover {
        Background: $bg-soft
      }
    }
  }
  
  .panel-content {
    Padding: 24px
    
    // Member profile section
    .member-profile {
      Display: Flex
      Flex-direction: Column
      Align-items: Center
      Text-align: Center
      Padding-bottom: 24px
      Border-bottom: 1px solid $bg-soft
      
      .avatar {
        Width: 80px
        Height: 80px
        Border-radius: $radius-full
        Margin-bottom: 16px
      }
      
      .name {
        Font-size: $text-xl
        Font-weight: $font-semibold
        Margin-bottom: 4px
      }
      
      .role {
        Color: $text-secondary
        Margin-bottom: 12px
      }
      
      .contact-buttons {
        Display: Flex
        Gap: 8px
        
        button {
          Padding: 8px 16px
          Border-radius: $radius-full
          Font-size: $text-sm
          
          &.primary {
            Background: $action-purple
            Color: White
          }
          
          &.secondary {
            Background: $bg-soft
            Color: $text-secondary
          }
        }
      }
    }
    
    // Performance metrics
    .performance-section {
      Margin-top: 24px
      
      h4 {
        Font-size: $text-base
        Font-weight: $font-semibold
        Margin-bottom: 16px
      }
      
      .metric-grid {
        Display: Grid
        Grid-template-columns: 1fr 1fr
        Gap: 12px
        
        .metric-card {
          Background: $bg-soft
          Padding: 16px
          Border-radius: $radius-md
          Text-align: Center
          
          .value {
            Font-size: $text-xl
            Font-weight: $font-bold
            Color: Metric-specific color
          }
          
          .label {
            Font-size: $text-xs
            Color: $text-secondary
            Margin-top: 4px
          }
        }
      }
    }
    
    // Activity timeline
    .activity-timeline {
      Margin-top: 32px
      
      h4 {
        Font-size: $text-base
        Font-weight: $font-semibold
        Margin-bottom: 16px
      }
      
      .timeline-item {
        Display: Flex
        Gap: 12px
        Margin-bottom: 16px
        
        .timeline-dot {
          Width: 8px
          Height: 8px
          Border-radius: $radius-full
          Background: $action-purple
          Margin-top: 6px
          Position: Relative
          
          &::after {
            Content: ''
            Position: Absolute
            Top: 12px
            Left: 3px
            Width: 2px
            Height: 40px
            Background: $bg-soft
          }
        }
        
        &:last-child .timeline-dot::after {
          Display: None
        }
        
        .timeline-content {
          Flex: 1
          
          .activity {
            Font-size: $text-sm
            Color: $text-primary
            Margin-bottom: 4px
          }
          
          .time {
            Font-size: $text-xs
            Color: $text-light
          }
        }
      }
    }
  }
}
🎯 Key Implementation Notes
Mobile-First Approach
All designs start with mobile and scale up
Touch targets minimum 44px
Bottom navigation always visible
No hamburger menus - everything accessible
Color Psychology
Warm gradients create welcoming atmosphere
Action colors are vibrant but not overwhelming
Success states use green with celebration elements
Shadows are colored to match their context
Microinteractions
Subtle hover effects on all interactive elements
Progress indicators animate on load
Success states include small celebrations
Page transitions use smooth animations
Accessibility
High contrast ratios throughout
Large, readable fonts
Clear focus indicators
Descriptive labels and helper text
Performance
Use CSS transforms for animations
Lazy load images and heavy content
Skeleton screens while loading
Optimize gradient usage
