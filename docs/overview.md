# System Overview: Admin Console & Referral Templates

This document outlines the architecture and components of the unified design system for the LayOps/Designfitout platform. The system is comprised of two core parts: a private Admin Console for internal management and public-facing Referral Templates for client interaction.

---

## 1. Unified Admin Console

The Admin Console serves as the central hub for managing all operational data. It is designed to be a dashboard-style interface that is both modular and responsive.

### Features

*   **Single View, Modular Interface**:
    *   The UI is built around a system of cards, where each data block (e.g., enquiry intake, supplier status, client progress, cost summary) is contained within its own closable card.
    *   This allows the user to customize their view by collapsing irrelevant information.
    *   A persistent typing/search bar is available at the bottom of the screen for quick access.
*   **Live Data Synchronization**:
    *   The console will feature live data synchronization to pull in updates from various sources, including WhatsApp messages, PDFs, RFQs, and images.
*   **Split Frame for Responsive Views**:
    *   The system will render different "shells" based on the device.
    *   **Desktop/Tablet View**: A full dashboard experience, providing a comprehensive overview of all data.
    *   **Mobile View**: A streamlined, single-column view of the same session, optimized for smaller screens.
*   **Weekly Capsule Reports**:
    *   An automated reporting feature that compiles a "Weekly Capsule Report."
    *   This report will provide a summary of supplier performance, the enquiry funnel, and a list of "next actions."
    *   The report will be export-ready.

---

## 2. Referral Templates (Client-Facing)

These are a set of styled, client-facing templates designed for different stages of the customer journey. Each template pipes data into the same backend.

### Template Types

*   **Type 1: Visual Proposal CTA**
    *   A card-based template featuring a prominent BIM/3D image.
    *   Includes a clear Call-to-Action (CTA) button, such as "Request Layout," "Request Lighting," or "Request Joinery."
*   **Type 2: Smart Quote Capsule**
    *   A compact UI component (available in dark and light themes) that displays a cost summary and the current status of an enquiry.
    *   Designed to be easily shareable and embeddable.
*   **Type 3: Discover Mode**
    *   An exploratory interface that allows clients to browse design references.
    *   This mode will link to the FitOutLab marketplace to drive discovery and engagement.

---

## 3. System Architecture and Goals

The primary goals of this unified design system are:

*   **For Admins**: To provide a powerful, centralized tool for control and live updates on all project-related activities.
*   **For Clients/Referrals**: To offer a clean, branded, and intuitive experience through a variety of targeted templates.
*   **For the Business**: To ensure that all interactions and data points lead back to a structured and efficient pipeline within LayOps.

**Backend Integration:** All data from the Admin Console and Referral Templates will be piped into a unified backend consisting of Firestore for real-time data and GitHub Issues for structured task management.