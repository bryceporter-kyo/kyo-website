import { fetchLegalPages, saveLegalPage, type LegalPage } from './legal-pages';

const INITIAL_POLICIES: Omit<LegalPage, 'id'>[] = [
  {
    title: "Privacy & Cookie Policy",
    slug: "privacy-policy",
    headerImageId: "page-header-privacy",
    index: true,
    follow: true,
    showInFooter: true,
    ageMetadata: "13+",
    lastUpdated: "2023-10-26T00:00:00.000Z",
    content: `# Introduction
Kawartha Youth Orchestra, its subsidiaries, and its affiliates (“Kawartha Youth Orchestra”, “KYO”, “we”, “us”, “our”) respect your privacy and are committed to protecting your personal data. This Privacy & Cookie Policy describes our data collection and processing activities.

When we refer to “personal data” in this Privacy Policy we are referring to any information that falls under the definition of “personal data” in the Personal Information Protection and Electronic Documents Act.

# 1. Important Information and Who We Are
Kawartha Youth Orchestra is responsible for the processing of your personal data as described in this Privacy Policy. For the purposes of the Personal Information Protection and Electronic Documents Act, in respect of our core service offerings, Kawartha Youth Orchestra acts as the controller, business, and personal information processor, respectively, of such personal data.

## 1.1. Updates to this privacy & cookie policy
This Privacy & Cookie Policy may be updated periodically. We will update the date at the top of this Privacy & Cookie Policy accordingly and encourage you to check for changes to this Privacy & Cookie Policy, which will be available on our website.

## 1.2 Third-party links
Our website(s) may include links to or functionality from third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you.

## 1.3 Kawartha Youth Orchestra as Data Processor
From time to time, Kawartha Youth Orchestra may process personal data in the role of a service provider on behalf of partner organizations, funders, or program collaborators.

# 2. What personal data do we collect and how?
“Personal data” means any personally identifiable information belonging to an identifiable natural person.

## 2.1 Categories of Personal Data Collected
We may collect, create, use, store and otherwise process different categories of personal data:
* **Identifier Data**, including first name, maiden name, last name, job title, and company name.
* **Contact Data**, including your address(es), email address(es), and telephone number(s).
* **Profile Data**, including your CV, professional background, qualifications, and other voluntarily provided details.
* **Technical Data**, including IP address, login data, browser type and version, and operating system.

# 3. Why we process your personal data
In accordance with the Personal Information Protection and Electronic Documents Act S.C. 2000, c. 5, we rely on a number of lawful bases to process your personal data, including fulfilling contracts, complying with legal obligations, and pursuing legitimate organizational interests.

# 4. Cookies and Related Technologies
Our website uses cookies to enhance functionality and analyze site traffic. Cookies are small text files stored on your device. You can control cookie preferences through your browser settings.`
  },
  {
    title: "Terms of Use",
    slug: "terms-of-use",
    headerImageId: "page-header-terms",
    index: true,
    follow: true,
    showInFooter: true,
    lastUpdated: "2023-10-26T00:00:00.000Z",
    content: `# Agreement to Terms
By accessing or using the Kawartha Youth Orchestra website, you agree to be bound by these Terms of Use and all applicable laws and regulations.

# Intellectual Property
The content, logo, music sheets, recordings, images, and other materials on this website are the property of Kawartha Youth Orchestra and are protected by copyright and intellectual property laws.

# User Conduct
You agree to use this website only for lawful purposes. You are prohibited from posting or transmitting any unlawful, threatening, defamatory, or obscene material.`
  },
  {
    title: "Terms and Conditions",
    slug: "terms-and-conditions",
    headerImageId: "page-header-terms",
    index: true,
    follow: true,
    showInFooter: true,
    lastUpdated: "2023-10-26T00:00:00.000Z",
    content: `# Program Participation
Participation in Kawartha Youth Orchestra programs is subject to active registration, tuition payment, and adherence to our student/parent code of conduct.

# Tuition and Refunds
Tuition fees must be paid in accordance with the schedule provided during registration. Refunds are only issued under special circumstances as approved by the Board of Directors.

# Liability Waiver
Parents/guardians agree to waive liability for accidental injuries that occur during rehearsals, concerts, or official events.`
  },
  {
    title: "Accessibility Policy",
    slug: "accessibility-policy",
    headerImageId: "page-header-accessibility",
    index: true,
    follow: true,
    showInFooter: true,
    lastUpdated: "2023-10-26T00:00:00.000Z",
    content: `# Our Commitment
Kawartha Youth Orchestra is committed to ensuring that our programs, performances, and digital spaces are accessible to everyone, including individuals with disabilities.

# Website Accessibility
We strive to align our digital experience with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

# Feedback Process
If you encounter accessibility barriers on our website or at our venues, please contact our administration.`
  },
  {
    title: "Hiring Policy",
    slug: "hiring-policy",
    headerImageId: "page-header-terms",
    index: true,
    follow: true,
    showInFooter: true,
    lastUpdated: "2023-10-26T00:00:00.000Z",
    content: `# Equal Opportunity
Kawartha Youth Orchestra is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees, instructors, and volunteers.

# Vulnerable Sector Screening
Due to the nature of our programs involving children and youth, all instructors, conductors, and key volunteers must complete a Vulnerable Sector Check prior to starting engagement.`
  },
  {
    title: "Information Accuracy Policy",
    slug: "information-accuracy-policy",
    headerImageId: "page-header-terms",
    index: true,
    follow: true,
    showInFooter: true,
    lastUpdated: "2023-10-26T00:00:00.000Z",
    content: `# Data Integrity
We make every effort to ensure that the information on our website, in our newsletters, and in our registers is accurate, complete, and up-to-date.

# Correction of Information
If you notice any inaccuracies in your contact details or child's record, please notify us immediately so we can apply corrections.`
  },
  {
    title: "Protection of Children Policy",
    slug: "protection-of-children-and-vulnerable-persons-policy",
    headerImageId: "page-header-terms",
    index: true,
    follow: true,
    showInFooter: true,
    lastUpdated: "2023-10-26T00:00:00.000Z",
    content: `# Child Safety First
The safety and well-being of our young musicians is our absolute priority. We maintain strict supervision ratios and safety protocols during all events.

# Abuse Prevention
We hold zero tolerance for any form of harassment, abuse, or neglect. All staff and instructors receive training on child abuse awareness and reporting duties.`
  }
];

export async function seedLegalPagesIfEmpty() {
  try {
    const existing = await fetchLegalPages();
    if (existing.length === 0) {
      console.log('[Seed] Seeding default legal policies...');
      for (const policy of INITIAL_POLICIES) {
        await saveLegalPage(policy);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Seed] Error seeding legal pages:', error);
    return false;
  }
}
