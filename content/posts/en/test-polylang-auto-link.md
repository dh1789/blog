---
title: "Test Polylang Auto-Link: WordPress Avada Theme Setup Guide (English Version)"
slug: "test-polylang-wordpress-avada-setup"
excerpt: "This is a test post to verify Polylang automatic language linking functionality. Testing --link-to option with publish command."
status: "draft"
categories:
  - "WordPress"
  - "Testing"
tags:
  - "Polylang"
  - "WordPress"
  - "Multilingual"
language: "en"
---

> **🌐 Translation**: Translated from [Korean](/ko/wordpress-avada-theme-setup).

# Test Post: WordPress Avada Theme Setup (English)

This is a test post to verify the Polylang automatic language linking functionality.

## Testing --link-to Option

We are testing:
- ✅ Automatic bidirectional linking (Korean ↔ English)
- ✅ WordPress REST API meta field update
- ✅ Error handling and user feedback

## Expected Results

When this post is published with `--link-to 59` option:
1. This English post should be automatically linked to Korean post ID 59
2. Both posts should have language switcher buttons
3. Users can switch between Korean and English versions

## Test Information

- Korean Post ID: 59
- English Post: This post
- Link Method: `blog publish --link-to 59`
- Date: 2025-11-04
