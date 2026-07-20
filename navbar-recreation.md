# Navbar design handoff: glassmorphism + animation only

Use this as a prompt for another IDE or AI coding assistant.

## Source references in this project
- Component logic: [src/components/Navbar.jsx](src/components/Navbar.jsx)
- Visual styling: [src/index.css](src/index.css)

## Goal
Recreate the overall navbar feel and motion from this project, but do not copy the exact content. Use placeholder labels if needed.

Focus on:
- the glassmorphism look
- the pill-shaped floating nav container
- the subtle expand/shrink animation on scroll
- the animated active-link behavior
- the theme toggle interaction

## Visual style to recreate

### Overall structure
- Fixed at the top of the page
- Centered horizontally
- Slightly inset from the edges with a rounded pill shape
- Contains:
  - logo on the left
  - nav links in the middle/right
  - a theme toggle button on the far right

### Glassmorphism treatment
Use a translucent frosted effect with:
- a semi-transparent background
- a soft blur backdrop
- a thin border
- a subtle inner highlight
- a light shadow to make it feel elevated

Suggested styling direction:
- background: semi-transparent, slightly darker/lighter than the page background
- border: thin and softx
- backdrop-filter: blur around 18px
- box-shadow: subtle, soft, and slightly diffused
- transition: smooth and gentle on hover/scroll changes

### Interaction states
- Links change color on hover
- The active link gets a filled pill background
- The theme toggle uses a simple circular switch animation

## Animation logic to reproduce

### 1) Scroll-based nav compression
When the page scrolls beyond a small threshold:
- the navbar becomes slightly narrower
- it gains a more pronounced shadow
- the container feels more “sticky” and polished

In this project, the logic is:
- trigger when window scroll position is greater than 60px
- add a class like `scrolled`
- change the nav width and shadow styling

### 2) Active link highlighting
The active section is detected with `IntersectionObserver`.
- watch the page sections with IDs such as `home`, `about`, `projects`, `work`, and `hire`
- when one enters the viewport, mark that link as active
- use a root margin to make the highlight feel natural and not too jumpy

### 3) Theme toggle animation
The toggle button uses a simple switch-style animation:
- a circular knob moves from left to right
- the button background changes slightly
- the motion is smooth and short

## Implementation notes
If you are building this in React + CSS:

### React structure
Create a component with:
- a `scrolled` state
- an `activeLink` state
- a scroll event listener to toggle `scrolled`
- an `IntersectionObserver` to update `activeLink`

### CSS ideas
Use a base nav container with:
- `position: fixed`
- `top` spacing
- `display: flex; justify-content: center;`
- `z-index` high enough to sit above content

Inside the nav, use:
- a pill-shaped inner container
- `backdrop-filter: blur(...)`
- `border: 1px solid ...`
- `transition` for width, shadow, and background changes

## Copy-paste prompt for another AI

“Build a modern navbar for a portfolio website that matches the overall aesthetic of the provided reference, but do not copy the exact copy content. Focus on the visual language only: a fixed top-centered pill-shaped navigation bar with a frosted glassmorphism effect, subtle border and shadow, smooth hover states, and polished micro-interactions. Implement a scroll-based animation where the navbar slightly shrinks and gains depth after scrolling past a threshold. Add active-link highlighting based on the section currently in view using IntersectionObserver. Include a compact theme-toggle button with a simple switch animation. Keep the implementation clean, minimal, and modern.”

## What to avoid
- Do not copy the exact text content from the navbar
- Do not overdo the animation; keep it elegant and subtle
- Do not make the effect too opaque or too heavy; preserve the airy glass feel
