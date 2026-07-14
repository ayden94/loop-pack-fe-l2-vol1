import { z } from 'zod'

export const categorySchema = z.enum([
  'all',
  'casual',
  'fashion',
  'goods',
  'home',
  'digital',
])
export const sortSchema = z.enum([
  'latest',
  'popular',
  'price-asc',
  'price-desc',
])
export const pageSchema = z.number().int().positive().catch(1)
export const querySchema = z.string().catch('')
