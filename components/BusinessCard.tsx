'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import allReviews from '@/lib/reviews.json'

// ── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_REVIEW_URLS: Record<number, string> = {
  1: 'https://search.google.com/local/writereview?placeid=ChIJKXwKvq22bTkRlWbdYs3Ko1Q',
  2: 'https://search.google.com/local/writereview?placeid=ChIJEUwP28a1bTkRfXLnD4Q9sZ8',
}

const LINKS = {
  instagram: 'https://www.instagram.com/faincy_jewellery',
  whatsapp: 'https://wa.me/918850995528?text=Hi%20Faincy!%20I%27m%20interested%20in%20your%20silver%20articles.',
  facebook: 'https://www.facebook.com/share/1BYVJiT7YG/',
  website: 'https://faincy.co.in',
  pinterest: 'https://pinterest.com/faincy_jewellery',
  mapsStore1: 'https://maps.google.com/?q=Faincy+Jewellery+Store+125+Johri+Bazar+Biseswarji+Jaipur',
  mapsStore2: 'https://maps.google.com/?q=Faincy+Jewellery+Store+Jai+Jawan+Colony+Adinath+Nagar+Jaipur',
}

const STORAGE_KEY = 'faincy_bc_used_v1'

const VCARD = `BEGIN:VCARD
VERSION:3.0
FN:Faincy Silver
ORG:Faincy Silver Articles
TEL;TYPE=CELL:+918850995528
URL:https://faincy.co.in
ADR;TYPE=WORK:;;125 Johri Bazar;Jaipur;Rajasthan;302003;India
NOTE:Est. 1939 · Pure 92.5 Hallmarked Silver · Handcrafted in Jaipur
END:VCARD`

// ── Types ────────────────────────────────────────────────────────────────────

type Review = { id: number; tag: string; text: string }
export type Group = { name: string; icon: string; slug: string; coverImageUrl?: string | null }

// ── Helpers ──────────────────────────────────────────────────────────────────

function pickReviews(): Review[] {
  const usedIds: number[] = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
  })()

  const available = (allReviews as Review[]).filter(r => !usedIds.includes(r.id))
  const pool = available.length >= 5 ? available : (allReviews as Review[])

  const byTag = new Map<string, Review[]>()
  for (const r of pool) {
    if (!byTag.has(r.tag)) byTag.set(r.tag, [])
    byTag.get(r.tag)!.push(r)
  }
  const tags = Array.from(byTag.keys())
  const picked: Review[] = []
  for (let i = 0; picked.length < 5 && i < tags.length; i++) {
    const bucket = byTag.get(tags[i])!
    picked.push(bucket[Math.floor(Math.random() * bucket.length)])
  }
  if (picked.length < 5) {
    const extra = pool.filter(r => !picked.some(p => p.id === r.id))
    for (const r of extra) {
      if (picked.length >= 5) break
      picked.push(r)
    }
  }
  return picked
}

function markUsed(ids: number[]) {
  try {
    const prev: number[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    const next = Array.from(new Set([...prev, ...ids]))
    if (next.length >= (allReviews as Review[]).length) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  } catch {}
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full text-sm font-medium shadow-xl"
         style={{ background: 'var(--gold)', color: '#0D0D0D' }}>
      {msg}
    </div>
  )
}

// ── Review Sheet ──────────────────────────────────────────────────────────────

function ReviewSheet({
  open,
  onClose,
  activeStore,
}: {
  open: boolean
  onClose: () => void
  activeStore: number
}) {
  const [options, setOptions]   = useState<Review[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [copying, setCopying]   = useState(false)

  useEffect(() => {
    if (open) {
      setOptions(pickReviews())
      setSelected(null)
    }
  }, [open])

  async function handleCopyOpen() {
    if (selected === null) return
    setCopying(true)
    const review = options.find(r => r.id === selected)!
    try { await navigator.clipboard.writeText(review.text) } catch {}
    markUsed([review.id])
    onClose()
    setCopying(false)
    setTimeout(() => {
      window.open(GOOGLE_REVIEW_URLS[activeStore], '_blank')
    }, 900)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative animate-slide-up rounded-t-2xl overflow-hidden"
           style={{ background: 'var(--bg2)', border: '1px solid var(--border-gold)', borderBottom: 'none', maxHeight: '90vh' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--muted)' }} />
        </div>

        <div className="px-5 pb-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>Choose your review</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted2)' }}>Pick one · we'll copy it & open Google</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: 'var(--muted)' }}>×</button>
        </div>

        <div className="px-5 pb-3 flex gap-2">
          {[1, 2].map(n => (
            <button
              key={n}
              onClick={() => {}}
              className="text-xs px-3 py-1.5 rounded-full border transition-colors"
              style={{
                borderColor: activeStore === n ? 'var(--gold)' : 'var(--border)',
                color: activeStore === n ? 'var(--gold)' : 'var(--muted2)',
                background: activeStore === n ? 'rgba(201,169,110,0.08)' : 'transparent',
              }}
            >
              {n === 1 ? 'Johari Bazaar' : 'Showroom'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-5 pb-4 space-y-2.5" style={{ maxHeight: '55vh' }}>
          {options.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className="w-full text-left rounded-xl p-4 border transition-all"
              style={{
                background: selected === r.id ? 'rgba(201,169,110,0.06)' : 'var(--bg3)',
                borderColor: selected === r.id ? 'var(--gold)' : 'var(--border)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--muted2)' }}>Option {idx + 1}</span>
                    <span style={{ color: 'var(--gold)', fontSize: 13 }}>★★★★★</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{r.text}</p>
                </div>
                {selected === r.id && (
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                       style={{ background: 'var(--gold)' }}>
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#0D0D0D" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleCopyOpen}
            disabled={selected === null || copying}
            className="w-full py-3.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40"
            style={{
              background: selected !== null ? 'var(--gold)' : 'var(--bg3)',
              color: selected !== null ? '#0D0D0D' : 'var(--muted)',
            }}
          >
            {copying ? 'Copying…' : 'Copy & Open Google →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Inner client component (needs useSearchParams) ────────────────────────────

function BusinessCardInner({ groups }: { groups: Group[] }) {
  const params = useSearchParams()
  const [activeStore, setActiveStore]   = useState(1)
  const [showReview, setShowReview]     = useState(false)
  const [toast, setToast]               = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const store = Number(params.get('store')) || 1
    const review = params.get('review') === '1'
    setActiveStore(store === 2 ? 2 : 1)
    if (review) setShowReview(true)
  }, [params])

  function showToast(msg: string) {
    setToast(msg)
  }

  function downloadVCard() {
    const blob = new Blob([VCARD], { type: 'text/vcard' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'FaincySilver.vcf'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleShare() {
    const shareData = {
      title: 'Faincy Silver · Est. 1939',
      text: 'Pure 92.5 handcrafted silver articles from Jaipur since 1939.',
      url: 'https://bc.faincy.co.in',
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText('https://bc.faincy.co.in')
        showToast('Link copied!')
      }
    } catch {}
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', maxWidth: 480, margin: '0 auto' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-sm font-medium tracking-[0.2em]" style={{ color: 'var(--gold)' }}>FAINCY</span>
        <span className="text-xs tracking-widest" style={{ color: 'var(--muted2)' }}>Est. 1939</span>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center pt-10 pb-8 px-6 animate-fade-up">
        <div className="relative w-28 h-28 mb-6">
          <svg className="absolute inset-0 animate-spin-slow" viewBox="0 0 112 112" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <circle cx="56" cy="56" r="53" stroke="url(#ringGrad)" strokeWidth="1"
                    strokeDasharray="6 4" />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="112" y2="112" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C9A96E" />
                <stop offset="0.5" stopColor="#9E7B3F" stopOpacity="0.3" />
                <stop offset="1" stopColor="#C9A96E" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-2 rounded-full overflow-hidden"
               style={{ border: '1px solid var(--border-gold)' }}>
            <Image src="/logo.jpg" alt="Faincy Silver" fill className="object-cover" priority />
          </div>
        </div>

        <h1 className="text-4xl tracking-[0.25em] mb-1"
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, color: 'var(--cream)' }}>
          FAINCY
        </h1>
        <p className="text-lg italic mb-5"
           style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--gold)', fontWeight: 300 }}>
          चांदी की विरासत
        </p>

        <div className="w-16 h-px mb-5" style={{ background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />

        <p className="text-xs text-center tracking-wide" style={{ color: 'var(--muted2)' }}>
          Handcrafted by master artisans · Jaipur, Rajasthan
        </p>
      </section>

      {/* ── Promise strip ── */}
      <div className="grid grid-cols-4 gap-0 mx-4 rounded-xl overflow-hidden mb-6"
           style={{ border: '1px solid var(--border-gold)', background: 'var(--bg2)' }}>
        {[
          { icon: '🥈', label: '92.5 Hallmarked' },
          { icon: '✏️', label: 'Handcrafted' },
          { icon: '📣', label: 'Est. 1939' },
          { icon: '🚀', label: 'Free Delivery' },
        ].map((p, i) => (
          <div key={i} className="flex flex-col items-center justify-center py-3 px-1 text-center"
               style={{ borderRight: i < 3 ? '1px solid var(--border)' : undefined }}>
            <span className="text-lg mb-1">{p.icon}</span>
            <span className="text-[10px] leading-tight" style={{ color: 'var(--muted2)' }}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* ── Social row ── */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Instagram', href: LINKS.instagram, icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )},
            { label: 'WhatsApp', href: LINKS.whatsapp, icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            )},
            { label: 'Facebook', href: LINKS.facebook, icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )},
            { label: 'Website', href: LINKS.website, icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            )},
            { label: 'Pinterest', href: LINKS.pinterest, icon: (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
            )},
          ].map(({ label, href, icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all active:scale-95"
               style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--gold)' }}>{icon}</span>
              <span className="text-[10px]" style={{ color: 'var(--muted2)' }}>{label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="px-4 mb-6">
        <h2 className="text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--muted)' }}>Contact</h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:+918850995528"
             className="flex flex-col gap-1 p-4 rounded-xl transition-all active:scale-95"
             style={{ background: 'var(--bg2)', border: '1px solid var(--border-gold)' }}>
            <span className="text-xl">📞</span>
            <span className="text-sm font-medium" style={{ color: 'var(--cream)' }}>Call Us</span>
            <span className="text-xs" style={{ color: 'var(--gold)' }}>+91 88509 95528</span>
          </a>
          <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer"
             className="flex flex-col gap-1 p-4 rounded-xl transition-all active:scale-95"
             style={{ background: 'var(--bg2)', border: '1px solid var(--border-gold)' }}>
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium" style={{ color: 'var(--cream)' }}>WhatsApp</span>
            <span className="text-xs" style={{ color: 'var(--gold)' }}>Chat with us</span>
          </a>
        </div>
      </section>

      {/* ── Stores ── */}
      <section className="px-4 mb-6">
        <h2 className="text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--muted)' }}>Our Stores</h2>
        <div className="space-y-3">
          {[
            {
              n: 1,
              name: 'Johari Bazaar',
              addr: '125, Johri Bazar, Biseswarji, Jaipur 302003',
              href: LINKS.mapsStore1,
            },
            {
              n: 2,
              name: 'Showroom',
              addr: 'Jai Jawan Colony, Adinath Nagar, Jaipur 302018',
              href: LINKS.mapsStore2,
            },
          ].map(store => (
            <a key={store.n} href={store.href} target="_blank" rel="noopener noreferrer"
               className="flex items-start justify-between p-4 rounded-xl transition-all active:scale-[0.99]"
               style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div className="flex gap-3">
                <span className="text-lg mt-0.5">📍</span>
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--cream)' }}>{store.name}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted2)' }}>{store.addr}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full shrink-0 ml-2 mt-0.5"
                    style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--gold)' }}>
                Maps ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Hours ── */}
      <section className="px-4 mb-6">
        <h2 className="text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--muted)' }}>Hours</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Johari Bazaar', hours: '10am – 7pm', days: 'Mon – Sat' },
            { name: 'Showroom',      hours: '10am – 7pm', days: 'Mon – Sat' },
          ].map(h => (
            <div key={h.name} className="p-4 rounded-xl"
                 style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--muted2)' }}>{h.name}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{h.hours}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--gold)' }}>{h.days}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Collection ── */}
      <section className="mb-6">
        <h2 className="text-xs tracking-[0.15em] uppercase mb-3 px-4" style={{ color: 'var(--muted)' }}>Collection</h2>
        <div ref={scrollRef} className="flex gap-3 px-4 overflow-x-auto pb-2"
             style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {groups.map(group => (
            <a key={group.slug}
               href={`https://faincy.co.in/shop?group=${group.slug}`}
               target="_blank" rel="noopener noreferrer"
               className="shrink-0 rounded-xl overflow-hidden transition-all active:scale-95"
               style={{ background: 'var(--bg2)', border: '1px solid var(--border-gold)', minWidth: 96, width: 96, height: 160, position: 'relative', display: 'block' }}>
              {group.coverImageUrl ? (
                <>
                  <Image src={group.coverImageUrl} alt={group.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1 }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem', zIndex: 2, textAlign: 'center' }}>
                    <span className="text-[11px] font-medium leading-tight" style={{ color: '#fff' }}>{group.name}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4 h-full">
                  <span className="text-2xl">{group.icon}</span>
                  <span className="text-[11px] text-center leading-tight" style={{ color: 'var(--muted2)' }}>{group.name}</span>
                </div>
              )}
            </a>
          ))}
        </div>
        <div className="px-4 pt-3">
          <a href="https://faincy.co.in/shop" target="_blank" rel="noopener noreferrer"
             className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.99]"
             style={{ border: '1px solid var(--border-gold)', color: 'var(--gold)', background: 'transparent' }}>
            View Full Catalogue →
          </a>
        </div>
      </section>

      {/* ── Review button ── */}
      <section className="px-4 mb-4">
        <button
          onClick={() => setShowReview(true)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all active:scale-[0.99]"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border-gold)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>Review us on Google</p>
              <p className="text-xs" style={{ color: 'var(--gold)' }}>★★★★★ · Share your experience</p>
            </div>
          </div>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"
               style={{ color: 'var(--muted)' }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* ── Save Contact ── */}
      <section className="px-4 mb-3">
        <button
          onClick={downloadVCard}
          className="w-full py-4 rounded-xl font-medium text-sm tracking-wide transition-all active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg,var(--gold),var(--gold-dark))', color: '#0D0D0D' }}
        >
          + Save Contact
        </button>
      </section>

      {/* ── Share ── */}
      <section className="px-4 mb-10">
        <button
          onClick={handleShare}
          className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all active:scale-[0.99]"
          style={{ border: '1px solid var(--border-gold)', color: 'var(--gold)', background: 'transparent' }}
        >
          ↗ Share This Card
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 py-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs mb-1" style={{ color: 'var(--muted2)' }}>Faincy Silver · Est. 1939 · Jaipur</p>
        <p className="text-[10px] tracking-widest" style={{ color: 'var(--muted)' }}>BC.FAINCY.CO.IN</p>
      </footer>

      <ReviewSheet
        open={showReview}
        onClose={() => setShowReview(false)}
        activeStore={activeStore}
      />

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  )
}

// ── Export (wrapped in Suspense for useSearchParams) ──────────────────────────

export default function BusinessCard({ groups }: { groups: Group[] }) {
  return (
    <Suspense>
      <BusinessCardInner groups={groups} />
    </Suspense>
  )
}
