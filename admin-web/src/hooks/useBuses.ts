import { useState, useEffect } from 'react';

export interface Bus {
  id: string;
  route: string;
  driverName: string;
  createdAt: string;
}

export const useBuses = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch buses on mount
  const fetchBuses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/buses');
      if (response.ok) {
        const data = await response.json();
        setBuses(data);
      }
    } catch (error) {
      console.error('Failed to fetch buses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const addBus = async (bus: Omit<Bus, 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/buses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bus),
      });

      if (response.ok) {
        // Optimistic update
        const newBus = {
          ...bus,
          createdAt: new Date().toISOString()
        };
        setBuses([newBus, ...buses]);
        return newBus;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register bus');
      }
    } catch (error) {
      console.error('Error adding bus:', error);
      throw error;
    }
  };

  const removeBus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/buses/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setBuses(buses.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove bus:', error);
    }
  };

  return { buses, addBus, removeBus, loading };
};
