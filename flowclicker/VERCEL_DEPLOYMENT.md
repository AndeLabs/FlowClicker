# Vercel Deployment Guide for FlowClicker

This guide explains how to deploy FlowClicker to Vercel.

## Prerequisites

- A Vercel account
- GitHub repository connected to Vercel

## Configuration Overview

The project is configured for Vercel deployment with the following files:

- `vercel.json` - Main Vercel configuration
- `scripts/install-foundry.sh` - Script to install Foundry in Vercel environment
- `.npmrc` - npm/pnpm configuration

## Deployment Steps

### Option 1: Automatic Deployment via GitHub

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the `vercel.json` configuration
3. Set the **Root Directory** to `flowclicker`
4. Deploy!

### Option 2: Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the flowclicker directory
cd flowclicker
vercel
```

## How It Works

### Build Process

The Vercel build process follows these steps:

1. **Install Dependencies**: Runs `pnpm install` to install all dependencies
2. **Prepare Hook**: Checks if Foundry is installed, installs if missing
3. **Install Foundry**: Runs `scripts/install-foundry.sh` to install Foundry (forge, cast, anvil)
4. **Build Client**: Runs `pnpm --filter client build` to build only the frontend

### Key Configuration

**vercel.json**:
- `buildCommand`: Installs Foundry and builds the client package
- `installCommand`: Uses pnpm for dependency installation
- `outputDirectory`: Points to `packages/client/dist`
- `framework`: Configured for Vite

**Why Install Foundry?**
The client package depends on the contracts workspace package, which needs Foundry to compile. The build script ensures Foundry is available in the Vercel build environment.

## Environment Variables

If your application requires environment variables, add them in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add any required variables (e.g., RPC URLs, API keys)

## Common Issues

### Build Fails with "forge: command not found"

This means the Foundry installation failed. Check:
- The `scripts/install-foundry.sh` script is executable
- The build logs in Vercel for any curl or installation errors

### Build Scripts Warning

If you see warnings about ignored build scripts, these are expected and can be ignored. The `.npmrc` file is configured to handle this.

### Output Directory Not Found

Ensure the `vercel.json` points to the correct output directory:
```json
"outputDirectory": "packages/client/dist"
```

## Build Optimization

The current configuration:
- ✅ Installs Foundry only once during build
- ✅ Builds only the client package (not contracts)
- ✅ Uses proper caching for dependencies
- ✅ Optimized for Vite production builds

## Troubleshooting

### Check Build Logs
Always check the Vercel build logs for detailed error messages.

### Local Testing
Test the build locally before deploying:
```bash
cd flowclicker
pnpm build:client
```

### Manual Foundry Installation
If needed, you can manually install Foundry locally:
```bash
bash scripts/install-foundry.sh
```

## Support

For issues related to:
- **Vercel Platform**: Check [Vercel Documentation](https://vercel.com/docs)
- **MUD Framework**: Check [MUD Documentation](https://mud.dev)
- **Foundry**: Check [Foundry Documentation](https://book.getfoundry.sh)
