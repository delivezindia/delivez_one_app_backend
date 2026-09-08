import { prisma } from '../src/lib/prisma.js';

const services = [
  {
    name: 'Courier Delivery',
    slug: 'courier-delivery',
    legacySlugs: ['personal-courier'],
    shortDescription: 'Send documents, parcels, and everyday items anywhere.',
    displayOrder: 1,
  },
  {
    name: 'Luggage Delivery',
    slug: 'luggage-delivery',
    legacySlugs: ['airport-luggage'],
    shortDescription: 'Convenient pickup and secure transit for your luggage.',
    displayOrder: 2,
  },
  {
    name: 'Confidential Delivery',
    slug: 'confidential-delivery',
    legacySlugs: ['confidential-courier'],
    shortDescription: 'Private and secure delivery with strict handling controls.',
    displayOrder: 3,
  },
  {
    name: 'Forgot Something?',
    slug: 'forgot-something',
    legacySlugs: ['forgot-something'],
    shortDescription: 'Quick retrieval and delivery of items you left behind.',
    displayOrder: 4,
  },
  {
    name: 'Return Pickup',
    slug: 'return-pickup',
    legacySlugs: ['personal-return-pickup'],
    shortDescription: 'Easy pickup and returns for personal and retail orders.',
    displayOrder: 5,
  },
  {
    name: 'Know More',
    slug: 'know-more',
    legacySlugs: ['gift-delivery', 'gift-and-surprise'],
    shortDescription: 'Explore our full range of tailored logistics, enterprise solutions, and 24/7 support.',
    displayOrder: 6,
  },
];

try {
  for (const item of services) {
    // Check if legacy slug exists
    const existing = await prisma.service.findFirst({
      where: {
        OR: [
          { slug: item.slug },
          ...item.legacySlugs.map((slug) => ({ slug })),
        ],
      },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          slug: item.slug,
          shortDescription: item.shortDescription,
          displayOrder: item.displayOrder,
          isActive: true,
        },
      });
    } else {
      await prisma.service.create({
        data: {
          name: item.name,
          slug: item.slug,
          shortDescription: item.shortDescription,
          displayOrder: item.displayOrder,
          isActive: true,
        },
      });
    }
  }

  // Deactivate any extra services not in the 6 primary services
  const primarySlugs = services.map((s) => s.slug);
  await prisma.service.updateMany({
    where: {
      slug: { notIn: primarySlugs },
    },
    data: {
      isActive: false,
    },
  });

  const allActive = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    select: { name: true, slug: true, displayOrder: true },
  });

  console.log(`Service catalog successfully synchronized with ${allActive.length} services:`);
  allActive.forEach((s) => console.log(`  ${s.displayOrder}. ${s.name} (${s.slug})`));
} finally {
  await prisma.$disconnect();
}
