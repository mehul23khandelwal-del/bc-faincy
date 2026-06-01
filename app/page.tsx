import BusinessCard, { type Group } from '@/components/BusinessCard'

const FALLBACK_GROUPS: Group[] = [
  { icon: '🕌', name: 'Divine Idols',       slug: 'divine-idols' },
  { icon: '🪔', name: 'Puja Essentials',     slug: 'puja-essentials' },
  { icon: '🥂', name: 'Silverware & Dining', slug: 'silverware-dining' },
  { icon: '🪞', name: 'Storage & Décor',     slug: 'storage-decor' },
  { icon: '🎁', name: 'Gifting & Novelty',   slug: 'gifting-novelty' },
]

async function getGroups(): Promise<Group[]> {
  try {
    const res = await fetch(
      'https://tender-exploration-production.up.railway.app/api/collection-groups',
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('Failed')
    const data: any[] = await res.json()
    const active = data.filter(g => g.isActive).map(g => ({
      name: g.name as string,
      icon: g.icon as string,
      slug: g.slug as string,
      coverImageUrl: (g.coverImageUrl as string | null) ?? null,
    }))
    return active.length ? active : FALLBACK_GROUPS
  } catch {
    return FALLBACK_GROUPS
  }
}

export default async function Page() {
  const groups = await getGroups()
  return <BusinessCard groups={groups} />
}
