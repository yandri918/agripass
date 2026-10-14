---
title: AgriPass AI: Helping Neighborhood Produce Sellers Turn WhatsApp Chaos into Profit with Open-Weight AI
published: true
tags: devchallenge, hf26challenge, hacktoberfest, gemma
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

---

## What I Built

### The Problem: The Invisible Bleed of Neighborhood Produce Kiosks

Every morning at 4:30 AM across Southeast Asia, hundreds of thousands of independent neighborhood produce sellers (*"pedagang kios sayur"* and wet market vendors) unload crates of freshly harvested leafy greens, chilies, and tubers. 

These micro-entrepreneurs are the backbone of local food security. Yet, their side hustle or family livelihood faces three silent profit killers every single day:

1. **The 15%–25% Shrinkage Blindspot (*Susut Timbangan & Sortasi*):** Fresh vegetables lose moisture rapidly or arrive with bruised outer leaves that must be trimmed before display. Sellers rarely calculate their true Cost of Goods Sold (COGS / *HPP aktual*) after sorting, meaning they unintentionally price their produce below true breakeven.
2. **The 6:00 AM WhatsApp Order Chaos:** Regular customers text informal, unstructured grocery requests like:
   > *"Bude, cabai 10rb, bayam seikat, tomat setengah kilo ya. Antar jam 7 pagi ke rumah."*  
   > *(“Auntie, 10k rupiah worth of chilies, one bunch of spinach, half a kilo of tomatoes please. Deliver at 7 AM.”)*  
   Sellers waste precious morning prep hours manually re-reading chat messages, guessing quantities, scribbling notes on cardboard scraps, and running out of stock before in-person walk-in shoppers arrive.
3. **No Batch Inventory Discipline:** Without FIFO (*First-In, First-Out*) tracking, yesterday's spinach wilts at the bottom of the bin while newly delivered batches sit on top, leading directly to rotten produce and landfill waste.

---

### The Solution: AgriPass AI

**AgriPass AI** is an intelligent, lightweight operating system and micro-SaaS designed specifically for grassroots fresh produce kiosks. It bridges physical morning intake at the crate to digital order fulfillment via WhatsApp and public QR passports:

```
[4:30 AM Farm Gate Intake]
        │
        ├── 1. AI Visual Produce Inspection (Freshness grading & tare sortage % estimation)
        ├── 2. True Landed Cost Calculator (Intake price + sorting loss + logistics)
        └── 3. FIFO Batch Inventory Ledger (Tracks age, salable stock, & physical reserve)
        │
[Public Produce Passport & Storefront]
        ├── 4. Instant QR Passport (Consumers scan baskets to see harvest origin & freshness)
        └── 5. AI WhatsApp Order Drafter (Extracts informal freeform chats into structured carts)
```

### Who Would Pay For It?

Neighborhood produce kiosk owners, market stall operators, and urban vegetable delivery collectives. 

* **The Micro-SaaS Business Model:** A lightweight subscription of **Rp 50,000 – Rp 150,000 (~$3.50 – $10.00 USD) per month**, or a modest pay-as-you-go micro-fee per automated order.
* **The Return on Investment (ROI):** For an average vegetable kiosk turning over $70–$150 USD per day, preventing just **3 kg of chilies or 10 bunches of greens from wilting per day saves $5.00 – $8.00 daily ($150 – $240/month)**. AgriPass AI pays for its monthly subscription in less than 48 hours of operation.

---

## Demo

* 🌐 **Live Production App:** [https://web-production-43e15.up.railway.app](https://web-production-43e15.up.railway.app)
* 🛒 **Live Public Storefront (*Toko Berkah Mandiri*):** [https://web-production-43e15.up.railway.app/toko/berkah-mandiri](https://web-production-43e15.up.railway.app/toko/berkah-mandiri)
* 🔐 **Seller Control Portal:** [https://web-production-43e15.up.railway.app/seller](https://web-production-43e15.up.railway.app/seller) *(Demo Seller PIN: `1234`)*
* 🏷️ **Live Batch QR Passport Example:** [https://web-production-43e15.up.railway.app/batch/batch-bayam-01](https://web-production-43e15.up.railway.app/batch/batch-bayam-01)
* 🌐 **Full Bilingual Experience:** Instant 1-click toggle between **Bahasa Indonesia (ID)** and **English (EN)** across all storefronts and management dashboards.

### Interactive Features to Try in the Demo:

1. **AI WhatsApp Order Drafter:** On the store page, click **"Salin Chat WA ke Keranjang"**, paste informal text such as:  
   `"pesan bayam seikat, cabai 10000, tomat 1 kg kirim pagi"`  
   Watch AgriPass AI extract items, calculate budget-to-weight conversions, check real-time stock, and draft a formatted order ready for 1-click WhatsApp checkout.
2. **AI Visual Produce Grading:** On the seller portal, simulate incoming produce intake or upload an image of leafy greens. The AI generates a freshness score (0–100%), visual defect audit (wilting, yellowing, soil weight), and recommended sorting tare.
3. **FIFO Stock Rotation & Wastage Ledger:** Inspect the real-time financial impact card showing total physical asset valuation vs. deadweight shrinkage loss in local currency.
4. **Strict Role Isolation:** Try accessing the seller management portal while acting as a consumer; the system restricts cross-role tampering and requires vendor PIN verification.

---

## Code

The complete source code is open-source and hosted on GitHub:

[![GitHub Repository](https://img.shields.io/badge/GitHub-yandri918%2Fagripass-181717?style=for-the-badge&logo=github)](https://github.com/yandri918/agripass)

👉 **Repository:** [https://github.com/yandri918/agripass](https://github.com/yandri918/agripass)

---

## How I Built It

AgriPass AI is architected with modern, battle-tested technologies designed for low latency, maximum responsiveness on mobile viewports, and edge-friendly inference:

### Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AgriPass AI Web App                     │
│               Next.js 16 (App Router) + Turbopack           │
│           Vanilla CSS Tokens + Tailwind Utility Classes      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        ┌──────▼──────┐                ┌──────▼──────┐
        │ Buyer Realm │                │ Seller Hub  │
        │ • Catalog   │                │ • FIFO Desk │
        │ • QR Passport               │ • PIN Auth  │
        │ • WA Drafter│                │ • Loss Audit│
        └──────┬──────┘                └──────┬──────┘
               │                              │
               └──────────────┬───────────────┘
                              │
               ┌──────────────▼───────────────┐
               │         AI Engine Hub        │
               │  lib/ai/service.ts + Zod     │
               ├──────────────────────────────┤
               │ Primary: Gemma 2 Open-Weight │
               │ Fallback: Deterministic Rule │
               │ Engine (100% Offline Capable)│
               └──────────────┬───────────────┘
                              │
               ┌──────────────▼───────────────┐
               │      Audited & Verified      │
               │    Semgrep SAST (0 findings) │
               │    Zero ReDoS / Safe Regex   │
               └──────────────────────────────┘
```

* **Frontend & Core Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, and React Context for real-time bilingual state (`id` / `en`).
* **Open-Source AI Core:**
  * **Open-Weight Gemma 2 (Google):** Powers the intent parsing, natural language customer Q&A, and structured produce inspection schemas.
  * **Strict Zod Contract Validation:** All AI outputs conform to explicit Zod schemas (`OrderDraftResponseSchema`, `ProductQaResponseSchema`, `VisualInspectionResponseSchema`), preventing hallucinations and bad data injections.
  * **Deterministic Edge Fallback Engine:** If internet access drops in dense market stalls, AgriPass automatically degrades to an offline-first, rule-based NLP extractor with localized regular expression normalization.
* **Security & Static Code Analysis:** Audited using **Semgrep SAST** across all 60 git-tracked files with 219 OWASP/Community security rules. Fixed all dynamic regex constructions to completely eliminate ReDoS (Regular Expression Denial of Service) risks.

---

## Why Does Open Innovation Matter?

Why did we choose an **open-weight, open-source AI architecture** instead of relying exclusively on proprietary closed commercial APIs like OpenAI or Claude?

For micro-retailers in emerging markets, open innovation isn't just an ideological preference—**it is the only way the business model can survive.**

### 1. Zero Marginal Per-Token Economics ($0 Inference Cost)
A neighborhood buyer purchasing Rp 5,000 ($0.32 USD) worth of spinach yields roughly Rp 800 ($0.05 USD) in gross profit for the vendor. If processing that customer's WhatsApp order via a closed commercial API costs $0.02 to $0.04 in multi-turn tokens, **50% to 80% of the vendor's profit margin vanishes into API bills.**

By using open-weight models like **Gemma 2**—which can be self-hosted, run on inexpensive VPS instances, or executed directly on local edge hardware—we decouple usage volume from per-token billing. Once deployed, the marginal cost per transaction is virtually **$0.00**.

### 2. Absolute Commercial Privacy & Financial Sovereignty
A vendor's purchase invoices, actual supplier identities, and true profit margins are trade secrets. Sellers rightfully hesitate to paste their morning invoices and customer phone numbers into closed third-party cloud trackers. With open-weight AI and open-source code:
* The store's private ledger stays within the store's chosen infrastructure.
* Wholesale acquisition costs (*harga kulakan*) never leak to public buyer interfaces or third-party training pipelines.

### 3. Local Agricultural Nuances & Colloquial Slang
Wet market vocabulary in Indonesia is heavily idiomatic:
* *"Cabai rawit petik"* (stem-free bird's eye chilies)
* *"Bayam cabut"* (pulled fresh spinach with root intact)
* *"Serba dua ribu"* (budget-denominated pricing)

Closed commercial models often over-standardize or struggle with Indonesian vernacular without verbose, expensive system prompts. Open-weight models give us the freedom to fine-tune, quantize, and tailor system weights specifically for regional agricultural trade.

### 4. 4:00 AM Offline Reliability
Traditional wet markets often have terrible cellular reception inside concrete stalls. A closed API fails when the internet drops. AgriPass AI's open dual-engine architecture guarantees that even if external connectivity goes down, the local fallback engine continues parsing orders and managing inventory without interruption.

---

## My Agent Session

This entire project was engineered collaboratively using an advanced AI pair programming agent session. 

From architectural planning and domain modeling (FIFO inventory ledgers, tare waste calculations, and Zod schema contracts) to implementing full bilingual support (Indonesian/English) and executing **Semgrep SAST** security scans, the agentic workflow enabled:
* Rapid generation and iterative refinement of production-ready TypeScript code.
* Real-time automated browser testing to verify buyer-seller role isolation and multi-language UI rendering.
* Immediate remediation of code-level security findings (sanitizing regex against ReDoS and aligning TSX JSX entities).

---

## My First User

To ground AgriPass AI in reality, we brought the working application directly to **Pak Joko**, a 46-year-old produce kiosk owner operating *Kios Sayur Berkah Mandiri* in a suburban residential neighborhood.

### What We Tested
1. **The Morning Intake Flow:** Recording 20 kg of incoming curly red chilies and 30 bunches of fresh water spinach (*kangkung*), including logging a 1.2 kg sorting loss (*sortasi daun busuk*).
2. **The WhatsApp Chat Drafter:** Pasting actual customer messages from Pak Joko's real WhatsApp chat history into the parser.
3. **Stock Reservation:** Seeing ordered items immediately moved from "Tersedia" (*Available*) to "Dicadangkan" (*Reserved*) on his mobile screen so he wouldn't accidentally sell them twice.

### What He Said
> *"Biasanya jam 5 pagi saya pusing baca chat tetangga sambil nimbang sayur. Kadang kehabisan cabai padahal orang sudah pesan lewat WA. Pakai ini enak, teks WA langsung jadi daftar belanjaan dan ketahuan stoknya cukup atau tidak."*  
> *(“Usually at 5 AM I get overwhelmed reading neighbors' texts while weighing veggies. Sometimes I run out of chilies even though someone already ordered them on WA. Using this is convenient—the WA text instantly turns into a grocery list and tells me if I have enough stock.”)*

### Did He Pay? Would He?
* **Current Status:** During the test run, Pak Joko used the prototype for free on his Android phone.
* **Willingness to Pay:** When asked if he would pay **Rp 50,000 to Rp 75,000 / month (~$3.50 – $5.00 USD)** for the tool, he affirmed:
  > *"Kalau bisa cetak struk kecil ke printer bluetooth dan ada rekap untung bersih harian seperti tadi, 50 ribu sebulan itu murah mas. Sayur layu saya sehari aja ruginya bisa lebih dari itu."*  
  > *(“If it can print small receipts to a bluetooth printer and give me that daily net profit summary, 50k a month is cheap. My wilted vegetables cost me more than that in a single day.”)*
* **What He Asked For Next:** 
  1. Voice note transcription (so he can talk while both hands are washing or trimming vegetables).
  2. Integration with low-cost Bluetooth thermal receipt printers.

---

## Prize Categories

### Primary Category: Best Use of Gemma
AgriPass AI leverages the lightweight, high-performance architecture of Google's **Gemma 2** open-weight family. Gemma's exceptional multilingual reasoning and compact footprint make it the perfect brain for edge-deployed produce catalog assistants and conversational order extractors in low-margin micro-retail environments.

---

## Conclusion & Future Roadmap

AgriPass AI proves that open-source AI and open-weight models don't need to be confined to high-tech enterprise niches. When applied to the most humble, everyday micro-businesses—like neighborhood vegetable stalls—open AI eliminates food waste, preserves family profit margins, and turns chaotic morning routines into thriving, automated digital side hustles.

We welcome feedback, issues, and contributions on [GitHub](https://github.com/yandri918/agripass)! 🥬🌱
