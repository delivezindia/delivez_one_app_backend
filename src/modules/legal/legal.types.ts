export interface LegalSectionItem {
  number: number;
  title: string;
  summary: string;
  content: string;
}

export interface TermsAndConditionsData {
  lastUpdated: string;
  introduction: string;
  userTerms: LegalSectionItem[];
  serviceTerms: {
    scopes: string[]; // ['All Services', 'Domestic', 'International']
    sections: LegalSectionItem[];
  };
  privacyTerms: LegalSectionItem[];
}

export interface PrivacyPolicyData {
  lastUpdated: string;
  introduction: string;
  sections: LegalSectionItem[];
}
