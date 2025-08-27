"use client";
import React from 'react'
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const GoToDashboard = () => {
  const router = useRouter();
  return (
    <Button size="sm"
      onClick={() => {
        router.push("/dashboard");
      }}
    >
      Go to Dashboard
    </Button>
  )
}

export { GoToDashboard }