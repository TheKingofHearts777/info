# Dylan Brodie Portfolio

This repository contains a static personal portfolio website for Dylan Brodie. The site highlights education, technical skills, work experience, contact information, and selected course and personal projects.

## Overview

The portfolio is built with plain HTML, CSS, and a small amount of JavaScript. It is designed to be simple to host with GitHub Pages or any static web hosting service.

## Pages

- `index.html`: Home page with profile image, education, skills, and work experience
- `projects.html`: Project gallery with cards linking to individual project pages and repositories
- `about.html`: Educational background and hobbies
- `contact.html`: Email and LinkedIn contact links
- Individual project detail pages:
  - `portfolio-site.html`
  - `web-based-virtualization-lab-environment.html`
  - `country-guessing-game.html`
  - `interactive-maps.html`
  - `classroom-attendance-app.html`
  - `budget-management-app.html`

## Featured Projects

The projects page currently includes:

- Portfolio Site
- Web-Based Virtualization Lab Environment
- Country Guessing Game
- Interactive Maps
- Classroom Attendance App
- Budget Management App

## Technologies Used

- HTML
- CSS
- JavaScript
- GitHub Pages

## Site Structure

```text
info/
├── index.html
├── projects.html
├── about.html
├── contact.html
├── portfolio-site.html
├── web-based-virtualization-lab-environment.html
├── country-guessing-game.html
├── interactive-maps.html
├── classroom-attendance-app.html
|── budget-management-app.html
└── assets/
    ├── css/
    │   └── styles.css
    └── img/
        └── ...
```

## Styling

The site uses a shared stylesheet located at:

```text
assets/css/styles.css
```

The CSS includes:

- A custom color palette
- Shared header and footer styling
- Responsive navigation
- Responsive project card grid
- Profile image styling
- Contact page styling
- Project detail page styling

## Running Locally

Because this is a static website, no build step is required.

Clone the repository:

```bash
git clone https://github.com/TheKingofHearts777/info.git
cd info
```

Open the site by launching `index.html` in your browser.

You can also use a local development server, such as the Python HTTP server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Deployment

This project can be deployed with GitHub Pages.

A common setup is:

1. Go to the repository settings on GitHub.
2. Open the **Pages** section.
3. Set the source to the `main` branch.
4. Use the root directory as the publishing source.
5. Save the settings.

After GitHub Pages finishes building, the site will be available at the generated GitHub Pages URL.

## Author

Dylan Brodie
