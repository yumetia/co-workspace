import { apiFetch } from './client'

export type HealthStatus = { status: 'UP' | 'DOWN' }

export const getHealth = () => apiFetch<HealthStatus>('/actuator/health')
