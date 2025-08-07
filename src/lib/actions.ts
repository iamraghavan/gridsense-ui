
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { API_URL, API_KEY, AUTH_TOKEN_COOKIE_NAME } from './constants';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export type AuthState = {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    _form?: string[];
  };
};

// Note: The login logic has been moved to the client-side in LoginPage
// to handle localStorage. This file is now primarily for registration
// and the server-side logout utility.

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to Register.',
    };
  }

  const { name, email, password } = validatedFields.data;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    console.log("Register API Response:", data);

    if (!response.ok) {
       return { message: data.message || 'Registration failed.' };
    }
    
    // Although we are redirecting, we can't pass the data directly to the client page
    // after the redirect. The LoginPage will handle the login-after-register flow.
    
  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Registration error:', error);
    return { message: 'An unexpected error occurred during registration.' };
  }
  
  // After successful registration, redirect to login page where user can sign in.
  redirect('/login');
}

// The logout function is no longer needed here as it's handled client-side.
// Kept for potential future server-side session needs.
export async function logout() {
  // This function would be used if we were managing sessions with server-side cookies.
  // Since we've moved to localStorage, the primary logout logic is in AppLayout.
  console.log("Server-side logout called, redirecting to /login.");
  redirect('/login');
}
