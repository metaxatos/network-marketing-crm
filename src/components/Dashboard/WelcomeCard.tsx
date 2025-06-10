'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, Zap } from 'lucide-react'

interface WelcomeCardProps {
  userName?: string
  streak?: number
}

export function WelcomeCard({ userName = 'Champion', streak = 7 }: WelcomeCardProps) {
  const [greeting, setGreeting] = useState('Hello')
  const [quote, setQuote] = useState('')
  const [weather, setWeather] = useState({ temp: 72, icon: Sun })

  const inspirationalQuotes = [
    "Success is not the destination, it's the journey of helping others succeed.",
    "Every connection you make today could change someone's life tomorrow.",
    "Your network is your net worth, but your relationships are your real wealth.",
    "Dream big, start small, but most importantly, start today.",
    "The best time to plant a tree was 20 years ago. The second best time is now."
  ]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Set a random inspirational quote
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]
    setQuote(randomQuote)

    // Simple weather simulation (in real app, you'd fetch from API)
    const weatherOptions = [
      { temp: 72, icon: Sun },
      { temp: 68, icon: Cloud },
      { temp: 65, icon: CloudRain }
    ]
    setWeather(weatherOptions[Math.floor(Math.random() * weatherOptions.length)])
  }, [])

  const WeatherIcon = weather.icon

  return (
    <div className="bg-glass rounded-xl p-6 shadow-md mx-4 md:mx-0 mb-6">
      <div className="flex justify-between items-start mb-4">
        {/* Left Side - Greeting */}
        <div className="flex-1">
          <h1 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-1">
            {greeting}, {userName}! 
          </h1>
          <p className="text-base md:text-lg text-text-secondary">
            Ready to make today amazing?
          </p>
        </div>

        {/* Right Side - Weather & Streak */}
        <div className="flex flex-col items-end gap-3">
          {/* Weather Widget */}
          <div className="bg-gradient-to-r from-action-blue to-action-purple text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <WeatherIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{weather.temp}°</span>
          </div>

          {/* Streak Badge */}
          <div className="bg-gradient-to-r from-action-golden to-yellow-400 text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">{streak} day streak!</span>
          </div>
        </div>
      </div>

      {/* Inspirational Quote */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-action-purple">
        <p className="text-sm italic text-text-light leading-relaxed">
          "{quote}"
        </p>
      </div>
    </div>
  )
} 