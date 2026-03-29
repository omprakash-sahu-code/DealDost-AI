export interface LegalService {
  id: string;
  title: string;
  description: string;
  price: string;
  reliability: number; // Replaces 'rating'
  image: string;
  features: string[];
}

export const legalServices: LegalService[] = [
  {
    id: 'nda-pro',
    title: 'Idea Protection (NDA)',
    description: 'A comprehensive Non-Disclosure Agreement designed to protect your intellectual property during initial pitches and founder discussions.',
    price: '₹499',
    reliability: 5.0,
    image: '/services/nda.jpg',
    features: ['IP Protection', 'Non-Solicitation', 'Global Validity']
  },
  {
    id: 'service-agreement',
    title: 'Master Service Agreement',
    description: 'The ultimate contract for freelancers and agencies. Defines scope, timelines, and crystal-clear payment milestones to avoid disputes.',
    price: '₹999',
    reliability: 4.9,
    image: '/services/msa.jpg',
    features: ['Payment Protection', 'Revision Limits', 'Liability Shields']
  },
  {
    id: 'escrow-smart',
    title: 'Secure Payment Escrow',
    description: 'Bridge the trust gap. Funds are held in a secure neutral account and released only when project milestones are digitally verified.',
    price: '1.5% Fee',
    reliability: 5.0,
    image: '/services/escrow.jpg',
    features: ['Milestone Release', 'Fraud Prevention', 'Instant Payouts']
  }
];

export interface ProcessStep {
  title: string;
  description: string;
  position: 'left' | 'right';
}

export const processSteps: ProcessStep[] = [
  {
    title: 'Chat-to-Contract',
    description: 'Our AI listens to your informal deal terms and instantly structures them into a bulletproof legal framework.',
    position: 'left'
  },
  {
    title: 'Biometric Signing',
    description: 'Execute agreements in seconds with secure, Aadhaar-linked or biometric digital signatures.',
    position: 'right'
  },
  {
    title: 'Real-time Balancing',
    description: 'Our smart-scale technology ensures that neither party holds unfair leverage, creating a perfectly balanced deal.',
    position: 'left'
  },
  {
    title: 'Auto-Arbitration',
    description: 'Built-in dispute resolution layers ensure that if a deal goes sour, you have a clear path to justice without the courts.',
    position: 'right'
  }
];
