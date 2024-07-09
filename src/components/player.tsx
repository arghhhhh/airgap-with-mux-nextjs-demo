'use client'

import { useConsentManager } from "@/lib/transcend-provider";
import MuxPlayer from "@mux/mux-player-react";

export default function Player() {
  const { transcend } = useConsentManager()
  const handleClick = () => {
    transcend?.showConsentManager({ viewState: 'CompleteOptions' })
  }
  return (
    <div>
        <button onClick={handleClick}>Open Transcend</button>
        <MuxPlayer
            streamType="on-demand"
            playbackId="EcHgOK9coz5K4rjSwOkoE7Y7O01201YMIC200RI6lNxnhs"
            metadata={{
            video_id: "video-id-54321",
            video_title: "Test video title",
            viewer_user_id: "user-id-007",
            }}
            autoPlay="muted"
            disableTracking={true}
            disableCookies={true}
        />
    </div>
  );
}