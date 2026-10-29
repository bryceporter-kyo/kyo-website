/**
 * KYO Upbeat! Holiday Gift Catalogue - Canonical Items Configuration
 *
 * Source of truth for all 14 catalogue gifts:
 * - Fixed prices include the 3% processing fee, rounded up naturally to standard pricing (.99 / .49).
 * - Displayed prices and server charge amounts derive from this file (no client-side calculation).
 * - Variable items enforce minimum contribution of $10.01 CAD.
 */

export type CatalogueItemType = 'fixed' | 'variable' | 'addon' | 'bundle';

export interface CatalogueItem {
  id: string;
  name: string;
  category: 'instruments' | 'instruction';
  type: CatalogueItemType;
  basePrice?: number;
  /**
   * Final amount in CAD charged to Stripe (including 3% processing fee, rounded up naturally)
   */
  chargeAmount?: number;
  displayPrice: string;
  inclusionLine?: string;
  description: string;
  defaultImageId: string;
  minAmount?: number;
  hasDedicationInscription?: boolean;
  isMatchingOpportunity?: boolean;
}

export const CATALOGUE_ITEMS: CatalogueItem[] = [
  // 1. Small-Sized Violin Outfit
  {
    id: 'small-violin-outfit',
    name: 'Small-Sized Violin Outfit',
    category: 'instruments',
    type: 'fixed',
    basePrice: 499,
    chargeAmount: 513.99, // $499 * 1.03 = $513.97 -> $513.99
    displayPrice: '$513.99',
    inclusionLine: 'Includes Case, Strings, and Bow',
    description: "Variable-sized small instruments are essential for giving our youngest Upbeat! musicians the chance to get started early. As musicians grow, we swap them for instruments that fit their hands—sizing up is always an exciting moment! We need a variety of instrument sizes on hand to support this growth, and as an added bonus, there's something undeniably adorable about a tiny violin.",
    defaultImageId: 'gift-catalogue-violin-small'
  },
  // 2. Violin Outfit
  {
    id: 'violin-outfit',
    name: 'Violin Outfit',
    category: 'instruments',
    type: 'fixed',
    basePrice: 899,
    chargeAmount: 925.99, // $899 * 1.03 = $925.97 -> $925.99
    displayPrice: '$925.99',
    inclusionLine: 'Includes Case, Strings, and Bow',
    description: "As Upbeat! has grown, we've realized just how much the quality of student instruments matters. A student instrument needs to be comfortable, easy to play, and capable of producing a beautiful sound that keeps a young musician excited about making music. Help us provide high-quality, durable Violin to keep the music going for years to come.",
    defaultImageId: 'gift-catalogue-violin'
  },
  // 3. Viola Outfit
  {
    id: 'viola-outfit',
    name: 'Viola Outfit',
    category: 'instruments',
    type: 'fixed',
    basePrice: 999,
    chargeAmount: 1028.99, // $999 * 1.03 = $1028.97 -> $1028.99
    displayPrice: '$1,028.99',
    inclusionLine: 'Includes Case, Strings, and Bow',
    description: "The often-neglected big sibling of the violin, the viola is the heart and soul of that full, warm orchestral sound. Its darker, more mellow tone attracts musicians who are ready to be true team players. Currently, all 14 of KYO's violas are on loan! Our long-time single violist in IKYO has recently been joined by an Upbeat! peer, and with so many Upbeat! violists hard at work, we can't wait to see a full Senior Viola section. To keep this dream alive, we need more quality violas in a wider range of sizes as our musicians grow.",
    defaultImageId: 'gift-catalogue-viola'
  },
  // 4. Cello Outfit
  {
    id: 'cello-outfit',
    name: 'Cello Outfit',
    category: 'instruments',
    type: 'fixed',
    basePrice: 1500,
    chargeAmount: 1544.99, // $1500 * 1.03 = $1545.00 -> $1544.99
    displayPrice: '$1,544.99',
    inclusionLine: 'Includes Case, Strings, and Bow',
    description: "We so often see young cellists get hooked from the very first note—for kids who resonate with the rich sound of the cello, nothing else compares. Our cello program has expanded rapidly, and as our young cellists grow taller and advance musically, we have an increasing demand for high-quality, full-sized cellos. By choosing to purchase a new cello for Upbeat!, your generous donation will put a beautifully crafted instrument into the hands of a committed young player who will cherish and be inspired by it for years to come.",
    defaultImageId: 'gift-catalogue-cello'
  },
  // 5. Dedication Add-On
  {
    id: 'dedication',
    name: 'Dedication',
    category: 'instruments',
    type: 'addon',
    basePrice: 10,
    chargeAmount: 10.99, // $10 * 1.03 = $10.30 -> $10.99
    displayPrice: '$10.99',
    description: "Leave a lasting mark on a donated instrument. Inscribe your name, honour a loved one, or celebrate your family's musical heritage. We proudly display your generosity to inspire young musicians and fellow donors alike!",
    defaultImageId: 'gift-catalogue-dedication',
    hasDedicationInscription: true
  },
  // 6. Collapsible Music Stand
  {
    id: 'music-stand',
    name: 'Collapsible Music Stand',
    category: 'instruments',
    type: 'fixed',
    basePrice: 35,
    chargeAmount: 36.99, // $35 * 1.03 = $36.05 -> $36.99
    displayPrice: '$36.99',
    description: "A major theme this year at Upbeat! is \"practice posture,\" but we've found that many Upbeat! musicians lack the setup at home to make proper posture possible. Practicing while staring down at music on a table, bed, or floor leads to difficult-to-correct playing habits and potential strain injuries. Help us provide a collapsible music stand for every child who needs one so they can practice comfortably at home.",
    defaultImageId: 'gift-catalogue-stand'
  },
  // 7. Shatterproof Rosin
  {
    id: 'shatterproof-rosin',
    name: 'Shatterproof Rosin',
    category: 'instruments',
    type: 'fixed',
    basePrice: 17.99,
    chargeAmount: 18.99, // $17.99 * 1.03 = $18.5297 -> $18.99
    displayPrice: '$18.99',
    description: "Did you know that cold, dry Canadian winters make string rosin extra brittle? Going into our sixth winter at Upbeat!, we've learned that the hard way. Luckily, we've found a solution: D'Addario makes an amazing rosin encased in a shock-absorbent guard and holder. While slightly more expensive than standard student rosin, it is well worth it because students will actually get to use the entire block before it shatters!",
    defaultImageId: 'gift-catalogue-rosin'
  },
  // 8. Practice at Home Package
  {
    id: 'practice-package',
    name: 'Practice at Home Package',
    category: 'instruments',
    type: 'bundle',
    basePrice: 52.99,
    chargeAmount: 54.99, // $52.99 * 1.03 = $54.5797 -> $54.99
    displayPrice: '$54.99',
    description: "Shatterproof Rosin + a Clip on Tuner: set an Upbeat! Musician up for success this year with everything they need to practice at home.",
    defaultImageId: 'gift-catalogue-bundle'
  },
  // 9. Student Bow
  {
    id: 'student-bow',
    name: 'Student Bow',
    category: 'instruments',
    type: 'fixed',
    basePrice: 75,
    chargeAmount: 77.99, // $75 * 1.03 = $77.25 -> $77.99
    displayPrice: '$77.99',
    description: "Despite our strict \"Bows Are Not Lightsabers\" policy at Upbeat!, bows inevitably break from time to time, and hair eventually wears out. Many of the original bows donated or purchased when Upbeat! started six years ago are reaching the end of their lifespan. Help us keep the music playing by funding replacement bows!",
    defaultImageId: 'gift-catalogue-bow'
  },
  // 10. Bass Repairs
  {
    id: 'bass-repairs',
    name: 'Bass Repairs',
    category: 'instruments',
    type: 'variable',
    displayPrice: 'Variable',
    minAmount: 10.01,
    description: "KYO owns two beautiful orchestral basses; however, both have been unplayable for years. We would love to restart a bass program at KYO, and several Upbeat! musicians are extremely excited about the possibility. The repairs were quoted at $2,800 for both instruments, and thanks to a few bass-minded donors, we have already raised $1,000 toward our goal. Help us bring the ultimate low end back to our orchestras!",
    defaultImageId: 'gift-catalogue-bass'
  },
  // 11. One Upbeat! Participant (One Month)
  {
    id: 'instruction-one-month',
    name: 'One Upbeat! Participant (One Month)',
    category: 'instruction',
    type: 'fixed',
    basePrice: 100,
    chargeAmount: 102.99, // $100 * 1.03 = $103 -> $102.99
    displayPrice: '$102.99',
    description: "At Upbeat!, we are proud to provide Peterborough's youth with high-quality, professional music instruction. Our teachers are incredible local musicians who are deeply dedicated to the success of every child in the program. By covering the cost of instruction for an Upbeat! participant for a month (or a full year!), you will make a lasting difference in the life of a deserving young person.",
    defaultImageId: 'gift-catalogue-instruction-month'
  },
  // 12. Instruction for One Upbeat! Participant (Full Year)
  {
    id: 'instruction-full-year',
    name: 'Instruction for One Upbeat! Participant (Full Year)',
    category: 'instruction',
    type: 'fixed',
    basePrice: 800,
    chargeAmount: 823.99, // $800 * 1.03 = $824 -> $823.99
    displayPrice: '$823.99',
    description: "At Upbeat!, we are proud to provide Peterborough's youth with high-quality, professional music instruction. Our teachers are incredible local musicians who are deeply dedicated to the success of every child in the program. By covering the cost of instruction for an Upbeat! participant for a month (or a full year!), you will make a lasting difference in the life of a deserving young person.",
    defaultImageId: 'gift-catalogue-instruction-year'
  },
  // 13. Snack for One Week of Upbeat!
  {
    id: 'snack-sponsorship',
    name: 'Snack for One Week of Upbeat!',
    category: 'instruction',
    type: 'fixed',
    basePrice: 250,
    chargeAmount: 257.99, // $250 * 1.03 = $257.50 -> $257.99
    displayPrice: '$257.99',
    description: "Every single day at Upbeat! begins with a nutritious, hearty snack prepared by our committed volunteers. This routine gives participants a chance to socialize, build community, and arrive nourished and ready to learn. Approximately a quarter of Canadian families face food insecurity every year, and for many Upbeat! families, our snack program (and the leftovers sent home) provides essential nutritional support. Our volunteers work hard to feed up to 50 kids twice a week on a budget of just $250 per week—help us keep providing delicious, healthy snacks by sponsoring a week!",
    defaultImageId: 'gift-catalogue-snack'
  },
  // 14. The Pathways Fund
  {
    id: 'pathways-fund',
    name: 'The Pathways Fund',
    category: 'instruction',
    type: 'variable',
    displayPrice: 'Variable',
    minAmount: 10.01,
    isMatchingOpportunity: true,
    description: "Our Upbeat! musicians are going far! This year, twelve Upbeat! musicians and alumni are performing in IKYO, with many more well on their way. Our next goal is to help these committed players take the leap into our Senior Orchestra and beyond by connecting them with outstanding local studio teachers. Without private instruction the advanced techniques needed for our most senior ensemble are nearly impossible to master, but the truth is a private teacher is out of reach for many Upbeat! families. A generous anonymous donor has offered $5,000 in matching funds to seed \"The Pathways Fund.\" With your support, we can offer \"Pathways Scholarships\" to our most dedicated musicians, providing top-of-the-line, one-on-one instruction to elevate their musical talents.",
    defaultImageId: 'gift-catalogue-pathways'
  }
];

export function getCatalogueItem(id: string): CatalogueItem | undefined {
  return CATALOGUE_ITEMS.find(item => item.id === id);
}
