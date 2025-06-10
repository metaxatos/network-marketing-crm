'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'

interface SmartActionCardProps {
  title: string
  description: string
  buttonText: string
  href: string
}

export function SmartActionCard({ title, description, buttonText, href }: SmartActionCardProps) {
  return (
    <div className="bg-gradient-to-r from-action-primary to-accent-purple p-5 rounded-lg text-white mx-4 md:mx-0">
      <div className="text-sm opacity-90 mb-2">{title}</div>
      <div className="text-lg font-semibold mb-4">{description}</div>
      <Link
        href={href}
        className="inline-flex items-center px-6 py-3 bg-white text-action-primary rounded-sm font-medium hover:bg-gray-50 transition-colors duration-200"
      >
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  )
}

interface ActionCardProps {
  title: string
  subtitle: string
  href: string
  icon: React.ReactNode
  iconBgColor: string
}

export function ActionCard({ title, subtitle, href, icon, iconBgColor }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="bg-bg-primary p-5 rounded-md shadow-sm border border-warm-200 flex items-center justify-between hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 ${iconBgColor} rounded-sm flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-200`}>
          {icon}
        </div>
        <div>
          <div className="font-semibold text-lg text-primary-900">{title}</div>
          <div className="text-sm text-primary-500">{subtitle}</div>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-primary-400 group-hover:text-primary-600 transition-colors duration-200" />
    </Link>
  )
}

interface MetricCardProps {
  number: string | number
  label: string
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ number, label, trend }: MetricCardProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-1">
        <div className="text-2xl font-bold text-primary-900">{number}</div>
        {trend === 'up' && (
          <TrendingUp className="h-5 w-5 text-action-success ml-2" />
        )}
      </div>
      <div className="text-sm text-primary-500">{label}</div>
    </div>
  )
}

interface ProgressCardProps {
  title: string
  percentage: number
  description?: string
}

export function ProgressCard({ title, percentage, description }: ProgressCardProps) {
  return (
    <div className="bg-bg-primary p-5 rounded-md shadow-sm border border-warm-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-primary-700">{title}</span>
        <span className="text-sm text-primary-600">{percentage}%</span>
      </div>
      <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-action-success rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <div className="text-xs text-primary-500 mt-2">{description}</div>
      )}
    </div>
  )
}

export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {children}
    </div>
  )
}

export function MainActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 md:space-y-4">
      {children}
    </div>
  )
}

export function ProgressSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-primary p-5 rounded-md shadow-sm border border-warm-200">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {children}
      </div>
    </div>
  )
} 