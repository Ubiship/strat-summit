import { type Metadata } from 'next'

import { Blockquote } from '@/components/Blockquote'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { List, ListItem } from '@/components/List'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Renovations & Construction',
  description:
    'Renovation and construction services on Vancouver Island — estimates, contracts, and seasonal project delivery.',
}

export default function Renovations() {
  return (
    <RootLayout>
      <PageIntro
        eyebrow="Renovations"
        title="Seasonal construction with clear estimates and honest timelines."
      >
        <p>
          Summer-heavy renovation work across Vancouver Island — from kitchen
          refreshes to full interior updates. We walk you through scope, budget,
          and contract type before a single hammer swings.
        </p>
      </PageIntro>

      <Container className="mt-16 lg:mt-24">
        <div className="lg:flex lg:items-start lg:gap-x-12">
          <FadeIn className="w-full max-w-lg flex-none lg:w-1/2">
            <StylizedImage
              src={site.images.renovations}
              width={800}
              height={600}
              alt="Interior renovation framing and construction in progress"
              grayscale={false}
              sizes="(min-width: 1024px) 33rem, 100vw"
              className="justify-center"
            />
          </FadeIn>
          <div className="mt-12 lg:mt-0 lg:w-1/2">
            <List>
              <ListItem title="Estimate">
                Line-item breakdowns for materials, labour, and margin — no
                mystery allowances.
              </ListItem>
              <ListItem title="Contract">
                Fixed-price, cost-plus, or time & materials — we match the
                agreement to how well-defined the scope is.
              </ListItem>
              <ListItem title="Build">
                In-progress updates, change orders when scope shifts, and
                milestone billing tied to real progress.
              </ListItem>
              <ListItem title="Complete">
                Final walkthrough, punch list, and documentation for your
                records.
              </ListItem>
            </List>
          </div>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Project types"
        title="What we typically take on"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Renovation demand peaks in summer — we plan capacity so your project
          gets focused attention during the window that works for Island
          properties.
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <GridList>
          <GridListItem title="Kitchens & bathrooms">
            Layout updates, cabinetry, tile, fixtures, and ventilation — the
            rooms guests and owners notice first.
          </GridListItem>
          <GridListItem title="Decks & exteriors">
            Weather-ready materials suited for coastal conditions and strata
            requirements where applicable.
          </GridListItem>
          <GridListItem title="Whole-home refresh">
            Flooring, paint, trim, and lighting packages to reset a property
            between seasons or before sale.
          </GridListItem>
          <GridListItem title="Subtrade coordination">
            Licensed trades brought in as needed — one point of contact for the
            owner.
          </GridListItem>
        </GridList>
      </Container>

      <Container className="mt-24">
        <FadeIn>
          <StylizedImage
            src={site.images.renovations}
            width={800}
            height={600}
            alt="Renovation construction framing and electrical rough-in"
            shape={2}
            grayscale={false}
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="justify-center"
          />
          <Blockquote
            author={{ name: 'Joel', role: 'Co-founder' }}
            className="mt-12"
          >
            We would rather set expectations early than surprise you mid-project
            — clear scope up front keeps everyone aligned.
          </Blockquote>
        </FadeIn>
      </Container>

      <ContactSection />
    </RootLayout>
  )
}
