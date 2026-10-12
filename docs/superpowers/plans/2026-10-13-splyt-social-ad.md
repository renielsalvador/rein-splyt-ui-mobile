# Splyt 15-Second Social Ad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a reproducible 15-second 1080 × 1920 social ad that faithfully presents Splyt’s mobile UI, touch interactions, major expense-sharing features, captions, and branded audio.

**Architecture:** Add a self-contained macOS Swift rendering tool under `tools/social-ad` so the ad can be generated without changing the shipping React Native application or adding npm dependencies. The renderer will use the app’s existing brand asset and source-defined UI styles to draw a deterministic mobile interaction timeline with Core Graphics, encode H.264 with AVFoundation, synthesize an original instrumental/tap track, and mux AAC audio into the final MP4.

**Tech Stack:** Swift 6, AppKit/Core Graphics/Core Text, AVFoundation, Core Media, existing Splyt PNG branding asset

**Spec:** `docs/superpowers/specs/2026-10-13-splyt-social-ad-design.md`

## Global Constraints

- Output is exactly 15.0 seconds, 1080 × 1920 pixels, 30 fps, H.264 video with AAC audio in an MP4 container.
- Encode H.264 at a target bitrate of 12 Mbps and source audio at 48 kHz stereo before AAC muxing.
- Use fictional demo data only: Weekend Trip, Apartment, Dinner, Alex, Maya, Sam, and Jordan.
- Use PHP throughout the featured event; show Dinner at ₱2,400, central-fund values of ₱6,000 contributed and ₱4,850 available, and balances of Alex +₱1,200, Maya −₱600, and Sam −₱600.
- Burn captions into the video and keep essential copy outside the top 180 pixels, bottom 320 pixels, and rightmost 160 pixels.
- Use the existing Splyt teal-led brand and `assets/branding/splyt-app-icon-no-bg-white.png` logo.
- Include upbeat original instrumental audio and restrained interaction sounds; do not use voice-over or third-party media.
- Do not expose credentials, real user data, debug UI, development menus, or unsupported payment claims.

## Review Focus

- Timeline boundary values: exactly one scene and caption are active at every frame from frame 0 through frame 449.
- Social safe areas: no caption or end-card text intersects the prohibited top, bottom, or right overlay regions.
- Deterministic output: the same source revision produces the same cue schedule, demo values, and frame count.
- Audio/video alignment: the audio track and video track both end at 15.0 seconds without drift.
- Export compatibility: the final file contains H.264 video and AAC audio at the required dimensions and frame rate.

---

### Task 1: Timeline Model and Validation

**Files:**
- Create: `tools/social-ad/AdTimeline.swift`
- Create: `tools/social-ad/AdTimelineTests.swift`

**Interfaces:**
- Consumes: Exact timing, captions, demo values, and safe-area limits from the approved spec.
- Produces: `AdTimeline.production`, `AdTimeline.scene(atFrame:) -> AdScene`, `AdTimeline.caption(atFrame:) -> CaptionCue?`, `AdTimeline.touches(atFrame:) -> [TouchCue]`, and `validate(_ timeline: AdTimeline) -> [ValidationIssue]`.

- [ ] **Step 1: Write failing timeline tests**

  Add tests named `testProductionTimelineHas450Frames`, `testEveryFrameHasExactlyOneScene`, `testApprovedCaptionsAndDemoValues`, `testCaptionFramesStayInsideSafeArea`, and `testTouchCuesStayInsidePhoneViewport`. Assert the exact 0–60, 60–180, 180–270, 270–360, and 360–450 frame scene boundaries and all four approved captions plus the final tagline.

- [ ] **Step 2: Run the timeline tests and verify they fail**

  Run: `swiftc -parse-as-library tools/social-ad/AdTimelineTests.swift -o /tmp/splyt-ad-timeline-tests && /tmp/splyt-ad-timeline-tests`

  Expected: compilation fails because `AdTimeline`, cues, and validation do not exist.

- [ ] **Step 3: Implement the timeline model and validator**

  Define `AdScene`, `CaptionCue`, `TouchCue`, `DemoContent`, `SafeArea`, `AdTimeline`, `ValidationIssue`, and `validate(_:)`. Use frame-based integer boundaries at 30 fps so duration and cue transitions cannot accumulate floating-point drift.

- [ ] **Step 4: Run the timeline tests and verify they pass**

  Run: `swiftc -parse-as-library tools/social-ad/AdTimeline.swift tools/social-ad/AdTimelineTests.swift -o /tmp/splyt-ad-timeline-tests && /tmp/splyt-ad-timeline-tests`

  Expected: exits 0 and prints `AdTimelineTests: PASS`.

- [ ] **Step 5: Commit the timeline model**

  ```bash
  git add tools/social-ad/AdTimeline.swift tools/social-ad/AdTimelineTests.swift
  git commit -m "feat(ad): define social ad timeline"
  ```

### Task 2: Faithful Splyt Scene Renderer

**Files:**
- Create: `tools/social-ad/BrandStyle.swift`
- Create: `tools/social-ad/AppScenes.swift`
- Create: `tools/social-ad/FrameRenderer.swift`
- Create: `tools/social-ad/FrameRendererTests.swift`
- Copy: `assets/branding/splyt-app-icon-no-bg-white.png` to `tools/social-ad/assets/splyt-logo.png`

**Interfaces:**
- Consumes: `AdTimeline.production`, `AdScene`, caption cues, touch cues, and demo content from Task 1.
- Produces: `BrandStyle.splyt`, `AppScenes.draw(scene:frame:timeline:in:)`, and `FrameRenderer.render(frame:timeline:) throws -> CGImage`.

- [ ] **Step 1: Write failing renderer tests**

  Add tests named `testRepresentativeFramesRenderAt1080By1920`, `testEverySceneRendersNonEmptyPixels`, `testCaptionBoundsRespectSafeArea`, `testEndCardUsesLogoAndTagline`, and `testRendererIsDeterministic`. Render representative frames 0, 90, 210, 315, and 405; assert dimensions, non-background pixel coverage, calculated text bounds, and identical SHA-256-compatible byte output for two renders of the same frame.

- [ ] **Step 2: Run renderer tests and verify they fail**

  Run: `swiftc -parse-as-library tools/social-ad/AdTimeline.swift tools/social-ad/FrameRendererTests.swift -framework AppKit -o /tmp/splyt-ad-render-tests && /tmp/splyt-ad-render-tests`

  Expected: compilation fails because the renderer interfaces do not exist.

- [ ] **Step 3: Implement brand primitives**

  Define the exact teal, ink, muted, success, danger, card, and background colors; typography sizes; corner radii; shadow treatment; phone viewport; caption bounds; and reusable drawing helpers in `BrandStyle.swift`. Base color values and visual hierarchy on `src/theme/tokens.ts` and the existing UI components.

- [ ] **Step 4: Implement the five UI scenes**

  Draw the event list, expense entry/save, central fund, balances/settlement, and end card in `AppScenes.swift`. Include recognizable app navigation, realistic cards and controls, all fixed demo values, short scroll/transition motion, and no invented feature claims.

- [ ] **Step 5: Implement frame composition**

  In `FrameRenderer.swift`, compose the current app scene, device/status treatment, scene transition, burned-in caption, and animated touch circle for each frame. Keep all essential text within the declared safe area.

- [ ] **Step 6: Run renderer tests and export review frames**

  Run: `swiftc -parse-as-library tools/social-ad/AdTimeline.swift tools/social-ad/BrandStyle.swift tools/social-ad/AppScenes.swift tools/social-ad/FrameRenderer.swift tools/social-ad/FrameRendererTests.swift -framework AppKit -o /tmp/splyt-ad-render-tests && /tmp/splyt-ad-render-tests --write-review-frames tools/social-ad/review-frames`

  Expected: exits 0, prints `FrameRendererTests: PASS`, and writes five 1080 × 1920 PNG review frames.

- [ ] **Step 7: Inspect all five review frames**

  Open or image-inspect frames 0, 90, 210, 315, and 405. Confirm app resemblance, correct values, caption readability, safe-area clearance, and absence of clipping before continuing.

- [ ] **Step 8: Commit the scene renderer**

  ```bash
  git add tools/social-ad/BrandStyle.swift tools/social-ad/AppScenes.swift tools/social-ad/FrameRenderer.swift tools/social-ad/FrameRendererTests.swift tools/social-ad/assets/splyt-logo.png tools/social-ad/review-frames
  git commit -m "feat(ad): render Splyt feature scenes"
  ```

### Task 3: H.264 Video Encoding

**Files:**
- Create: `tools/social-ad/VideoEncoder.swift`
- Create: `tools/social-ad/VideoEncoderTests.swift`

**Interfaces:**
- Consumes: `FrameRenderer.render(frame:timeline:)` and the 450-frame production timeline.
- Produces: `VideoEncoder.encode(timeline:renderer:to:) async throws -> VideoMetadata` and `VideoMetadata.inspect(_:) async throws -> VideoMetadata`.

- [ ] **Step 1: Write failing encoder tests**

  Add `testEncodes450FramesAt30FPS`, `testVideoIs1080By1920H264`, `testVideoDurationIsExactly15Seconds`, and `testEncodingRejectsInvalidTimeline`. Encode a reduced diagnostic fixture for routine speed, then inspect the full production export for exact metadata.

- [ ] **Step 2: Run encoder tests and verify they fail**

  Run: `swiftc -parse-as-library tools/social-ad/AdTimeline.swift tools/social-ad/BrandStyle.swift tools/social-ad/AppScenes.swift tools/social-ad/FrameRenderer.swift tools/social-ad/VideoEncoder.swift tools/social-ad/VideoEncoderTests.swift -framework AppKit -framework AVFoundation -framework CoreMedia -o /tmp/splyt-ad-video-tests && /tmp/splyt-ad-video-tests`

  Expected: compilation fails because `VideoEncoder` and `VideoMetadata` do not exist.

- [ ] **Step 3: Implement the video encoder**

  Use `AVAssetWriter`, `AVAssetWriterInputPixelBufferAdaptor`, and presentation timestamps derived directly from frame indexes. Encode H.264 at 1080 × 1920, 30 fps, a 12 Mbps target bitrate, and no intermediate frame files.

- [ ] **Step 4: Run encoder tests and verify they pass**

  Run the command from Step 2.

  Expected: exits 0 and prints `VideoEncoderTests: PASS` with 1080 × 1920, 30 fps, H.264, 450 frames, and 15.0 seconds.

- [ ] **Step 5: Commit the video encoder**

  ```bash
  git add tools/social-ad/VideoEncoder.swift tools/social-ad/VideoEncoderTests.swift
  git commit -m "feat(ad): encode vertical H264 video"
  ```

### Task 4: Original Audio and Final MP4

**Files:**
- Create: `tools/social-ad/AudioRenderer.swift`
- Create: `tools/social-ad/AudioRendererTests.swift`
- Create: `tools/social-ad/AdExporter.swift`
- Create: `tools/social-ad/main.swift`

**Interfaces:**
- Consumes: The production timeline, touch cue timing, and silent H.264 output from Task 3.
- Produces: `AudioRenderer.render(timeline:to:) throws -> AudioMetadata`, `AdExporter.mux(video:audio:to:) async throws -> ExportMetadata`, and CLI command `splyt-ad-render --output <path>`.

- [ ] **Step 1: Write failing audio/export tests**

  Add tests named `testAudioIsExactly15Seconds`, `testTapAccentsAlignWithTouchCues`, `testAudioPeakDoesNotClip`, `testFinalExportContainsH264AndAAC`, and `testAudioAndVideoDurationsMatch`. Assert 48 kHz stereo source audio, peaks below −1 dBFS, and final 15.0-second track durations.

- [ ] **Step 2: Run audio/export tests and verify they fail**

  Run: `swiftc -parse-as-library tools/social-ad/AdTimeline.swift tools/social-ad/BrandStyle.swift tools/social-ad/AppScenes.swift tools/social-ad/FrameRenderer.swift tools/social-ad/VideoEncoder.swift tools/social-ad/AudioRenderer.swift tools/social-ad/AdExporter.swift tools/social-ad/AudioRendererTests.swift -framework AppKit -framework AVFoundation -framework AudioToolbox -framework CoreMedia -o /tmp/splyt-ad-export-tests && /tmp/splyt-ad-export-tests`

  Expected: compilation fails because audio rendering, muxing, and the CLI do not exist.

- [ ] **Step 3: Implement deterministic original audio**

  Synthesize a light upbeat instrumental bed from simple percussion, bass, and bell-like tones, then add restrained tap accents at `TouchCue` frames. Generate samples deterministically at 48 kHz stereo, apply short fades, and keep the peak below −1 dBFS.

- [ ] **Step 4: Implement muxing and the render CLI**

  Encode the generated audio as AAC and combine it with the H.264 track through AVFoundation. The CLI validates the timeline first, writes temporary media under a task-specific temporary directory, exports atomically to the requested `.mp4`, and removes only its own temporary files.

- [ ] **Step 5: Run audio/export tests and verify they pass**

  Run the command from Step 2.

  Expected: exits 0 and prints `AudioRendererTests: PASS` and `AdExporterTests: PASS`; metadata reports H.264 video, AAC audio, and matching 15.0-second durations.

- [ ] **Step 6: Commit audio and export support**

  ```bash
  git add tools/social-ad/AudioRenderer.swift tools/social-ad/AudioRendererTests.swift tools/social-ad/AdExporter.swift tools/social-ad/main.swift
  git commit -m "feat(ad): add original audio and MP4 export"
  ```

### Task 5: Reproducible Render, Documentation, and Delivery Verification

**Files:**
- Create: `tools/social-ad/render.sh`
- Create: `tools/social-ad/README.md`
- Create: `artifacts/splyt-social-ad-15s.mp4`
- Create: `artifacts/splyt-social-ad-poster.png`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `splyt-ad-render --output <path>` from Task 4.
- Produces: A documented one-command render workflow and the approved final MP4/poster artifacts.

- [ ] **Step 1: Add the render wrapper and usage documentation**

  `render.sh` compiles the Swift sources to a task-specific temporary binary and renders `artifacts/splyt-social-ad-15s.mp4`. Document prerequisites, render command, output paths, fixed copy, and verification commands. Ignore only disposable intermediate media; keep the final MP4, poster, source, review frames, and tests tracked.

- [ ] **Step 2: Render the final deliverables**

  Run: `tools/social-ad/render.sh`

  Expected: exits 0 and creates the MP4 plus a 1080 × 1920 PNG poster derived from the end card.

- [ ] **Step 3: Run all source and media verification**

  Run timeline, renderer, video, and export tests; then inspect the final asset with the tool’s metadata command.

  Expected: all tests pass; metadata reports 1080 × 1920, 30 fps, 450 frames, 15.0 seconds, H.264, and AAC.

- [ ] **Step 4: Perform visual and muted-playback review**

  Inspect representative frames and play the full MP4 once with audio and once muted. Confirm every approved caption and demo value is readable on a phone-sized view, transitions contain no clipping, touch indicators align with actions, and the final card remains visible for at least 1.5 seconds.

- [ ] **Step 5: Run repository checks**

  Run: `source ~/.nvm/nvm.sh && nvm use 22 && npx tsc --noEmit && npm run lint && npm test -- --runInBand`

  Expected: TypeScript, lint, and Jest checks all pass with no regressions to the shipping application.

- [ ] **Step 6: Commit the render workflow and final artifacts**

  ```bash
  git add .gitignore tools/social-ad artifacts/splyt-social-ad-15s.mp4 artifacts/splyt-social-ad-poster.png
  git commit -m "feat(ad): deliver Splyt social video"
  ```
