import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilitaires pour les calculs solaires
export function calculateSolarProduction(
  panelCount: number,
  panelWattage: number,
  orientation: number,
  tilt: number,
  location: { lat: number; lng: number }
): number {
  // Calcul simplifié de la production solaire
  const baseProduction = panelCount * panelWattage * 1000 // kWh/an
  
  // Facteur d'orientation (optimal = sud = 180°)
  const orientationFactor = Math.cos(Math.abs(orientation - 180) * Math.PI / 180)
  
  // Facteur d'inclinaison (optimal = latitude)
  const optimalTilt = Math.abs(location.lat)
  const tiltFactor = Math.cos(Math.abs(tilt - optimalTilt) * Math.PI / 180)
  
  // Facteur géographique (simplifié)
  const geoFactor = 0.8 + (location.lat / 100) // Approximation
  
  return baseProduction * orientationFactor * tiltFactor * geoFactor
}

export function calculateSavings(
  annualProduction: number,
  electricityPrice: number = 0.20 // €/kWh
): {
  annualSavings: number
  monthlySavings: number
  twentyYearSavings: number
} {
  const annualSavings = annualProduction * electricityPrice
  const monthlySavings = annualSavings / 12
  const twentyYearSavings = annualSavings * 20 * 0.9 // Dégradation de 10% sur 20 ans
  
  return {
    annualSavings,
    monthlySavings,
    twentyYearSavings
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function formatNumber(number: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Validation des données
export function validatePDL(pdl: string): boolean {
  // Format PDL: 14 chiffres
  return /^\d{14}$/.test(pdl)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  // Format français
  return /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(phone)
}