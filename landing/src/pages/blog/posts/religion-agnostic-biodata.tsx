export function ReligionAgnosticBiodata() {
  return (
    <>
      <p>
        Marriage biodatas across India and the wider South Asian diaspora share a remarkable
        amount of structure. Personal details, education, family background, contact info,
        about-me, expectations — the same shape repeats. What changes between communities is
        the <em>top of the document</em>: a sect-appropriate religious symbol, often a short
        blessing line, sometimes a family monogram instead of a generic glyph.
      </p>

      <p>
        We wanted our biodata template package to handle that automatically. Drop in a person's
        data, the template picks the right glyph from their religion field. But we also wanted
        an escape hatch — for sect-specific symbols, family logos, or scanned blessings the
        Unicode set doesn't capture, the user can upload their own image. Here's the design.
      </p>

      <h2>The data shape stays neutral</h2>

      <p>
        At the type level, <code>BiodataData</code> doesn't know about religions. Every
        culturally-loaded field is optional:
      </p>

      <pre><code>{`export interface BiodataData {
  fullName: string;
  // … personal, contact, family, etc. …

  religion?: string;
  religiousMark?: 'auto' | 'none'
                | 'om' | 'cross' | 'crescent'
                | 'khanda' | 'dharma' | 'lotus';
  customReligiousLogo?: string;  // URL or data: URI
  blessing?: string;
  caste?: string;
  subCaste?: string;
  manglik?: 'yes' | 'no' | 'partial';
  rashi?: string;
  nakshatra?: string;
  gotra?: string;
  // …
}`}</code></pre>

      <p>
        Setting <code>religion</code> doesn't lock you into a Hindu template. It just feeds a
        small glyph-derivation function that emits a Unicode character (or null). Astrological
        fields are similarly opt-in — Hindu and Jain biodatas typically include rashi,
        nakshatra, gotra, manglik; Muslim, Christian, Sikh, Buddhist biodatas usually leave
        them blank, and the templates render the cultural section conditionally.
      </p>

      <h2>The glyph map</h2>

      <p>
        The <code>symbolForReligion</code> function is twenty lines:
      </p>

      <pre><code>{`export function symbolForReligion(
  religion?: string,
  override?: ReligiousMarkOverride,
): { glyph: string; label: string } | null {
  if (override === 'none') return null;

  const explicit = {
    om:       { glyph: 'ॐ', label: 'Om' },
    cross:    { glyph: '✝', label: 'Christian cross' },
    crescent: { glyph: '☪', label: 'Crescent and star' },
    khanda:   { glyph: '☬', label: 'Khanda' },
    dharma:   { glyph: '☸', label: 'Dharmachakra' },
    lotus:    { glyph: '🪷', label: 'Lotus' },
  };
  if (override && override in explicit) return explicit[override];

  if (!religion) return null;
  const r = religion.toLowerCase();
  if (/hindu|sanatan/.test(r))                          return explicit.om;
  if (/christian|catholic|protestant|orthodox/.test(r)) return explicit.cross;
  if (/muslim|islam/.test(r))                           return explicit.crescent;
  if (/sikh/.test(r))                                   return explicit.khanda;
  if (/buddh/.test(r))                                  return explicit.dharma;
  if (/jain/.test(r))                                   return explicit.lotus;
  return null;
}`}</code></pre>

      <p>
        Six religions, six Unicode characters. The patterns are forgiving so common
        denominational variants — "Roman Catholic," "Eastern Orthodox," "Sanatani Hindu" —
        all resolve correctly without the user picking from a dropdown. If the religion
        string doesn't match any pattern, the function returns <code>null</code> and the
        biodata renders without a religious header. That's the default for civil /
        non-religious biodatas, and it's also the safe failure mode if we ever miss a religion.
      </p>

      <h2>Three resolution levels</h2>

      <p>The component that renders the symbol resolves in this order:</p>

      <ol>
        <li>
          <strong>Custom logo</strong> — if <code>customReligiousLogo</code> is set, render
          that image. Highest priority because it's the explicit override.
        </li>
        <li>
          <strong>Explicit override</strong> — if <code>religiousMark</code> is one of the
          enum values (<code>'om'</code>, <code>'cross'</code>, etc.), use that glyph. Lets
          consumers force a specific symbol without changing the religion field.
        </li>
        <li>
          <strong>Auto-derived from <code>religion</code></strong> — runs the regex map above.
          The default for most biodatas.
        </li>
        <li>
          <strong>Nothing</strong> — if none of the above produce a result, the header
          doesn't render at all. Templates lay out cleanly without it.
        </li>
      </ol>

      <h2>The image-upload escape hatch</h2>

      <p>
        Users with sect-specific symbols (Iyengar, Coptic cross, hand of Fatima, specific
        Khanda variants) and families with their own monograms or scanned blessings need
        something the Unicode set doesn't have. We added an upload control on the form, read
        the picked file via <code>FileReader</code>, and emit a <code>data:</code> URI as the
        <code>customReligiousLogo</code> field. The data URI inlines into the printed PDF
        without a server round-trip.
      </p>

      <pre><code>{`function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return setError('Pick an image file.');
  if (file.size > 4 * 1024 * 1024)     return setError('File is over 4 MB.');
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') onChange(reader.result);
  };
  reader.readAsDataURL(file);
}`}</code></pre>

      <p>
        Two defensive checks: reject anything that isn't an image MIME type (in case the
        OS picker is bypassed somehow), and reject files over 4 MB so we don't blow up the
        print payload. Both errors render via <code>role="alert"</code> so they're announced.
      </p>

      <h2>Why we shipped the blessing field separately</h2>

      <p>
        At first we were going to bake a default blessing into each glyph — "Shubh Vivah"
        under the Om, "Bismillah" under the crescent. We talked to people who use these
        documents and learned that the blessing line is more personal than the symbol. Some
        families always start with their patron deity's name, some with a Sanskrit invocation,
        some Christian families with "By His grace" or a Bible verse, some prefer no blessing
        at all.
      </p>

      <p>
        Splitting the symbol from the blessing means the family that wants ✝ + "By His grace"
        can have it, the family that wants ☪ + "Bismillah ar-Rahman ar-Raheem" can have it,
        and a civil biodata can have neither without us shipping religion-specific defaults
        that get out of sync.
      </p>

      <h2>What we got right</h2>

      <p>
        Type-level neutrality. The data shape doesn't know about religions, the renderer
        does — and the renderer is opt-in. A consumer can ship a biodata builder with no
        religious symbols at all just by not connecting the props.
      </p>

      <p>
        Forgiving regex maps. Users don't pick from a dropdown of religions; they type their
        religion in their own words. The mapping handles the common variants. When we miss
        one, fixing it is a single line of regex.
      </p>

      <p>
        An escape hatch the consumer's user controls, not the library author. The custom logo
        upload is on the form, not in our config. We don't have to predict every sect's
        preferred symbol — we just have to not block users from supplying their own.
      </p>

      <h2>What we'd do differently</h2>

      <p>
        We'd probably extract the glyph map into a separate package the next time around. It's
        useful well beyond biodatas — invitations, certificates, prayer cards. As of today it
        lives at <code>tekivex-biodata-templates/src/layouts/primitives.tsx</code>. If you
        need it, copy it. The code is twenty lines, MIT-licensed, and won't change much.
      </p>
    </>
  );
}
