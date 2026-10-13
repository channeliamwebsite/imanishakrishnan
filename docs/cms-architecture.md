# Admin CMS — audit and architecture

Status: phases 1–5 are implemented and tested locally against the Firebase emulators. Nothing is deployed. Going live needs the steps in §5, which change the production Firebase project.

## 1. Audit of the existing project

### Public site

| Section (order) | Component | Data source today |
|---|---|---|
| Navbar / Footer | `components/layout/Navbar.tsx`, `Footer.tsx` | `siteSettings/main` → **placeholder** (no Firestore doc) |
| Hero | `components/home/Hero.tsx` | `hero/main` — **Firestore (live)**, validated by `parseHero` |
| Impact statistics | `components/home/ImpactStats.tsx` | `statistics/*` — **Firestore (live)**, validated by `parseStatistic`; icons are local PNGs mapped by `icon` name |
| About + story timeline | `components/home/AboutSection.tsx`, `Timeline.tsx` | `about/main`, `timeline/*` → **placeholder** |
| Selected work | `components/home/WorkSection.tsx` | `work/*` → **placeholder** |
| In the Media | `components/home/MediaSection.tsx` | `mediaFeatures/*` → **placeholder** |
| Philosophy | `components/home/PhilosophySection.tsx` | `philosophy/main` → **placeholder** |
| Insights | `components/home/InsightsSection.tsx` | `insights/*` → **placeholder (empty)** |
| `/about` profile page | `app/about/page.tsx` | `about/main.profile` → **placeholder** `lib/content/profile.ts`; `timeline/*` |
| SEO metadata | `app/layout.tsx` | `siteSettings/main.seo` → **placeholder** |

All reads go through `lib/content/index.ts` (cached with `"use cache"`, tagged per collection), using the Firestore Lite SDK (`lib/firebase/firestore.ts`). When Firestore is empty or a read fails, the getter returns the placeholder from `lib/content/placeholder.ts`.

### Infrastructure that is reused

- **Types**: `types/content.ts` already models every section, including `SpeakingEvent`, `Testimonial`, `Achievement` and `SocialLink`.
- **Collections**: `lib/firebase/collections.ts` names one collection per section; singletons use the doc id `main`.
- **Validation**: `lib/content/normalize.ts` has `parseMedia`, `parseHero` and `parseStatistic`.
- **Caching**: getters are tagged with their collection name, which is ready for on-demand invalidation.
- **Cloudinary**:
  - `lib/cloudinary/server.ts` has `signUploadParams` (signed direct uploads, folder allow-list) and `toMediaAsset`.
  - `lib/cloudinary/folders.ts` is the folder allow-list.
  - `lib/cloudinary/loader.ts` is the global `next/image` loader.
  - `components/ui/Image.tsx` (`MediaImage`) renders any `MediaAsset`.
- **Firebase Auth**: `lib/firebase/auth.ts` exposes `getFirebaseAuth()`. It has never been used.
- **Seeding**: `scripts/seed-firestore.ts` (firebase-admin).

### Conflicts and gaps found

1. **Awards have two sources.**
   - The `achievements` collection (placeholder of 5 items) is not rendered anywhere.
   - The rendered awards are `about.profile.achievements` (12 items, `/about#awards`).
   - The homepage "12 AWARDS & HONOURS" statistic counts the latter.
   - Plan: `/admin/awards` edits `about.profile.achievements`, the data actually rendered. The `achievements` collection stays untouched, and removing it is a separate decision.
2. **List queries need composite indexes that don't exist.** `getPublishedList` uses `where(published) + orderBy(order)`, which would fail the moment a list collection got documents, and the site would silently fall back to placeholders. Plan: filter by `published == true` only, sort in code.
3. **Only hero and statistics are validated.** Every other Firestore document is passed to components unchecked, so a partial document could break rendering. Plan: validate every section before rendering; invalid documents fall back to the placeholder.
4. **Hardcoded copy outside content.**
   - `/about` labels and headings ("Profile", "Biography", "Key milestones", …) and its page metadata.
   - The Insights empty-state sentence.
   - Plan: move them into `about.profile` and `siteSettings.sections` (with today's text as defaults).
5. **`/insights/[slug]` is linked but has no route.** The Insights cards link there and would 404. Plan: add `/insights` and `/insights/[slug]` (published only).
6. **Events and testimonials aren't rendered.** `speaking/*` and `testimonials/*` are typed but have no public component. They will be manageable in the admin, but adding them to the public site is a design decision for later.
7. **Unresolved content questions.** "24 years" (statistic) vs "over 23 years" (bio), and the media outlet list. These are not changed by this work.
8. **Server credentials.** `firebase-admin` is a dev dependency and no service-account key is configured. The design avoids needing one at runtime (see §3).
9. **Firestore rules.** Every site collection is publicly readable, and nothing is writable.

## 2. Architecture

```
Admin browser (client)                      Next.js server                    Firebase / Cloudinary
─────────────────────                       ──────────────                    ─────────────────────
/admin/login  ── Firebase Auth (email+pw) ───────────────────────────────►  Auth
/admin/*      ── read/write drafts, publish ─────────────────────────────►  Firestore (rules: admins only)
              ── server action (ID token) ─► requireAdmin()
                                              ├ verify ID token (firebase-admin, project id only)
                                              ├ check admins/{uid} (Firestore REST with the user's token)
                                              ├ updateTag(collection) after publish
                                              └ sign Cloudinary upload / delete asset ─►  Cloudinary
              ── upload file with signature ──────────────────────────────►  Cloudinary
Public pages  ◄── cached getters (published collections only, validated, placeholder fallback)
```

### Authentication and roles
- Sign-in uses Firebase Auth with email and password. There is no registration page. Admin accounts are created in the Firebase console.
- **Admin role**:
  - A user is an admin only if `admins/{uid}` exists.
  - That document is created only by `scripts/grant-admin.ts` or in the Firebase console. Clients can never write it.
- **Enforcement happens on the server and in Firestore rules, not by hiding pages.**
  - Every draft, publish and media-library read and write is checked by the Firestore rules (`isAdmin()`).
  - Every server action re-verifies the Firebase ID token and the admin document.
  - The `/admin` pages contain no data or secrets. An unauthenticated visitor gets an empty shell and a login form.

### Draft vs published
- **Published content stays in the existing collections** (`hero/main`, `statistics/*`, …). The public read path doesn't change and no data migration is needed.
- **Drafts live in private, admin-only collections.**
  - `cmsDrafts/{sectionKey}` holds `{ data, updatedAt, updatedBy, publishedAt?, publishedBy? }`. For list sections, `data.items` is the full ordered list.
  - `insightDrafts/{id}` holds one blog article per document.
- **Publish**:
  - The draft is validated with the same validators the public site uses.
  - It is written to the published collection in one batch. For lists, items removed from the draft are deleted from the published collection.
  - A server action then runs `updateTag(collection)` so the public site refreshes immediately.
- **Editing a draft never touches the published collections.**
- **Preview**:
  - The admin renders the real public section components (they are synchronous, prop-driven and client-compatible) with the draft data.
  - No public page code is duplicated, and there are no preview cookies or tokens on the server.
  - They render inside a same-origin iframe (`/preview`) at a real device width (1280px desktop, 390px mobile), scaled to fit, so breakpoints match the live site.
  - The draft reaches the iframe by `postMessage` (same origin only) and is never stored.
- **First edit of a section**: the editor starts from the published Firestore document, otherwise from the current placeholder content (the live site). Nothing is invented.

### Validation
- The public site and the admin use one set of validators (`lib/content/normalize.ts`).
- Public pages drop invalid documents and fall back to the placeholder.
- The admin refuses to publish invalid drafts and shows the field errors.

### Media
- Direct signed uploads go to Cloudinary, using the existing `signUploadParams` and folder allow-list.
- New folders: `statistics`, `blog`, `logos`, `site`.
- Each upload is recorded in `mediaLibrary/{id}` (admin-only) with its url, publicId, size, format, folder and alt text.
- Image fields support upload, pick-from-library, replace, remove and alt text.
- Deleting from Cloudinary is a server action limited to the site's root folder.

### Blogs
- The published store is `insights/{id}` (existing type). It gains author, categories, tags, SEO, an HTML body and timestamps.
- The public routes are `/insights` and `/insights/[slug]`. Firestore rules expose only `published == true` documents.
- The rich-text body is stored as HTML and sanitised on the server before rendering.

### Firestore rules (summary)
```
admins/{uid}          read: own doc only        write: never (console / script)
cmsDrafts, insightDrafts, mediaLibrary          read/write: admins
insights/{id}         read: published == true or admin                       write: admins
other site collections  read: public             write: admins
```

## 3. Security considerations
- **No service account at runtime.**
  - ID tokens are verified with `firebase-admin` using only the public project id.
  - The admin check reads `admins/{uid}` through the Firestore REST API with the user's own token, under the rules.
- **Cloudinary API secret**: stays server-side (`lib/cloudinary/server.ts`, `server-only`). Uploads are signed per request after the admin check, and folders are allow-listed.
- **Server actions** are treated as public endpoints. Each one verifies the token and the admin role, and validates its inputs (tags against an allow-list, folders, public ids).
- **Indexing**: `/admin` is `noindex`.
- **Sanitising**: blog HTML is sanitised on render.
- **Rules testing**: the new rules are tested in the local emulator before deployment. Deploying them is a production change and needs explicit approval.

## 4. Implementation phases
1. **Admin foundation**
   - Route groups so `/admin` has its own layout (public URLs unchanged).
   - Login, auth context, admin shell and sidebar.
   - `requireAdmin` and server actions.
   - Firestore rules (emulator-tested) and `scripts/grant-admin.ts`.
2. **Content infrastructure**
   - Section registry, draft and publish service, validators for every section.
   - Index-free list reads.
   - Hardcoded copy moved into content.
3. **Section editors**: homepage/hero, statistics, about, timeline, work, awards, media, philosophy, insights copy, events, testimonials, settings (branding, navigation, footer, SEO, social links). Each has a preview.
4. **Media**: upload widget, media library, statistic icon uploads.
5. **Blogs**: editor (rich text, embedded images, SEO, status) and public routes.
6. **Go-live** (needs approval):
   - Deploy the Firestore rules.
   - Enable the Email/Password provider and create the admin user in the console.
   - Run `scripts/grant-admin.ts`.
   - Publish each section once from the admin.

Status:
- **Phases 1–5 are done.** Each phase was typechecked, linted and built.
- **Phase 6 has not been done.** It changes production and needs approval.

## 5. Go-live checklist (production — needs approval)

1. **Deploy the rules.** Run `firebase deploy --only firestore:rules`.
   - Drafts, the media library and the admin records become private.
   - Admin writes are allowed.
   - The public read access the site uses is unchanged.
2. **Enable the sign-in provider.** In the Firebase console, open Authentication → Sign-in method → Email/Password → Enable.
3. **Create the admin user.** In the Firebase console, open Authentication → Users → Add user.
4. **Grant the admin role.** Run `npm run admin:grant -- --email <address>`. The credentials are the same as for `seed:firestore`.
5. **Hosting environment.** On Vercel, set the same variables as `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_*`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

   No service account is needed. Never set the `*_EMULATOR_HOST` variables in production.
6. **Move content into the CMS.**
   - Open each section in `/admin` and publish it once. It starts from exactly the content the site shows today, so visitors see no change.
   - Hero and statistics are already in Firestore.

## 6. Testing

- `npm run typecheck`, `npm run lint` and `npm run build`.
- `npm run validate:content`: the built-in content passes the publish validation.
- `npm run test:rules`: firestore.rules in the emulator. There are 13 tests across visitors, signed-in non-admins and admins.
  - On this Windows machine the emulator needs `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=C:/Users/Public/Documents`. JDK 21 fails to open its internal pipe in the default temp folder there.
- **End-to-end (manual)**:
  - Start the Auth and Firestore emulators with a `demo-` project id.
  - Build and start with the emulator variables from `.env.example`.
  - Create users in the Auth emulator, then run `npm run admin:grant` with `FIRESTORE_EMULATOR_HOST` set.

## 7. Known limitations and open decisions

- **Events and testimonials** can be managed and published, but no public section renders them (design decision pending).
- **The `achievements` collection** is unused. Awards are edited in `about.profile.achievements`, which is what `/about` shows. The collection can be removed after confirmation.
- **Publishing** publishes the whole section. Section headings (Work, Media, Insights) belong to Site settings, so publishing one also publishes other saved setting changes. The editors warn about this.
- **Two people editing the same fields at the same time**: the last save wins. Pages that edit *different* parts of one section (About and Awards; Settings and the section headings) save only their own fields and don't overwrite each other.
- **Article dates** are display and sort dates. There is no scheduled publishing.
- **Images in the media library**:
  - Deleting one doesn't check whether a page still uses it. The confirmation says so.
  - Only assets under `nisha-krishnan/` can be deleted from the admin. The current hero portrait (`profile.jpg`, account root) is protected.
- **`/insights` reuses the homepage Insights layout**, which is a carousel on tablet and desktop. A dedicated archive layout would be a design decision.
- **Missing articles**: a non-existent article URL renders the 404 page with `noindex`. Because the page streams, the HTTP status is 200.
