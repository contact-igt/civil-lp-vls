'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '../lib/analytics';

export function PageInteractions() {
  const [showSticky, setShowSticky] = useState(false);

  const pageTracked = useRef(false);
  const curriculumTracked = useRef(false);

  useEffect(() => {
    if (!pageTracked.current) {
      pageTracked.current = true;
      track('course_page_view');
    }
    const curriculum = document.querySelector('#curriculum');
    const hero = document.querySelector('.hero-actions');
    const enquire = document.querySelector('#enquire');
    if (!curriculum || !hero || !enquire) return;

    const seen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !curriculumTracked.current) {
        curriculumTracked.current = true;
        track('curriculum_view');
        seen.disconnect();
      }
    });
    seen.observe(curriculum);

    function onClick(event: MouseEvent) {
      const link = event.target instanceof Element && event.target.closest<HTMLElement>('a[data-event]');
      if (!link) return;
      if (link.dataset.event === 'phone_click') track('phone_click');
      if (link.dataset.event === 'whatsapp_click') track('whatsapp_click');
      if (link.dataset.event === 'enquire_click') {
        const placement = link.dataset.placement;
        if (placement === 'header' || placement === 'hero' || placement === 'sticky') track('enquire_click', { placement });
      }
    }

    function updateSticky() {
      if (!hero || !enquire || window.innerWidth >= 700) {
        setShowSticky(false);
        return;
      }
      const form = enquire.getBoundingClientRect();
      const height = window.visualViewport?.height ?? window.innerHeight;
      setShowSticky(hero.getBoundingClientRect().bottom < 65 && form.top > height + 12 && !enquire.contains(document.activeElement));
    }
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateSticky();
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    updateSticky();
    window.addEventListener('resize', updateSticky);
    window.visualViewport?.addEventListener('resize', updateSticky);
    document.addEventListener('focusin', updateSticky);
    document.addEventListener('click', onClick);

    return () => {
      seen.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateSticky);
      window.visualViewport?.removeEventListener('resize', updateSticky);
      document.removeEventListener('focusin', updateSticky);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className="mobile-enquiry" hidden={!showSticky}>
      <a className="button button-primary" href="#enquire" data-event="enquire_click" data-placement="sticky">Enquire Now</a>
    </div>
  );
}
