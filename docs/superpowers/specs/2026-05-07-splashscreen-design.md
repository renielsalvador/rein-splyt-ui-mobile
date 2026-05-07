# Splash Screen Update — Design Spec

**Date:** 2026-05-07
**Status:** Approved

---

## Overview

Update the native splash screens on both iOS and Android to display the Splyt brand logo and "Splyt" text centered on the primary brand color background. No new npm dependencies.

---

## Visual Design

| Property | Value |
|---|---|
| Background color | `#2F6F57` (palette.primary) |
| Logo asset | `assets/branding/splyt-app-icon-no-bg-white.png` |
| Logo size | ~120×120pt (iOS) / ~200×200px (Android) |
| Logo position | Horizontally centered, slightly above vertical center |
| "Splyt" text | White, bold, 36pt, centered horizontally |
| Text position | ~24pt below the logo |
| Removed | "Powered by React Native" subtitle (iOS only) |

---

## iOS

### Asset

- Add `SplashLogo.imageset` to `ios/ReinSplytUiMobile/Images.xcassets/`
- Copy `splyt-app-icon-no-bg-white.png` into the imageset as the 1× image
- `Contents.json` declares `universal` rendering intent, `original` template rendering

### LaunchScreen.storyboard

Edit `ios/ReinSplytUiMobile/LaunchScreen.storyboard`:

1. Set root view background color to `#2F6F57`
2. Remove the "Powered by React Native" label element
3. Add a `UIImageView`:
   - Image: `SplashLogo`
   - Content mode: `Aspect Fit`
   - Width/Height: 120×120pt (explicit size constraints)
   - Centered horizontally (centerX = safeArea.centerX)
   - Vertical position: centerY = container.centerY × 0.85 (slightly above center)
4. Update the "Splyt" label:
   - Text color: white (`#FFFFFF`)
   - Font: bold, 36pt
   - Top constraint: 24pt below the image view's bottom anchor
   - Centered horizontally

---

## Android

### Pre-composed splash asset

Run a Python Pillow script to generate `splash.png`:

1. Load `assets/branding/splyt-app-icon-no-bg-white.png`, scale to 200×200px
2. Render "Splyt" in white bold text (~72pt system font) centered horizontally, 20px below the logo
3. Composite both onto a transparent canvas sized to fit both elements with padding
4. Save output to `android/app/src/main/res/drawable/splash.png`

The script lives at `scripts/generate_splash.py` and is committed to the repo.

### Drawable

Create `android/app/src/main/res/drawable/splash_bg.xml`:

```xml
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <color android:color="#2F6F57" />
    </item>
    <item android:gravity="center">
        <bitmap
            android:src="@drawable/splash"
            android:gravity="center" />
    </item>
</layer-list>
```

### Theme

Add to `android/app/src/main/res/values/styles.xml`:

```xml
<style name="SplashTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:windowBackground">@drawable/splash_bg</item>
</style>
```

### AndroidManifest.xml

Change `MainActivity` theme from `AppTheme` to `SplashTheme`:

```xml
<activity
    android:name=".MainActivity"
    android:theme="@style/SplashTheme"
    ...>
```

### MainActivity.kt

Override `onCreate` to switch back to `AppTheme` before React loads:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme)
    super.onCreate(savedInstanceState)
}
```

---

## File Changes Summary

| File | Action |
|---|---|
| `ios/ReinSplytUiMobile/Images.xcassets/SplashLogo.imageset/Contents.json` | Create |
| `ios/ReinSplytUiMobile/Images.xcassets/SplashLogo.imageset/splyt-app-icon-no-bg-white.png` | Copy |
| `ios/ReinSplytUiMobile/LaunchScreen.storyboard` | Edit |
| `scripts/generate_splash.py` | Create |
| `android/app/src/main/res/drawable/splash.png` | Generated |
| `android/app/src/main/res/drawable/splash_bg.xml` | Create |
| `android/app/src/main/res/values/styles.xml` | Edit |
| `android/app/src/main/AndroidManifest.xml` | Edit |
| `android/app/src/main/java/com/reinsplytuimobile/MainActivity.kt` | Edit |

---

## Out of Scope

- Animated splash transitions
- Dark mode variant
- Tablet-specific sizing
