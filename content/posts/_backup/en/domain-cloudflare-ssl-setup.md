---
title: "Domain Purchase & Cloudflare Free SSL Setup: Securing Speed and Security"
slug: "domain-cloudflare-ssl-setup-en"
excerpt: "Complete guide to purchasing a domain from Namecheap and setting up Cloudflare free CDN and SSL. From DNS propagation to A record configuration, get WordPress-ready in 20 minutes."
status: "publish"
categories:
  - "Domain"
  - "Security"
  - "CDN"
tags:
  - "Domain Purchase"
  - "Cloudflare"
  - "Free SSL"
  - "CDN"
  - "DNS Setup"
  - "Namecheap"
language: "en"
---

> **🌐 Translation**: Translated from [Korean](/ko/domain-cloudflare-ssl-setup).

# Domain Purchase & Cloudflare Free SSL Setup

> This post is part 3 of the "Premium WordPress Blog Complete Setup Guide" series.
>
> **Series Structure**:
> 1. [Blog Starting Guide - Goal Setting & Tech Stack](#)
> 2. [Vultr VPS Complete Guide](#) ← Previous
> 3. **[Current]** Domain + Cloudflare Setup
> 4. WordPress + Avada Theme Complete Setup (Next)

## Get Domain + CDN + SSL in 20 Minutes

In [Part 2](#), we created a Vultr VPS in Seoul region and completed basic security setup. Now we'll set up a **domain** for blog access, **Cloudflare CDN** for worldwide fast speed, and **HTTPS encryption** required by Google.

### Why Set Up Domain Before WordPress Installation?

1. **Save DNS Propagation Time**: DNS propagation takes 1-24 hours globally. Pre-setup enables immediate use during WordPress installation
2. **SSL Certificate Preparation**: Get SSL certificate from Cloudflare in advance for instant HTTPS application
3. **Cloudflare CDN**: Fast speed from 300+ global data centers from the start

**What You'll Learn**:
- ✅ Domain registrar comparison and why Namecheap
- ✅ Domain purchase in 4 steps ($10.98/year)
- ✅ Cloudflare free CDN + DDoS + SSL setup
- ✅ DNS nameserver change and propagation check
- ✅ DNS A record to connect VPS

**Estimated Time**: 20 minutes (+ 1-2 hours DNS propagation wait)

---

## 1. Domain Registrar Comparison - Why Namecheap?

A domain is your blog's address. Choosing the right registrar is important.

### Major Domain Registrar Comparison

| Feature | Namecheap | GoDaddy | Cloudflare Registrar |
|---------|-----------|---------|---------------------|
| **.com First Year** | $10.98 | $15-20 | $8-9 (at cost) |
| **Renewal Price** | $12.98 | $20-25 | $8-9 |
| **WHOIS Privacy** | ✅ Free | ❌ $10/year extra | ✅ Free |
| **Korean Support** | ❌ English only | ✅ Korean | ❌ English only |
| **UI** | Intuitive | Complex (heavy upselling) | Simple |
| **New Registration** | ✅ Available | ✅ Available | ❌ Transfer only |
| **Payment** | Card, PayPal | Card, PayPal | Card required |

### 4 Reasons to Choose Namecheap

#### 1. Competitive Pricing

**First Year Cost**:
- Namecheap: **$10.98**
- GoDaddy: $15-20 (40-50% more expensive)
- Cloudflare: $8-9 (cheapest but no new registrations)

**Renewal Cost**:
- Namecheap: **$12.98/year**
- GoDaddy: $20-25/year (almost 2x!)
- Cloudflare: $8-9/year

**Conclusion**: Namecheap is slightly more expensive than Cloudflare but **allows new domain registration**, making it perfect for your first blog.

#### 2. Free WHOIS Privacy

**What is WHOIS?**
When registering a domain, your personal information (name, email, phone, address) is registered in a public database. WHOIS privacy hides this information.

**Why WHOIS Privacy Matters**:
- **Spam Prevention**: Block email and phone spam
- **Domain Scam Prevention**: Block scam emails before domain expiration
- **Privacy Protection**: Hide name and address

**Cost Comparison**:
- Namecheap: **Free** ✅
- GoDaddy: **$10/year extra** ❌
- Cloudflare: Free

#### 3. Intuitive UI

**Namecheap**:
- Beginners can purchase domain within 5 minutes
- Minimal unnecessary upselling (email, hosting, SSL, etc.)
- Simple DNS configuration

**GoDaddy's Problems**:
- Aggressive upselling (dozens of options at checkout)
- Complex dashboard
- High renewal prices

#### 4. Easy Cloudflare Integration

Integrating a Namecheap domain with Cloudflare is very simple:
- Nameserver change: **2 minutes**
- Automatic DNS record import
- Instant CDN + SSL activation

### Cloudflare Registrar Limitations

Cloudflare has offered domain registration since 2018, but:
- ❌ **No new domain registration** (transfer from other registrars only)
- ❌ Credit card required (no PayPal)
- ❌ 60-day lock period (cannot transfer again for 60 days)

**Conclusion**: For your first blog, purchase from Namecheap → transfer to Cloudflare later (optional)

---

## 2. Purchasing Domain from Namecheap (4 Steps)

### Step 1: Domain Search

1. Go to https://namecheap.com
2. Enter desired domain in search bar
   - Example: `myblog.com`
3. Check search results:
   - ✅ **Available**: Ready to purchase
   - ❌ **Taken**: In use (check alternative suggestions)

#### Good Domain Selection Tips

**DO (Recommended)**:
- ✅ **.com priority**: Best for SEO, trust, international recognition
- ✅ **Shorter is better**: Under 10 characters recommended
- ✅ **Easy to remember**: Easy to pronounce words
- ✅ **Brandable**: Unique and memorable name

**DON'T (Avoid)**:
- ❌ Numbers: `myblog123.com`
- ❌ Hyphens: `my-blog.com`
- ❌ Korean domains: `내블로그.com` (limited international scalability)
- ❌ Too long: `myawesomepersonalblog.com`

---

### Step 2: Add to Cart and Select Options

When you add a domain to cart, you'll see an **additional options** screen.

#### Required Options (Must Enable)

- ✅ **WhoisGuard (WHOIS Privacy)**: Free, must enable ✅
- ✅ **Auto-Renew**: Enable (prevent domain expiration)

#### Unnecessary Options (All Decline)

- ❌ **PremiumDNS** ($4.88/year): Will use Cloudflare free DNS
- ❌ **Email Hosting** ($9.88/year): Gmail free is sufficient
- ❌ **SSL Certificate** ($8.88/year): Will use Cloudflare free SSL
- ❌ **Domain Privacy** ($0 - already included in WhoisGuard)

#### Registration Period

| Period | Cost | Recommended |
|--------|------|------------|
| **1 year** | $10.98 | ✅ Recommended (flexibility) |
| 2 years | $23.96 (renewal price) | Okay |
| 5 years | $64.90 | If long-term commitment |

**Recommendation**: **1-year registration** then extend as needed. Start blogging first and decide later.

---

### Step 3: Create Account and Payment

1. **Create Namecheap Account**
   - Enter email address and password
   - Verify email (check inbox)

2. **Enter Payment Information**
   - Select credit card or PayPal
   - Enter billing address (Korean OK, English recommended)

3. **Complete Order**
   - Click "Confirm Order"
   - Receive order confirmation email

**Total Cost**: **$10.98** (first year .com domain)

---

### Step 4: Verify Domain

1. Namecheap dashboard → **Domain List**
2. Check purchased domain status: **"Active"** ✅
3. Verify WHOIS privacy: **"Enabled"** ✅

### Checkpoint

Verify you've completed:
- [ ] Domain purchased (e.g., myblog.com)
- [ ] WHOIS privacy enabled
- [ ] Auto-renewal configured

---

## 3. Create Cloudflare Account and Connect Domain (5 Steps)

### What is Cloudflare?

**Cloudflare** is a CDN and security service operating 300+ data centers worldwide.

#### Free Plan Included Services

- **CDN (Content Delivery Network)**: Fast content delivery to global users
- **DDoS Protection**: Unlimited DDoS attack defense
- **SSL/TLS Encryption**: Free SSL certificate
- **DNS Management**: Ultra-fast DNS (1.1.1.1)
- **Web Application Firewall (WAF)**: Basic firewall

#### Paid Plans (Reference)

- **Pro**: $20/month (advanced WAF, image optimization)
- **Business**: $200/month (priority support, advanced DDoS)

**Conclusion**: **Free plan is sufficient!** My blog [beomanro.com](https://beomanro.com) uses the Free plan and handles 5,000 monthly visitors without issues.

---

### Step 1: Create Cloudflare Account

1. Go to https://cloudflare.com
2. Click **"Sign Up"** in top right
3. Enter email address and password
4. Complete email verification

---

### Step 2: Add Site

1. Click **"Add a Site"** button on dashboard
2. Enter domain (e.g., `myblog.com`)
3. Click **"Add Site"**

---

### Step 3: Select Plan

1. Select **Free** plan ($0/month) ✅
2. Click **"Continue"**

---

### Step 4: DNS Record Scan

Cloudflare automatically scans existing DNS records.
- First domain so no records (normal)
- Click **"Continue"**

---

### Step 5: Verify Nameservers

Cloudflare displays **2 nameservers**:

```
abcd.ns.cloudflare.com
efgh.ns.cloudflare.com
```

(Actual nameservers differ per account)

**Important**: **Copy these 2 nameservers!** You'll need to enter them in Namecheap in the next section.

### Checkpoint

Verify you've completed:
- [ ] Cloudflare account created
- [ ] Domain added (e.g., myblog.com)
- [ ] Free plan selected
- [ ] 2 nameservers copied

---

## 4. Change Nameservers and Verify DNS Propagation

### Step 1: Change Nameservers in Namecheap

1. Namecheap dashboard → **Domain List**
2. Click **"Manage"** button next to domain
3. Find **"Nameservers"** section
4. Select **"Custom DNS"** from dropdown
5. Enter 2 Cloudflare nameservers:
   ```
   Nameserver 1: abcd.ns.cloudflare.com
   Nameserver 2: efgh.ns.cloudflare.com
   ```
6. Click ✅ checkmark (save)

---

### Step 2: Wait for DNS Propagation

After nameserver change, **DNS propagation** takes time:
- **Fast**: 5-10 minutes
- **Average**: 1-2 hours
- **Maximum**: 24 hours (very rare)

#### How to Verify DNS Propagation

**Method 1: dig command (Mac/Linux)**

```bash
dig myblog.com NS

# Example output:
# ;; ANSWER SECTION:
# myblog.com.  3600  IN  NS  abcd.ns.cloudflare.com.
# myblog.com.  3600  IN  NS  efgh.ns.cloudflare.com.
```

**Method 2: nslookup command (Windows)**

```bash
nslookup -type=NS myblog.com

# Verify Cloudflare nameservers in output
```

**Method 3: Online Tools**

- Go to https://dnschecker.org
- Enter domain → Select **NS** record → **Check**
- Verify Cloudflare nameservers from DNS servers worldwide

---

### Step 3: Verify in Cloudflare

1. Cloudflare dashboard → **Overview**
2. Check **Status**:
   - ⏳ **Pending Nameserver Update**: Waiting for DNS propagation
   - ✅ **Active**: Complete! Cloudflare is activated

**Cloudflare sends email when DNS propagation completes.**

### Checkpoint

Verify you've completed:
- [ ] Nameservers changed in Namecheap
- [ ] DNS propagation verified (dig or dnschecker.org)
- [ ] Cloudflare status **"Active"**

---

## 5. SSL/TLS Mode Configuration and DNS A Record

### SSL/TLS Mode Configuration

HTTPS encryption is essential for Google SEO and increases user trust.

#### 4 Cloudflare SSL Modes

1. **Off**: No encryption (never use!) ❌
2. **Flexible**: User ↔ Cloudflare only encrypted (not recommended) ⚠️
3. **Full**: Two-way encryption, allows self-signed certificates
4. **Full (strict)**: Two-way encryption, requires valid certificate ✅ **Recommended**

#### Configure Full (strict) Mode

1. Cloudflare dashboard → **SSL/TLS**
2. **Overview** → **Encryption mode**
3. Select **"Full (strict)"** ✅

⚠️ **Note**: It's okay if VPS doesn't have SSL certificate yet!
- In the next post (Post 4), we'll generate **Cloudflare Origin Certificate** and install it on VPS
- Just select the mode for now

---

### DNS A Record Configuration (Connect VPS IP)

Now the **most important step** - connecting domain to VPS.

#### Step 1: Verify VPS IP Address

1. Vultr dashboard → Select server
2. Copy **IP Address** (e.g., `123.456.78.90`)

#### Step 2: Add Cloudflare A Record

1. Cloudflare → **DNS** → **Records**
2. Click **"Add record"** button
3. Configure as follows:
   - **Type**: A
   - **Name**: @ (root domain, `myblog.com`)
   - **IPv4 address**: Enter VPS IP address
   - **Proxy status**: ☁️ **Proxied** (orange cloud) ✅
   - **TTL**: Auto
4. Click **"Save"**

#### Step 3: Add www Subdomain (Optional)

Add CNAME record so `www.myblog.com` also works:

1. Click **"Add record"** again
2. Configure as follows:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: @ (or `myblog.com`)
   - **Proxy status**: ☁️ **Proxied**
3. Click **"Save"**

---

### Proxied vs DNS Only

When adding DNS A record, you must choose **Proxy status**:

#### ☁️ Proxied (Recommended) ✅

- Cloudflare CDN enabled
- DDoS protection enabled
- Hide actual VPS IP (enhanced security)
- SSL/TLS applied
- Content delivered from 300+ servers worldwide

#### 🔗 DNS Only

- Cloudflare CDN disabled
- Actual VPS IP exposed
- Direct connection (slightly slower without CDN)

**Conclusion**: Always use **Proxied** mode! ☁️

---

### Verify DNS A Record Propagation

```bash
# Verify VPS IP
dig myblog.com A

# Example output:
# ;; ANSWER SECTION:
# myblog.com.  300  IN  A  104.21.xxx.xxx
# (Shows Cloudflare IP since in Proxied mode)

# Test actual connection
ping myblog.com
# Success if responds with Cloudflare IP!
```

### Checkpoint

Verify you've completed:
- [ ] SSL/TLS mode set to **"Full (strict)"**
- [ ] DNS A record added (@ → VPS IP)
- [ ] Proxy status **"Proxied"** (☁️ orange cloud)
- [ ] www CNAME record added (optional)
- [ ] A record propagation verified with dig

---

## Conclusion: What We've Accomplished

Congratulations! 🎉 You've perfectly configured domain + CDN + SSL in 20 minutes.

### Completed Tasks

- ✅ **Purchased domain from Namecheap** ($10.98/year)
- ✅ **Enabled WHOIS privacy** (personal information protection)
- ✅ **Configured Cloudflare free CDN + DDoS protection**
- ✅ **Set SSL/TLS mode to "Full (strict)"**
- ✅ **Connected VPS with DNS A record**

### Domain Ready!

All preparations for WordPress installation are complete. While DNS propagation completes (1-2 hours), take a break or read the next post in advance.

---

## Next Step: WordPress + Avada Theme Complete Setup

**What You'll Learn in Part 4 (Final)**:
- **WordOps One-Liner Installation**: WordPress automation tool (EasyEngine successor)
- **WordPress Site Creation**: `wo site create myblog.com --wp --redis`
- **Redis Caching Explained**: FastCGI vs Object Cache difference (10x speed!)
- **Cloudflare Origin Certificate**: Generate 15-year SSL certificate and configure Nginx
- **Avada Theme Installation**: ThemeForest #1, includes Fusion Builder ($60, lifetime license)
- **Performance Optimization**: Achieve PageSpeed score 90+
- **beomanro.com Configuration Sharing**: All settings from actually running blog

### Proceed After DNS Propagation Completes

Pre-checks before next task:
- [ ] DNS propagation complete (wait 1-2 hours)
- [ ] Cloudflare status **"Active"** verified
- [ ] VPS SSH access available: `ssh root@VPS_IP`
- [ ] `ping myblog.com` responds

Proceed to Part 4 immediately after DNS propagation completes!

---

### Cost Summary (Through Series Part 3)

| Item | Cost | Period | After Promotion |
|------|------|--------|----------------|
| **Vultr VPS** | $6/month | Lifetime | **$0** (First 4 years, $300 credit) |
| **Domain (Namecheap)** | $10.98 | First year | No discount |
| **Cloudflare** | $0 | Lifetime | Free |
| **Total Cost So Far** | **$10.98** | - | - |

**Next Part Additional Cost**: Avada theme $60 (one-time, lifetime license)
**Final Total Cost**: $70.98

---

**If This Post Helped You**:
- ⭐ Add to bookmarks
- 📧 Subscribe to email newsletter (notification for final part)
- 💬 Leave questions in comments (respond within 24 hours)

**View Entire Series**:
1. [Blog Starting Guide - Goal Setting & Tech Stack Selection](#)
2. [Vultr VPS Complete Guide](#)
3. **[Current]** Domain + Cloudflare Setup ← Complete
4. WordPress + Avada Theme Complete Setup (Next, Final)
