import { useRef, useState, useCallback } from 'react';

export function useSubmitLock() {
  const lockRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (fn) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setLoading(true);
    try {
      return await fn();
    } finally {
      lockRef.current = false;
      setLoading(false);
    }
  }, []);

  return { loading, run };
}