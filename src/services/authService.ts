
// This is a new service dedicated to handling the token fetching from our own BFF.

type AuthInfo = {
    token: string | null;
}

/**
 * Fetches the auth token from our own backend-for-frontend (BFF) API route.
 * This should be the ONLY way client-side services get the auth token.
 */
export async function getAuthToken(): Promise<AuthInfo> {
    try {
        // This fetch call is to our *own* Next.js application's API route,
        // not the external sensor grid API.
        const res = await fetch('/api/auth/me');

        if (!res.ok) {
            console.error("AuthService: Failed to fetch auth details from BFF", res.status, res.statusText);
            throw new Error('Failed to fetch authentication details.');
        }

        const data = await res.json();
        
        if (!data.token) {
             console.error("AuthService: Token was missing in BFF response");
             throw new Error('Authentication token not found in response.');
        }
        
        return { token: data.token };

    } catch (error) {
        console.error("AuthService: Error fetching token from BFF", error);
        return { token: null };
    }
}
