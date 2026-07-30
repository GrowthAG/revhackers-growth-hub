# Component Differences Analysis

This document details the analysis of various booking and lead modal components as requested.

## 1. BookingModal vs DiagnosticBookingModal
These components are **genuinely different** and serve distinct purposes:
- **`BookingModal`**: Despite its name, this component is not a visual modal. It acts either as a standalone button that navigates to `/booking` when clicked, or as a programmatic redirector (using `useEffect` and `useNavigate`) when its `isOpen` prop is set to true.
- **`DiagnosticBookingModal`**: This is a true visual modal built with `framer-motion` and `AnimatePresence`. When opened, it displays an overlay containing the `DiagnosticBookingEmbed` component to allow users to schedule directly on the page without redirecting.

**Conclusion**: Left as-is.

## 2. BookingWidget vs DiagnosticBookingEmbed
These components are **genuinely different**:
- **`BookingWidget`**: Renders a custom UI card containing a `ContactForm` component. It collects user data (name, email, company, role, etc.) and upon submission, redirects the user to the scheduling page (e.g., `/agenda-diagnostico`). It also loads a form embed script but doesn't render an iframe directly.
- **`DiagnosticBookingEmbed`**: Directly embeds a GoHighLevel (GHL) calendar iframe (`pages.revhackers.com.br/widget/booking/...`), allowing the user to pick a time slot immediately. 

**Conclusion**: Left as-is.

## 3. LeadCaptureModal vs LeadMagnetModal
These components have distinct logic and do not share >70% of their logic:
- **`LeadCaptureModal`**: Uses `shadcn/ui`'s `Dialog` component. It's focused on capturing leads for an "Auditoria de Funil B2B", sending the data via the `submitPublicDiagnostic` API, and then redirecting the user to `/agenda`.
- **`LeadMagnetModal`**: Uses a custom `div` overlay (no `shadcn` Dialog). It handles four distinct lead magnets (checklist, calculator, template, guide) with dynamic icons and benefits. Its form has different fields (e.g., employees challenge) and it simulates a success state ("MATERIAL ENVIADO") rather than redirecting to a booking page.

**Conclusion**: Left as-is.
