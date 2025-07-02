'use client';
import React, { useEffect, useState } from 'react';
import { useBearStore, useTimeStore } from '@/stores/store';

const WeatherCard = () => {
  const bears = useBearStore((state) => state.bears);
  const date = useTimeStore((state) => state.date);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center space-y-2 border-b w-full p-4">
      <p>{date.toDateString()} {currentTime.toLocaleTimeString()}</p>
      <h1>{bears} bears around here ...</h1>
    </div>
  );
};

export default WeatherCard;
