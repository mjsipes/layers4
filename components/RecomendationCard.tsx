import React, { useState } from 'react'
import { Input } from './ui/input'
import { TextEffect } from '@/components/ui/text-effect'
import { TextShimmer } from '@/components/ui/text-shimmer'

const RecomendationCard = () => {
  const [isFocused1, setIsFocused1] = useState(false)
  const [value1, setValue1] = useState('')
  const [isFocused2, setIsFocused2] = useState(false)
  const [value2, setValue2] = useState('')

  return (
    <div className="p-4 w-full">
      RecomendationCard
      
      <div className="flex gap-4">
        {/* Input with TextEffect only */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">TextEffect Only</label>
          <div className="relative">
            <Input
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              onFocus={() => setIsFocused1(true)}
              onBlur={() => setIsFocused1(false)}
              className="pr-8"
            />
            {!value1 && !isFocused1 && (
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <TextEffect per='char' preset='fade'>
                  What are you wearing today?
                </TextEffect>
              </div>
            )}
          </div>
        </div>

        {/* Input with TextShimmer only */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">TextShimmer Only</label>
          <div className="relative">
            <Input
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              onFocus={() => setIsFocused2(true)}
              onBlur={() => setIsFocused2(false)}
              className="pr-8"
            />
            {!value2 && !isFocused2 && (
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <TextShimmer className="font-mono text-sm" duration={3}>
                  What are you wearing today?
                </TextShimmer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecomendationCard