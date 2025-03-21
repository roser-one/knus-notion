// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css'
// global styles shared across the entire site
import 'styles/global.css'
// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'
// global style overrides for notion
import 'styles/notion.css'
// global style overrides for prism theme (optional)
import 'styles/prism-theme.css'

import type { AppProps } from 'next/app'
import * as Fathom from 'fathom-client'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import * as React from 'react'

import { bootstrap } from '@/lib/bootstrap-client'
import {
  fathomConfig,
  fathomId,
  isServer
} from '@/lib/config'

if (!isServer) {
  bootstrap()
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  React.useEffect(() => {
    // Initialize PostHog with proper configuration
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY as string;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
    
    console.log(`PostHog initializing with host ${apiHost}`);
    
    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: true, // Let's enable automatic pageview capture
      autocapture: true,
      persistence: 'localStorage+cookie',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug(true);
        }
      }
    });

    // Handle route changes
    function handleRouteChange() {
      if (fathomId) {
        Fathom.trackPageview()
      }
      
      // Explicitly capture PostHog pageview on route change
      posthog.capture('$pageview');
    }

    // Initialize Fathom if configured
    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }

    // Subscribe to router changes
    router.events.on('routeChangeComplete', handleRouteChange)
    
    // Initial pageview
    handleRouteChange();

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return <Component {...pageProps} />
}
