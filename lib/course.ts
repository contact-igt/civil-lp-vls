export const course = {
  id: 'civil-procedure-civil-trial',
  name: 'Civil Procedure & Civil Trial',
  programme: 'Decoding of Practice',
  module: '02',
  tagline: 'From Plaint to Decree.',
  description: 'Understand the practical journey of civil litigation — from drafting and filing a suit to conducting trials, obtaining judgments and executing decrees.',
  batchDate: null,
  classTimings: null,
  duration: null,
  fee: null,
  mode: null,
  language: null,
  faculty: null,
  registration: 'admission-enquiry',
  submission: {
    endpoint: '/api/enquiry',
    productionDestinationEnv: 'CIVIL_LEAD_WEBHOOK_URL',
  },
  contact: {
    name: 'VLS Law Academy',
    website: 'https://www.vlslawacademy.com/',
    phone: '+919500207811',
    phoneLabel: '+91 95002 07811',
    whatsapp: 'https://wa.me/919500025216',
    email: 'contact@vlslawacademy.com',
    address: 'No. 1910, 2nd Floor, H Block 5th Street, 12th Main Road, Anna Nagar West, Chennai, Tamil Nadu 600040',
    privacy: 'https://www.vlslawacademy.com/privacy-policy',
    socials: [
      ['Instagram', 'https://www.instagram.com/vlslawacademy/'],
      ['YouTube', 'https://www.youtube.com/@VLSLAWACADEMY'],
      ['LinkedIn', 'https://www.linkedin.com/company/vls-lawacademy/'],
      ['Facebook', 'https://www.facebook.com/vlslawacademy'],
    ],
    programmeTestimonial: 'https://www.youtube.com/watch?v=qaxU1MBhhGc',
  },
} as const;

export const title = 'Civil Procedure & Civil Trial Course | VLS Law Academy';
export const description = 'Explore Civil Procedure and Civil Trial with VLS Law Academy. Learn about civil suits, pleadings, trial procedures, execution proceedings and Civil Rules of Practice.';
export const statuses = ['Law student', 'Law graduate', 'Junior advocate', 'Practising advocate', 'Other'] as const;

export const objectives = [
  ['Understand Civil Court Procedure', 'Follow a civil suit from its institution through trial, judgment and execution.'],
  ['Connect Legal Provisions with Litigation', 'See how the Civil Procedure Code shapes pleadings, evidence and requests made to the court.'],
  ['Develop Practical Procedural Understanding', 'Recognise the documents, court orders and procedural decisions that arise at each stage.'],
];

export const journey = [
  ['Legal notice', 'Communicate a claim before suit, where applicable.'],
  ['Institution of suit', 'Present the plaint before the appropriate civil court.'],
  ['Pleadings', 'Identify the claims, defences and any counterclaim.'],
  ['Framing of issues', 'Distil the disputed questions the court must decide.'],
  ['Evidence and trial', 'Produce documents and examine witnesses.'],
  ['Judgment and decree', 'Read the court’s reasons and the formal relief granted.'],
  ['Execution', 'Study how a decree is enforced.'],
];

export const units = [
  {
    title: 'Basics of Civil Procedure Code',
    summary: 'Notices, pleadings and applications before civil and appellate courts.',
    topics: [
      ['Starting a suit', 'General and statutory notices, key provisions of the Code, stay of suit, res judicata, objections to jurisdiction, filing civil suits and presentation of plaints.'],
      ['Pleadings and service', 'Written statements, set-off and counterclaims, misjoinder and non-joinder, service of summons and substituted service, striking out and amending pleadings, and setting aside ex parte orders and judgments.'],
      ['Managing proceedings', 'Out-of-court settlement, disclosure and discovery of documents, interrogatories, abatement and setting it aside, bringing legal representatives of a deceased plaintiff or defendant on record, inherent powers, interest, costs, and incidental and supplemental proceedings.'],
      ['Appellate proceedings', 'Memoranda of appeal, cross-objections, additional evidence in appellate court, appeals from orders and appellate decrees, references, review petitions and caveats.'],
    ],
  },
  {
    title: 'Basics of Civil Trial',
    summary: 'Issues, documents, witness examination and trial appointments.',
    topics: [
      ['Issues and documents', 'Framing issues, condoning delay in filing documents, notices to admit and produce documents, producing originals at or before settlement of issues, and return of admitted documents.'],
      ['Witnesses and appointments', 'Examination-in-chief affidavits, recalling and examining witnesses, commissioners to examine witnesses or conduct local investigations, court guardians and appointment of receivers.'],
    ],
  },
  {
    title: 'Execution Proceedings',
    summary: 'Enforcing decrees, from execution applications to attachment and sale.',
    topics: [
      ['Applying for execution', 'Applications to execute decrees, transferee courts, powers of executing courts, execution against property or the person of a judgment debtor, and execution process.'],
      ['Attachment and claims', 'Attachment of immovable property and movable property held by a garnishee, claim petitions and garnishee orders.'],
      ['Court-ordered sales', 'Sale of property, sale proclamations, sale timing, adjournment, stay and stoppage of sales, setting aside sales for irregularity or fraud, confirmation of sale and rateable distribution.'],
    ],
  },
  {
    title: 'Types of Civil Suits',
    summary: 'Specialised suits, parties and procedures.',
    topics: [
      ['Suits and disposal', 'Summary suits, injunction suits, suits by or against government, interpleader suits, suits by indigent persons, withdrawal and compromise of suits.'],
      ['Parties and subject matter', 'Suits involving minors or persons of unsound mind, public trusts, public nuisance, partnerships, corporations, members of the armed forces, foreign nationals or foreign rulers, and mortgage suits.'],
      ['Constitutional questions', 'Suits involving constitutional interpretation or the validity of statutory instruments.'],
    ],
  },
  {
    title: 'Civil Rules of Practice and Circular Orders',
    summary: 'Court forms, filing, hearings, records and execution practice.',
    topics: [
      ['Forms and presentation', 'Forms of proceedings, plaints and vakalat, recognised agents and pleaders, presentation to court, posting of cases, adjournments, interlocutory proceedings, affidavits and original petitions.'],
      ['Service, hearings and records', 'Issue of summons and notices, returns of service, trial and first hearing, interrogatories, issues, production of records, exhibits, return of documents and incidental proceedings.'],
      ['Commissions, judgments and execution', 'Applications for and return of commissions, forms of decrees and judgments, certified-copy applications and copying charges, execution applications, attachment, claims to attached property, realisation and sale of attached property, rules on court-ordered sales and CPC forms.'],
    ],
  },
];

export const audience = [
  'Law students preparing for litigation',
  'Recent law graduates',
  'Junior advocates',
  'Practising advocates strengthening their procedural understanding',
];

export const faqs = [
  ['What is the Civil Procedure and Civil Trial module?', 'It is Module 02 of VLS Law Academy’s Decoding of Practice programme. It follows the life of a civil suit, from notices and pleadings through trial, judgment and execution.'],
  ['Who should attend this programme?', 'The module is designed for law students preparing for litigation, law graduates, junior advocates and practising advocates who want to strengthen their understanding of civil procedure.'],
  ['What topics are covered?', 'The five units cover the Civil Procedure Code, civil trial, execution proceedings, types of civil suits, and Civil Rules of Practice and Circular Orders. Open the curriculum units for the full topic list.'],
  ['Is it suitable for law students and junior advocates?', 'Yes. The module starts with the basics of civil procedure and trial, then connects them to the documents and decisions that arise during a civil suit.'],
  ['When does the next batch begin?', 'VLS Law Academy is taking enquiries for the upcoming batch. Share your details to receive the schedule once it is confirmed.'],
  ['How can I obtain course fees and admission information?', 'Use the enquiry form or contact VLS Law Academy directly. The admissions team can share the confirmed fee and explain the admission process.'],
];
