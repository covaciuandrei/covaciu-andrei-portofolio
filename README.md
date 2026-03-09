# Andrei Covaciu - Portfolio Website

A modern, high-performance portfolio website built with a focus on premium aesthetics, featuring glassmorphism, responsive design, and smooth animations.

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Installation
Install the necessary dependencies using npm:
```bash
npm install
```

### 2. Development Mode
Run the project in a local development server:
```bash
npm run dev
```
The site will be available at `http://localhost:5173`.

## 🛠️ Building for Production

To create an optimized, minified, and obfuscated version of the site for hosting:

### Generate Build File
Run the following command:
```bash
npm run build
```

This will create a `dist/` directory containing:
- **`index.html`**: Minified main entry point.
- **`assets/`**: Bundled & obfuscated JavaScript, CSS, and optimized images.

### Preview the Build
To see how the production build looks locally:
```bash
npm run preview
```

## 🏗️ Architecture & Features

- **Frontend**: Vanilla HTML5, CSS3, and JavaScript.
- **Build Tool**: [Vite](https://vitejs.dev/) for fast bundling and hot module replacement.
- **Security**: JavaScript is automatically obfuscated during the build process using `vite-plugin-javascript-obfuscator` to protect the source logic.
- **Interactivity**: 
    - Custom scroll-spy navigation.
    - Reveal-on-scroll animations.
    - Web3Forms integration for the contact form with hCaptcha protection.

## 🌍 Deployment & Hosting (DigitalOcean)

This website is hosted on a DigitalOcean Droplet (Ubuntu 22.04 LTS) and served securely via Nginx and Let's Encrypt (HTTPS). 

**Domain:** `https://andreicovaciu.dev`  
**Server IP:** `134.209.238.126`  

### How to Connect to the Server
To access the server via SSH from your terminal, use your generated SSH key:
```bash
ssh -i ~/.ssh/id_digitalocean root@134.209.238.126
```

### How to Publish Updates
Whenever you make changes to the code locally, follow these steps to update the live website:

1. **Commit and push your changes to GitHub**
   ```bash
   git add .
   git commit -m "Update website"
   git push
   ```
2. **Connect to the server and run the deploy script**
   ```bash
   ssh -i ~/.ssh/id_digitalocean root@134.209.238.126
   ./deploy.sh
   ```

> **⚠️`deploy.sh` script**:
> ```bash
> #!/bin/bash
> cd ~/cv-project
> git pull
> npm install
> npm run build
> sudo rm -rf /var/www/html/*
> sudo cp -r dist/* /var/www/html/ 
> sudo systemctl restart nginx
> echo "🚀 Site actualizat cu succes!"
> ```

### Server maintenance details
- **Web Server:** Nginx (config file is at `/etc/nginx/sites-available/default`)
- **Site Files Path:** `/var/www/html/`
- **SSL Certificates:** Certbot handles automatic renewals.

## 📁 Project Structure

```text
/andrei-portofolio/
├── dist/               # THE PRODUCTION READY BUILD (Obfuscated)
├── assets/              # Source images and PDF documents
├── index.html           # Main HTML structure
├── script.js           # Core JavaScript logic
├── style.css            # Custom CSS styling & animations
├── vite.config.js       # Vite and Obfuscation settings
└── package.json         # Project dependencies and scripts
```

---
© 2026 Andrei Covaciu
