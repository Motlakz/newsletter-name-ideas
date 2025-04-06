"use client";

import { useEffect, useState } from 'react';
import { Models } from 'appwrite';
import { account } from '@/lib/backend/appwrite';

export function useUser() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        const currentUser = await account.get();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setUser(null);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  return { user, loading, error };
}