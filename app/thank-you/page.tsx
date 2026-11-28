import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { course } from '../../lib/course';

export const metadata: Metadata = {
  title: 'Enquiry received | VLS Law Academy',
  description: 'Confirmation for your Civil Procedure & Civil Trial enquiry.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/thank-you' },
};

export default async function ThankYouPage({ searchParams }: PageProps<'/thank-you'>) {
  const { duplicate, local } = await searchParams;

  return (
    <main className="thank-you-page" aria-labelledby="thank-you-title">
      <div className="shell thank-you-card">
        <Image src="/vls/logo.png" alt={course.contact.name} width={72} height={72} unoptimized />
        <h1 id="thank-you-title">{duplicate === '1' ? 'Enquiry already received.' : 'Enquiry received.'}</h1>
        <p>
          {local === '1'
            ? 'Your test enquiry is saved in this local preview.'
            : `Thank you for your interest in ${course.name}. Our admissions team will contact you with course details and information about the upcoming batch.`}
        </p>
        <Link href="/" className="button button-primary">Back to course page</Link>
      </div>
    </main>
  );
}
