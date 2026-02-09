import { useState, useEffect } from 'react';

interface AvailabilityState {
  isAvailable: boolean;
  availabilityText: string;
}

export function useAvailability(): AvailabilityState {
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [availabilityText, setAvailabilityText] = useState('Available for hire');

  useEffect(() => {
    let active = true;
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/site_settings/availability', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch settings (${res.status})`);
        const data = await res.json();
        if (!active) return;
        setAvailability(!!data.availability);
        setAvailabilityText(data.availability_text ?? 'Available for hire');
      } catch {
        // No-op: fall back to defaults
      }
    };
    fetchSettings();
    return () => { active = false };
  }, []);

  return {
    isAvailable: availability ?? true,
    availabilityText,
  };
}
