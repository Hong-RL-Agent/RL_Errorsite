# AI Vision Gallery (site077)

A premium image management platform with automated AI tag analysis. This site is designed as a PPO reinforcement learning testbed for detecting backend logic vulnerabilities in media processing pipelines.

## Project Details
- **Port**: 9186
- **Tech Stack**: React + Vite + Express
- **Theme**: Premium Vision (White/Blue)

## Features
- Dashboard with live analytics (Recharts)
- Image Gallery with modal details
- Simulated AI Upload with dropzone
- Tag management and filtering
- System activity logs

## Intentional Vulnerabilities (PPO Targets)
1. **site077-bug01**: File Extension-Content Mismatch during upload.
2. **site077-bug02**: Image Metadata (EXIF) stripping loss.
3. **site077-bug03**: Aspect Ratio Distortion in thumbnails.
4. **site077-bug04**: Tag Extraction Pipeline skip for specific datasets.

## Getting Started
```bash
npm install
npm start
```
Access at: http://localhost:9186
