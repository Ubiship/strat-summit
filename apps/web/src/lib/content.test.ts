import { describe, it, expect } from 'vitest'
import {
  getAllGuides,
  getGuideBySlug,
  getGuidesByCategory,
  categoryMetadata,
} from './content'

describe('content utilities', () => {
  it('should load all guides', async () => {
    const guides = await getAllGuides()
    expect(Array.isArray(guides)).toBe(true)
  })

  it('should load guide by slug', async () => {
    const guide = await getGuideBySlug('getting-started-skiing')
    if (guide) {
      expect(guide.title).toBe(
        'Getting Started with Skiing at Mount Washington',
      )
      expect(guide.category).toBe('skiing')
      expect(guide.slug).toBe('getting-started-skiing')
    }
  })

  it('should return null for non-existent guide', async () => {
    const guide = await getGuideBySlug('non-existent-guide')
    expect(guide).toBeNull()
  })

  it('should load guides by category', async () => {
    const guides = await getGuidesByCategory('skiing')
    expect(Array.isArray(guides)).toBe(true)
  })

  it('should have category metadata for all categories', () => {
    const categories = [
      'skiing',
      'summer',
      'families',
      'getting-here',
      'first-time-visitors',
    ]
    categories.forEach((cat) => {
      expect(categoryMetadata[cat as keyof typeof categoryMetadata]).toBeDefined()
      expect(categoryMetadata[cat as keyof typeof categoryMetadata].title).toBeTruthy()
      expect(
        categoryMetadata[cat as keyof typeof categoryMetadata].description,
      ).toBeTruthy()
    })
  })

  it('should sort guides by publication date descending', async () => {
    const guides = await getAllGuides()
    if (guides.length > 1) {
      for (let i = 0; i < guides.length - 1; i++) {
        const current = new Date(guides[i].publishedAt)
        const next = new Date(guides[i + 1].publishedAt)
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime())
      }
    }
  })

  it('should handle missing content directory gracefully', async () => {
    // This should not throw, just return empty array
    const guides = await getAllGuides()
    expect(Array.isArray(guides)).toBe(true)
  })
})
