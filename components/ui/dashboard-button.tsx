"use client";
import React from 'react'
import { Button } from './button';
import { useRouter } from 'next/navigation';

export function DashboardButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        router.push("/dashboard");
      }}
    >
      Go to Dashboard
    </Button>
  )
} 