# Password Manager Edge Function

This Edge Function handles password management without using Supabase's built-in bcrypt hashing.

## Features

- **Password Verification**: Verifies student passwords for login without bcrypt
- **Password Update**: Allows students to update their own passwords
- **Admin Password Reset**: Allows admins to reset student passwords (with admin key)

## Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy the Function

```bash
supabase functions deploy password-manager
```

### Set Environment Variables

You need to set the following environment variables in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Edge Functions
3. Click on the `password-manager` function
4. Add the following environment variable:
   - `ADMIN_RESET_KEY`: A secret key for admin password resets (use a strong random string)

### Database Requirements

Make sure your `students` table has a `password` column that stores plain text passwords (not bcrypt hashes).

If your current passwords are bcrypt hashed, you'll need to:

1. Clear the password column or create a new column
2. Set passwords to plain text
3. Or update the Edge Function to handle both bcrypt and plain text passwords

## Usage

### Verify Password (Login)
```typescript
import { verifyPassword } from '@/lib/edge-functions';

const result = await verifyPassword('7021569', 'plain_text_password');
if (result.success) {
  // Login successful
  console.log(result.student);
}
```

### Update Password
```typescript
import { updatePassword } from '@/lib/edge-functions';

const result = await updatePassword('7021569', 'new_plain_text_password');
```

### Admin Password Reset
```typescript
import { resetPasswordByAdmin } from '@/lib/edge-functions';

const result = await resetPasswordByAdmin('7021569', 'new_password', 'your_admin_key');
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Plain Text Passwords**: This function stores passwords as plain text, which is not recommended for production. Consider using a different hashing method (like SHA-256) if you need to avoid bcrypt.

2. **Admin Key**: The `ADMIN_RESET_KEY` should be kept secret and rotated regularly.

3. **HTTPS**: Always use HTTPS when calling Edge Functions.

4. **Rate Limiting**: Consider implementing rate limiting for password operations.

5. **Audit Logging**: Consider adding audit logging for password changes.

## Testing

Test the function locally:

```bash
supabase functions serve password-manager
```

Then test with curl:

```bash
curl -X POST http://localhost:54321/functions/v1/password-manager \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "verify-password", "admission_id": "7021569", "password": "test_password"}'
```