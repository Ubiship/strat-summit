import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'src/content/mount-washington')

export type GuideCategory =
  | 'skiing'
  | 'summer'
  | 'families'
  | 'getting-here'
  | 'first-time-visitors'

export interface GuideFrontmatter {
  title: string
  description: string
  category: GuideCategory
  publishedAt: string
  author: string
}

export interface Guide extends GuideFrontmatter {
  slug: string
  content: string
}

/**
 * Get all MDX files from the content directory
 */
function getContentFiles(): string[] {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return []
    }
    return fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith('.mdx'))
  } catch (error) {
    console.error('Error reading content directory:', error)
    return []
  }
}

/**
 * Parse a single MDX file and extract frontmatter
 */
function parseGuideFile(filename: string): Guide | null {
  try {
    const filePath = path.join(CONTENT_DIR, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    // Validate required frontmatter fields
    if (
      !data.title ||
      !data.description ||
      !data.category ||
      !data.publishedAt ||
      !data.author
    ) {
      console.warn(`Missing required frontmatter in ${filename}`)
      return null
    }

    const slug = filename.replace(/\.mdx$/, '')

    return {
      slug,
      title: data.title,
      description: data.description,
      category: data.category as GuideCategory,
      publishedAt: data.publishedAt,
      author: data.author,
      content,
    }
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error)
    return null
  }
}

/**
 * Get all guides, sorted by publication date (newest first)
 */
export async function getAllGuides(): Promise<Guide[]> {
  const files = getContentFiles()
  const guides = files
    .map((file) => parseGuideFile(file))
    .filter((guide): guide is Guide => guide !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )

  return guides
}

/**
 * Get guides filtered by category, sorted by publication date (newest first)
 */
export async function getGuidesByCategory(
  category: GuideCategory,
): Promise<Guide[]> {
  const allGuides = await getAllGuides()
  return allGuides.filter((guide) => guide.category === category)
}

/**
 * Get a single guide by slug
 */
export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const filename = `${slug}.mdx`
  return parseGuideFile(filename)
}

/**
 * Get all unique categories from the guides
 */
export async function getCategories(): Promise<GuideCategory[]> {
  const guides = await getAllGuides()
  const categories = new Set(guides.map((guide) => guide.category))
  return Array.from(categories)
}

/**
 * Category metadata for display
 */
export const categoryMetadata: Record<
  GuideCategory,
  { title: string; description: string }
> = {
  skiing: {
    title: 'Skiing & Snowboarding',
    description:
      'Hit the slopes with insider tips on runs, conditions, and gear for Mount Washington Alpine Resort.',
  },
  summer: {
    title: 'Summer Activities',
    description:
      'Explore hiking trails, mountain biking, and warm-weather adventures on the mountain.',
  },
  families: {
    title: 'Family Friendly',
    description:
      'Kid-approved activities, family dining, and tips for making the most of your family getaway.',
  },
  'getting-here': {
    title: 'Getting Here',
    description:
      'Transportation options, directions, and what to know before you arrive at Mount Washington.',
  },
  'first-time-visitors': {
    title: 'First-Time Visitors',
    description:
      'Everything you need to know for your first trip to Mount Washington and the Comox Valley.',
  },
}
