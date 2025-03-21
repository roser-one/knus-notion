import posthog from 'posthog-js'
import React from 'react'

import { NotionPage } from '@/components/NotionPage'
import { domain, isDev } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainPage(props) {
  // Add a test button for PostHog in development
  const testPostHog = React.useCallback(() => {
    console.log('Testing PostHog event...');
    try {
      posthog.capture('test_event', { 
        timestamp: new Date().toISOString(),
        source: 'manual_test'
      });
      console.log('PostHog test event sent!');
    } catch (err) {
      console.error('Failed to send PostHog test event:', err);
    }
  }, []);

  return (
    <>
      {isDev && (
        <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
          <button 
            onClick={testPostHog}
            style={{ 
              padding: '8px 16px',
              background: '#6666FF', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test PostHog
          </button>
        </div>
      )}
      <NotionPage {...props} />
    </>
  )
}
