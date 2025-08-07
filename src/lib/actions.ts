
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { API_URL, API_KEY, AUTH_TOKEN_COOKIE_NAME } from './constants';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

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

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to Login.',
    };
  }
  
  const { email, password } = validatedFields.data;
  let userId: string | undefined;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    // Per user request, log the full API response
    console.log("Login API Response:", data); 

    if (!response.ok) {
      return { message: data.message || 'Login failed. Please check your credentials.' };
    }
    
    // Using the `user` object from the response now, as per backend structure
    if (data.token && data.user?._id) {
       userId = data.user._id; // Get the user ID for the redirect
      
      // The ONLY thing we store in cookies is the secure, httpOnly auth token.
      cookies().set(AUTH_TOKEN_COOKIE_NAME, data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    } else {
       return { message: 'Login failed: No token or user ID received from API.' };
    }

  } catch (error: any) {
    // This is a specific check to allow Next.js's REDIRECT error to be thrown
     if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
     }
    console.error('Login error:', error);
    return { message: 'An unexpected error occurred.' };
  }
  
  // Redirect MUST happen outside the try...catch block
  if(userId) {
    redirect(`/dashboard/${userId}`);
  } else {
    // This case should ideally not be reached if the API is consistent.
    return { message: 'Login succeeded but could not get user ID for redirect.' };
  }
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to Register.',
    };
  }

  const { name, email, password } = validatedFields.data;
  let userId: string | undefined;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    console.log("Register API Response:", data);

    if (!response.ok) {
      return { message: data.message || 'Registration failed.' };
    }
    
    if (data.token && data.user?._id) {
      userId = data.user._id;

      cookies().set(AUTH_TOKEN_COOKIE_NAME, data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    } else {
        return { message: 'Registration failed: No token or user data received.' };
    }

  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Registration error:', error);
    return { message: 'An unexpected error occurred during registration.' };
  }
  
  if (userId) {
    redirect(`/dashboard/${userId}`);
  } else {
    return { message: 'Registration succeeded but could not get user ID for redirect.'};
  }
}

export async function logout() {
  cookies().delete(AUTH_TOKEN_COOKIE_NAME);
  redirect('/login');
}
