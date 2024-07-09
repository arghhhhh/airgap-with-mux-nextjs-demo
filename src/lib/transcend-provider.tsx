'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type {
  AirgapAPI,
  PreInitTranscendAPI,
  TranscendAPI
} from '@transcend-io/airgap.js-types'
import Script from 'next/script'

// Add type for Airgap before initialization
type PreInitAirgapAPI = Required<Pick<AirgapAPI, 'readyQueue' | 'ready'>>

declare global {
  interface Window {
    /** airgap.js interface */
    airgap?: PreInitAirgapAPI | AirgapAPI
    /** Transcend Consent Management interface */
    transcend?: PreInitTranscendAPI | TranscendAPI
  }
}

interface ConsentAPI {
  airgap?: AirgapAPI
  transcend?: TranscendAPI
}

interface ConsentProviderProps {
  children: React.ReactNode
  airgapSrc: string
}

export const ConsentContext = createContext<ConsentAPI>({})

/**
 * React context provider for `window.airgap` and `window.transcend`
 * @see https://docs.transcend.io/docs/consent/faq
 */
export const TranscendProvider: React.FC<ConsentProviderProps> = ({
  children,
  airgapSrc
}) => {
  const [airgap, setAirgap] = useState<AirgapAPI | undefined>(undefined)
  const [transcend, setTranscend] = useState<TranscendAPI | undefined>(
    undefined
  )

  // `useEffect` ensures this is only executed in browser
  useEffect(() => {
    // Stub transcend with PreInit API
    if (!window.transcend) {
      const preInitTranscend: PreInitTranscendAPI = {
        readyQueue: [],
        ready(callback) {
          this.readyQueue.push(callback)
        },
        ...(window.transcend || {})
      }
      window.transcend = preInitTranscend
    }

    if (!window.airgap) {
      const preInitAirgap: PreInitAirgapAPI = {
        readyQueue: [],
        ready(callback) {
          this.readyQueue.push(callback)
        },
        ...(window.airgap || {})
      }
      window.airgap = preInitAirgap
    }

    // Wait for airgap.js core to load, and set it in the React state
    window.airgap.ready((airgap) => {
      setAirgap(airgap)
    })

    // Wait for consent manager UI to load, and set it in the React state
    window.transcend.ready((transcend) => {
      setTranscend(transcend)
    })
  }, [])

  useEffect(() => {
    if (airgap && transcend) {
      document.getElementById('transcend.io')?.setAttribute('data-sync', 'off')
      airgap.getConsent().confirmed
        ? transcend.hideConsentManager()
        : transcend.showConsentManager()
    }
  }, [transcend])

  return (
    <>
      <Script src={airgapSrc} id="transcend.io" strategy="beforeInteractive" data-prompt="1"/>
      <ConsentContext.Provider value={{ airgap, transcend }}>
        {children}
      </ConsentContext.Provider>
    </>
  )
}

export const useConsentManager = (): ConsentAPI => useContext(ConsentContext)
