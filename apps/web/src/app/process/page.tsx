import { type Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { Blockquote } from '@/components/Blockquote'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { TagList, TagListItem } from '@/components/TagList'
import { ValueCards } from '@/components/ValueCards'
import imageLaptop from '@/images/laptop.jpg'
import imageMeeting from '@/images/meeting.jpg'
import imageWhiteboard from '@/images/whiteboard.jpg'

function Section({
  index,
  title,
  image,
  children,
}: {
  index: number
  title: string
  image: StaticImageData
  children: React.ReactNode
}) {
  return (
    <div className="grid items-center gap-10 split:grid-cols-2 split:gap-16">
      <FadeIn
        className={clsx(
          'relative aspect-4/3 overflow-hidden rounded-[2.75rem]',
          index % 2 === 0 && 'split:order-last',
        )}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1200px) 34rem, (min-width: 900px) 50vw, 100vw"
          className="object-cover photo-warm"
        />
      </FadeIn>
      <FadeIn>
        <NumberBadge value={index} tone="sun" />
        <h2 className="mt-5 type-display text-[clamp(2.75rem,5vw,4.5rem)]">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </FadeIn>
    </div>
  )
}

function Discover() {
  return (
    <Section index={1} title="Discover" image={imageWhiteboard}>
      <div className="space-y-6 text-base text-warm-muted">
        <p>
          We work closely with our clients to understand their{' '}
          <strong className="font-semibold text-warm-ink">needs</strong> and
          goals, embedding ourselves in their every day operations to understand
          what makes their business tick.
        </p>
        <p>
          Our team of private investigators shadow the company director’s for
          several weeks while our account managers focus on going through their
          trash. Our senior security experts then perform social engineering
          hacks to gain access to their{' '}
          <strong className="font-semibold text-warm-ink">business</strong>{' '}
          accounts — handing that information over to our forensic accounting
          team.
        </p>
        <p>
          Once the full audit is complete, we report back with a comprehensive{' '}
          <strong className="font-semibold text-warm-ink">plan</strong> and,
          more importantly, a budget.
        </p>
      </div>

      <h3 className="mt-12 text-lg font-bold text-warm-ink">
        Included in this phase
      </h3>
      <TagList className="mt-4">
        <TagListItem>In-depth questionnaires</TagListItem>
        <TagListItem>Feasibility studies</TagListItem>
        <TagListItem>Blood samples</TagListItem>
        <TagListItem>Employee surveys</TagListItem>
        <TagListItem>Proofs-of-concept</TagListItem>
        <TagListItem>Forensic audit</TagListItem>
      </TagList>
    </Section>
  )
}

function Build() {
  return (
    <Section index={2} title="Build" image={imageLaptop}>
      <div className="space-y-6 text-base text-warm-muted">
        <p>
          Based off of the discovery phase, we develop a comprehensive roadmap
          for each product and start working towards delivery. The roadmap is an
          intricately tangled mess of technical nonsense designed to drag the
          project out as long as possible.
        </p>
        <p>
          Each client is assigned a key account manager to keep lines of
          communication open and obscure the actual progress of the project.
          They act as a buffer between the client’s incessant nagging and the
          development team who are hard at work scouring open source projects
          for code to re-purpose.
        </p>
        <p>
          Our account managers are trained to only reply to client emails after
          9pm, several days after the initial email. This reinforces the general
          aura that we are very busy and dissuades clients from asking for
          changes.
        </p>
      </div>

      <Blockquote
        author={{ name: 'Debra Fiscal', role: 'CEO of Unseal' }}
        className="mt-12"
      >
        Studio were so regular with their progress updates we almost began to
        think they were automated!
      </Blockquote>
    </Section>
  )
}

function Deliver() {
  return (
    <Section index={3} title="Deliver" image={imageMeeting}>
      <div className="space-y-6 text-base text-warm-muted">
        <p>
          About halfway through the Build phase, we push each project out by 6
          weeks due to a change in{' '}
          <strong className="font-semibold text-warm-ink">requirements</strong>.
          This allows us to increase the budget a final time before launch.
        </p>
        <p>
          Despite largely using pre-built components, most of the{' '}
          <strong className="font-semibold text-warm-ink">progress</strong> on
          each project takes place in the final 24 hours. The development time
          allocated to each client is actually spent making augmented reality
          demos that go viral on social media.
        </p>
        <p>
          We ensure that the main pages of the site are{' '}
          <strong className="font-semibold text-warm-ink">
            fully functional
          </strong>{' '}
          at launch — the auxiliary pages will, of course, be lorem ipusm shells
          which get updated as part of our exorbitant{' '}
          <strong className="font-semibold text-warm-ink">maintenance</strong>{' '}
          retainer.
        </p>
      </div>

      <h3 className="mt-12 text-lg font-bold text-warm-ink">
        Included in this phase
      </h3>
      <List className="mt-8">
        <ListItem title="Testing">
          Our projects always have 100% test coverage, which would be impressive
          if our tests weren’t as porous as a sieve.
        </ListItem>
        <ListItem title="Infrastructure">
          To ensure reliability we only use the best Digital Ocean droplets that
          $4 a month can buy.
        </ListItem>
        <ListItem title="Support">
          Because we hold the API keys for every critical service your business
          uses, you can expect a lifetime of support, and invoices, from us.
        </ListItem>
      </List>
    </Section>
  )
}

const values = [
  {
    title: 'Meticulous',
    description:
      'The first part of any partnership is getting our designer to put your logo in our template. The second step is getting them to do the colors.',
  },
  {
    title: 'Efficient',
    description:
      'We pride ourselves on never missing a deadline which is easy because most of the work was done years ago.',
  },
  {
    title: 'Adaptable',
    description:
      'Every business has unique needs and our greatest challenge is shoe-horning those needs into something we already built.',
  },
  {
    title: 'Honest',
    description:
      'We are transparent about all of our processes, banking on the simple fact our clients never actually read anything.',
  },
  {
    title: 'Loyal',
    description:
      'We foster long-term relationships with our clients that go beyond just delivering a product, allowing us to invoice them for decades.',
  },
  {
    title: 'Innovative',
    description:
      'The technological landscape is always evolving and so are we. We are constantly on the lookout for new open source projects to clone.',
  },
]

function Values() {
  return (
    <Band tone="forest">
      <Container>
        <SectionHead
          tone="dark"
          kicker="Our values"
          title="Balancing reliability and innovation"
        >
          <p>
            We strive to stay at the forefront of emerging trends and
            technologies, while completely ignoring them and forking that old
            Rails project we feel comfortable using. We stand by our core values
            to justify that decision.
          </p>
        </SectionHead>
        <ValueCards items={values} />
      </Container>
    </Band>
  )
}

export const metadata: Metadata = {
  title: 'Our Process',
  description:
    'We believe in efficiency and maximizing our resources to provide the best value to our clients.',
}

export default function Process() {
  return (
    <RootLayout>
      <PageHero kicker="Our process" title="How we work">
        <p>
          We believe in efficiency and maximizing our resources to provide the
          best value to our clients. The primary way we do that is by re-using
          the same five projects we’ve been developing for the past decade.
        </p>
      </PageHero>

      <Band tone="cream">
        <Container className="space-y-24 split:space-y-32">
          <Discover />
          <Build />
          <Deliver />
        </Container>
      </Band>

      <Values />

      <ContactSection />
    </RootLayout>
  )
}
