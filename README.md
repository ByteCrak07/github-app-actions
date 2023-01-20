# Github App for creating a simple github action

## Steps to run the app

### 1. Clone the repository 📁

```bash
# Clone the repository
git clone https://github.com/ByteCrak07/github-app-actions.git

# Change into the project directory
cd github-app-actions
```

### 2. Create a .env file and configure environent variables 📄

```bash
# example .env file
APP_ID= # App Id of GitHub app
PRIVATE_KEY= # RSA private key of GitHub app
WEBHOOK_URL= # Use proxy url for development or actual url in production
WEBHOOK_SECRET= # development or secret
OAUTH_CLIENT_ID= # GitHub OAuth App Client ID
OAUTH_CLIENT_SECRET= # GitHub OAuth App Client Secret
```

### 3. Run application in port 3000 💻

```bash
# Run the app in development mode
npm run dev

# Run the app in production mode
npm start
```

## Example github app 👉 [Test GitHub App - Actions](https://github.com/apps/test-github-app-actions)
