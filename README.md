# Melwin Dave D. Abe - Portfolio

Personal portfolio website for Melwin Dave D. Abe, a full-stack developer specializing in Vue.js, PHP, Laravel, and modern web technologies.

## Overview

This is a responsive static website that presents:

- A dynamic hero section with animated role text and visual effects
- Projects loaded from the public GitHub API
- Education and professional experience
- About and technology sections
- Contact links and a downloadable resume

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- GSAP and ScrollTrigger for animations
- GitHub REST API for project data

## Getting Started

No package installation or build process is required.

1. Clone or download this repository.
2. Open `index.html` in a browser.

For the most reliable experience, serve the folder through a local web server:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Project Structure

| File or folder | Description |
| --- | --- |
| `index.html` | Main portfolio page |
| `index.css` | Portfolio styles and responsive layout |
| `index.js` | Portfolio animations, interactions, and GitHub integration |
| `images/` | Images and icons used by the website |
| `fonts/` | Local font files |

## GitHub Projects

The projects section fetches public repositories for the GitHub username configured in the `data-github-username` attribute in `index.html`. Update that attribute if the portfolio owner changes.

## Contact Form Setup

The contact form supports a real email service when you add a Formspree or similar endpoint to the form HTML:

```html
<form class="contact__form" data-form-endpoint="https://formspree.io/f/your-form-id" ...>
```

If no endpoint is configured, the form falls back to opening the visitor's default email app with a pre-filled message so they can send it manually.

## Deployment

Because this is a static website, it can be deployed to GitHub Pages, Netlify, Vercel, or any static hosting provider. Upload the project files while preserving the `images/` and `fonts/` directories.

## Author

**Melwin Dave D. Abe**

- GitHub: [@abemelwin](https://github.com/abemelwin)
- Facebook: [AbeMelwin](https://www.facebook.com/AbeMelwin)
- Email: [abemelwin01@gmail.com](mailto:abemelwin01@gmail.com)