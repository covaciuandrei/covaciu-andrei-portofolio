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

## 📧 Contact Form Configuration (Web3Forms)

The contact form is powered by **[Web3Forms](https://web3forms.com/)** and comes protected with **hCaptcha** to prevent spam submissions. The form sends an email directly to the provided email address without needing an elaborate backend.

### How to configure Web3Forms:

1. **Get an Access Key**: 
   Go to [Web3Forms](https://web3forms.com/) and generate a free access key for your email address.
2. **Update the Access Key**: 
   In `index.html`, locate the contact form `<form id="contact-form">` and update the hidden input:
   ```html
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
   ```
3. **Customize Settings**:
   You can also modify the `subject` hidden input in `index.html` to change the email subject line when you receive submissions.

The CAPTCHA implementation is heavily optimized; it stays hidden by default and only appears when the user interacts with the form to submit, minimizing friction while keeping spam out.

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

1. **Bump the application version** (to track deployments in the page footer)
   You can use `patch`, `minor`, or `major` depending on the update size.
   ```bash
   npm version patch --no-git-tag-version
   ```
2. **Commit and push your changes to GitHub**
   ```bash
   git add .
   git commit -m "Update website and bump version"
   git push
   ```
3. **Connect to the server and run the deploy script**
   ```bash
   ssh -i ~/.ssh/id_digitalocean root@134.209.238.126
   ./covaciu-andrei-portofolio/deploy.sh
   ```

> **⚠️`deploy.sh` script**:
> ```bash
> #!/bin/bash
> 
> # 1. Navigate to the project directory
> cd ~/covaciu-andrei-portofolio/
> 
> # 2. Pull the latest changes from GitHub
> echo "Fetching latest updates from GitHub..."
> git pull origin main
> 
> # 3. Install new dependencies if any
> echo "Installing dependencies..."
> npm install
> 
> # 4. Create the production build
> echo "Building the project..."
> npm run build
> 
> # 5. Clean the old site files from Nginx directory
> echo "Cleaning up /var/www/html/..."
> sudo rm -rf /var/www/html/*
> 
> # 6. Copy the new build files to Nginx web root
> echo "Deploying new files to Nginx..."
> if [ -d "dist" ]; then
>     sudo cp -r dist/* /var/www/html/
> else
>     echo "❌ Error: 'dist' folder was not found!"
>     exit 1
> fi
> 
> # 7. Restart Nginx to apply changes
> echo "Restarting Nginx..."
> sudo systemctl restart nginx
> 
> echo "🚀 Site updated successfully!"
> ```

### Server maintenance details
- **Web Server:** Nginx (config file is at `/etc/nginx/sites-available/default`)
- **Site Files Path:** `/var/www/html/`
- **SSL Certificates:** Certbot handles automatic renewals.

## 📁 Project Structure

```text
/andrei-portofolio/
├── .github/             # GitHub configuration (e.g. issue templates or workflows)
├── dist/                # THE PRODUCTION READY BUILD (Obfuscated)
├── assets/              # Source images and PDF documents
├── public/              # Public assets copied over to dist un-hashed
├── index.html           # Main HTML structure
├── script.js            # Core JavaScript logic
├── style.css            # Custom CSS styling & animations
├── deploy.sh            # Deployment script for pulling updates and restarting Nginx
├── vite.config.js       # Vite and Obfuscation settings
└── package.json         # Project dependencies and scripts
```

---
© 2026 Andrei Covaciu
