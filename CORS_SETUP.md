# Firebase Storage CORS Configuration Instructions

## Quick Setup (Using Google Cloud Shell - No Installation Required)

1. **Open Google Cloud Shell** in your browser:
   https://shell.cloud.google.com/?project=studio-9168245513-bcc5d

2. **Create the CORS configuration file** by running:
   ```bash
   cat > cors.json << 'EOF'
   [
     {
       "origin": ["http://localhost:3000", "http://localhost:3001", "*"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
     }
   ]
   EOF
   ```

3. **Apply the CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://studio-9168245513-bcc5d.firebasestorage.app
   ```

4. **Verify it was applied**:
   ```bash
   gsutil cors get gs://studio-9168245513-bcc5d.firebasestorage.app
   ```

## That's it! 

After running these commands, Firebase Storage will accept uploads from your localhost.

---

## Alternative: Deploy Storage Rules

Run this command in your project directory:
```bash
firebase deploy --only storage
```
