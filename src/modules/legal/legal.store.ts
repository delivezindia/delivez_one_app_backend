import type { TermsAndConditionsData, PrivacyPolicyData } from './legal.types.js';

export const TERMS_AND_CONDITIONS: TermsAndConditionsData = {
  lastUpdated: '15 August 2025',
  introduction:
    'Welcome to Delivez! These Terms & Conditions govern your use of our mobile application, website and services. By accessing or using Delivez, you agree to be bound by these terms.',
  userTerms: [
    {
      number: 1,
      title: 'About Delivez',
      summary: 'Information about our company, services and these terms.',
      content:
        'Delivez is India’s next-generation tech-driven logistics platform providing on-demand courier, confidential courier, airport luggage, and package delivery solutions.',
    },
    {
      number: 2,
      title: 'Use of Our Services',
      summary: 'Your eligibility, account responsibility and permitted use.',
      content:
        'You must be at least 18 years of age to open an account or place orders. You are solely responsible for all activities and bookings occurring under your account.',
    },
    {
      number: 3,
      title: 'Bookings and Payments',
      summary: 'Pricing, payment methods, cancellations and refunds.',
      content:
        'All prices are displayed in Indian Rupees (INR) inclusive of applicable taxes. Payments may be made via Delivez Money, UPI, Debit/Credit Cards, or Net Banking.',
    },
    {
      number: 4,
      title: 'Shipments and Liability',
      summary: 'Our responsibilities and limitations.',
      content:
        'We exercise reasonable diligence to transport packages securely. Standard liability is capped at ₹5,000 unless extra transit protection was purchased during booking.',
    },
    {
      number: 5,
      title: 'Prohibited Activities',
      summary: 'Activities that are not allowed on our platform.',
      content:
        'Users strictly agree not to send hazardous, illegal, flammable, explosive, or contraband goods as designated by Indian logistics and aviation guidelines.',
    },
    {
      number: 6,
      title: 'Intellectual Property',
      summary: 'Ownership of content, trademarks and usage rights.',
      content:
        'All trademarks, logos, visual assets, and technology used in the application are exclusive property of Delivez Logistics Private Limited.',
    },
    {
      number: 7,
      title: 'Changes to Terms',
      summary: 'How we may update these terms.',
      content:
        'We reserve the right to revise these Terms & Conditions. Continued use of our app or website signifies your agreement to updated revisions.',
    },
    {
      number: 8,
      title: 'Contact Us',
      summary: 'Get in touch for any questions about these terms.',
      content:
        'For queries concerning legal terms or compliance, reach our support desk at legal@delivez.com or call 1800 123 4567.',
    },
  ],
  serviceTerms: {
    scopes: ['All Services', 'Domestic', 'International'],
    sections: [
      {
        number: 1,
        title: 'Scope of Services',
        summary: 'Overview of the services provided by Delivez.',
        content:
          'Delivez provides personal courier, confidential vault transit, baggage drop, and return pickup services across 220+ cities in India and select international corridors.',
      },
      {
        number: 2,
        title: 'Booking and Acceptance',
        summary: 'Terms for creating a shipment and acceptance of goods.',
        content:
          'A booking is accepted when an automated Tracking ID is generated. Delivez delivery executives verify sender identification and package exterior condition before pickup.',
      },
      {
        number: 3,
        title: 'Pricing and Payment',
        summary: 'Charges, payment methods and applicable taxes.',
        content:
          'Rates are determined by volumetric or dead weight (whichever is higher), pickup distance, and transit tier selected.',
      },
      {
        number: 4,
        title: 'Shipment Requirements',
        summary: 'Prohibited items, packaging guidelines and documentation.',
        content:
          'Packages must be adequately secured with protective cushioning. Perishable or dangerous goods are prohibited.',
      },
      {
        number: 5,
        title: 'Delivery and Transit',
        summary: 'Estimated timelines, delivery attempts and service commitments.',
        content:
          'Delivez makes up to 3 delivery attempts. Real-time GPS checkpoints and SMS/WhatsApp notifications are provided for every milestone.',
      },
      {
        number: 6,
        title: 'Liability and Claims',
        summary: 'Our liability, claim process and compensation limits.',
        content:
          'Claims for loss or transit damage must be initiated within 48 hours of expected delivery with photographic proof and digital receipt.',
      },
      {
        number: 7,
        title: 'Cancellations and Refunds',
        summary: 'Terms for cancelling shipments and eligible refunds.',
        content:
          'Cancellations made prior to courier dispatch receive a 100% refund credited immediately to Delivez Wallet or within 3-5 days to source account.',
      },
      {
        number: 8,
        title: 'International Shipments',
        summary: 'Customs, duties, restricted items and country-specific terms.',
        content:
          'Shippers are responsible for export declarations and statutory customs documentation for all cross-border dispatches.',
      },
      {
        number: 9,
        title: 'Special Services',
        summary: 'Additional terms for express, same-day, COD, fragile and other value-added services.',
        content:
          'Value-added services including OTP handoff, tamper-evident security pouch, and armed escort operate under dedicated operational SLAs.',
      },
      {
        number: 10,
        title: 'Governing Law',
        summary: 'Applicable law and dispute resolution.',
        content:
          'These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction over legal disputes.',
      },
    ],
  },
  privacyTerms: [
    {
      number: 1,
      title: 'Data Collection & Encryption',
      summary: 'Protection of sender and recipient contact information.',
      content:
        'All address details, phone numbers, and shipment invoices are encrypted using 256-bit AES cryptographic protocols.',
    },
    {
      number: 2,
      title: 'Third-Party Logistics Disclosure',
      summary: 'Selective sharing with transit partners.',
      content:
        'We share minimal transit-relevant details with delivery partners strictly to complete pickup and dropoff.',
    },
  ],
};

export const PRIVACY_POLICY: PrivacyPolicyData = {
  lastUpdated: '15 August 2025',
  introduction:
    'This Privacy Policy explains how Delivez collects, uses, shares and protects your personal information when you use our app, website and services.',
  sections: [
    {
      number: 1,
      title: 'Introduction',
      summary: 'Overview of this Privacy Policy and who we are.',
      content:
        'Delivez Logistics Private Limited is dedicated to honoring your privacy. We process personal data transparently in accordance with applicable Indian data protection frameworks.',
    },
    {
      number: 2,
      title: 'Information We Collect',
      summary: 'Types of personal and non-personal information we collect.',
      content:
        'We collect name, email address, telephone numbers, delivery addresses, GPS geolocation for pickup routing, and device identifiers.',
    },
    {
      number: 3,
      title: 'How We Use Your Information',
      summary: 'How we use your information to provide and improve services.',
      content:
        'We use information to execute courier dispatches, communicate real-time delivery milestones, calculate optimal routes, and prevent fraudulent bookings.',
    },
    {
      number: 4,
      title: 'Sharing Your Information',
      summary: 'When and with whom we share your information.',
      content:
        'Information is shared solely with assigned riders and licensed logistics carriers. We never sell your personal information to third-party data brokers.',
    },
    {
      number: 5,
      title: 'Data Security',
      summary: 'How we protect your information.',
      content:
        'All data in transit is protected using TLS 1.3 encryption. At-rest databases employ multi-tenant isolation, role-based access control, and continuous security audits.',
    },
    {
      number: 6,
      title: 'Data Retention',
      summary: 'How long we keep your information.',
      content:
        'Booking records and receipts are retained for 7 years to comply with Indian financial and taxation compliance mandates.',
    },
    {
      number: 7,
      title: 'Your Rights',
      summary: 'Your choices and control over your personal data.',
      content:
        'You have the right to review, update, export, or request deletion of your account data directly from the Privacy & Security hub in the Delivez app.',
    },
    {
      number: 8,
      title: 'International Transfers',
      summary: 'How your information may be transferred globally.',
      content:
        'For cross-border shipments, necessary recipient declarations may be securely transmitted to foreign customs authorities under international transit agreements.',
    },
    {
      number: 9,
      title: 'Changes to This Policy',
      summary: 'Updates and how we will notify you.',
      content:
        'We may update this Privacy Policy from time to time. We will alert you to substantial modifications through in-app notices and banner highlights.',
    },
    {
      number: 10,
      title: 'Contact Us',
      summary: 'Get in touch for any privacy-related questions.',
      content:
        'For privacy requests or Data Grievance Officer inquiries, email privacy@delivez.com or write to Delivez Data Protection Cell, Bengaluru, India.',
    },
  ],
};
