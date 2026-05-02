export function Procedural360Tour() {
  return (
    <>
      <p>
        The <strong>360° tour</strong> section on our landing has three scenes. Earth orbit,
        with two satellites and a halo'd avatar floating nearby. Mars surface, with a rover
        looping overhead and two crew avatars chatting. Deep space, with three planets,
        cosmic dust, and 4,000 stars. The visitor drags to look around, clicks hotspots to
        navigate between scenes, and on a Quest 3 / Vision Pro / ARCore phone there's an
        Enter VR button.
      </p>

      <p>
        The tour ships with <strong>zero asset bytes</strong>. No equirectangular panoramas,
        no glTF models, no texture maps, no audio. Every star, planet, satellite, orbit
        ring, and avatar is generated at runtime from primitives in our{' '}
        <code>tekivex-3d</code> package. This post is the playbook for how.
      </p>

      <h2>Why we avoided photo-based panoramas</h2>

      <p>
        The original Tour360 used three Wikipedia equirectangular images — a beach cove, a
        forest path, a desert horizon. They looked great when they loaded. Sometimes they
        didn't load, and then the visitor saw a black sphere with a "To forest →" hotspot
        floating in the void. CDN cache misses, hotlink protection, regional CDN failures —
        photos are fragile when you don't host them.
      </p>

      <p>
        We rewrote the tour to use only what the package can generate locally. Three scenes,
        composed from a fixed set of primitives:
      </p>

      <ul>
        <li><code>TkxStarfield</code> — N stars distributed on a sphere of radius R</li>
        <li><code>TkxParticleField</code> — drifting cosmic dust inside a 3D volume</li>
        <li><code>TkxPlanet</code> — textured sphere with optional rings + atmospheric glow</li>
        <li><code>TkxOrbitPath</code> — orbital ring with optional travelling body</li>
        <li><code>TkxAvatar3D</code> — procedural humanoid with idle / talk / cheer states</li>
        <li><code>TkxHotspot</code> — clickable label anchored to a 3D point</li>
        <li><code>TkxOrbitControls</code> + <code>TkxXRSession</code> — camera + VR/AR entry</li>
      </ul>

      <p>None of those need an asset file. Let's go through the interesting ones.</p>

      <h2>TkxStarfield: 4,000 points on a sphere</h2>

      <p>
        Drawing 4,000 individually-positioned stars at 60 FPS sounds expensive but is trivial
        on the GPU. We allocate three flat <code>Float32Array</code> buffers for positions,
        colours, and sizes, populate them once, hand them to a <code>THREE.Points</code> with
        an additive-blended <code>PointsMaterial</code>, and the GPU draws everything in one
        batch.
      </p>

      <p>
        The interesting bit is distributing the points uniformly on a sphere. A naive
        approach — sample <code>theta</code> and <code>phi</code> uniformly from{' '}
        <code>[0, 2π]</code> and <code>[0, π]</code> — clusters points at the poles. The fix
        is the inverse-CDF trick:
      </p>

      <pre><code>{`const u = Math.random();
const v = Math.random();
const theta = 2 * Math.PI * u;
const phi = Math.acos(2 * v - 1);
const x = radius * Math.sin(phi) * Math.cos(theta);
const y = radius * Math.sin(phi) * Math.sin(theta);
const z = radius * Math.cos(phi);`}</code></pre>

      <p>
        That gives uniform distribution on the unit sphere. Multiply by a radius bigger than
        the camera's far plane and the stars sit "outside" everything else.
      </p>

      <p>
        Star colours come from a temperature-based palette: 60% blue-white, 30% yellow-white,
        10% red-giant. Each gets a brightness multiplier from <code>0.5</code> to <code>1.0</code>
        for visual variation. The whole field rotates very slowly (<code>0.005 rad/sec</code> by default)
        to give the camera a sense of depth without obvious motion.
      </p>

      <h2>TkxPlanet: procedural texture from a noise canvas</h2>

      <p>
        A planet is a <code>SphereGeometry</code> with a <code>MeshStandardMaterial</code>. The
        material takes a colour and an optional texture. We don't ship texture files, so the
        component generates one in a 2D canvas at component-mount time:
      </p>

      <pre><code>{`function makeProceduralTexture(seed: number) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;

  // Pick a hue family from the seed so each planet looks distinct
  const hueBase = (seed * 137) % 360;

  // Dark base
  ctx.fillStyle = \`hsl(\${hueBase}, 40%, 18%)\`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 40 random "continent" splotches
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const r = 12 + Math.random() * 60;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, \`hsla(\${hueBase + Math.random() * 50 - 25}, 55%, 50%, 0.85)\`);
    grad.addColorStop(1, \`hsla(\${hueBase + Math.random() * 50 - 25}, 55%, 50%, 0)\`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}`}</code></pre>

      <p>
        The seed is derived from the planet's 3D position, so two planets with different
        coordinates get visually distinct surfaces, but a planet that re-mounts at the same
        position looks the same. Forty soft-edged radial gradients on a hue-base background is
        enough to read as "an alien planet" from camera distance — and at three megapixels per
        canvas (~3 MB of GPU memory per planet) it's cheap.
      </p>

      <p>
        The atmospheric glow is a second sphere at <code>radius × 1.06</code>, rendered with
        <code>BackSide</code>, additive blending, and 18% opacity. From the camera's
        perspective that's the rim of the planet's atmosphere lit by the system's star.
      </p>

      <h2>TkxOrbitPath: the line + a small body that traces it</h2>

      <p>
        An orbit ring is 128 points along a circle in the XZ plane, drawn with{' '}
        <code>THREE.Line</code> + <code>LineBasicMaterial</code>. A small sphere — the
        satellite, moon, or rover — is positioned each frame at{' '}
        <code>(cos(θ) × radius, 0, sin(θ) × radius)</code> with θ increasing at the
        configured angular velocity. An additive-blended trail sphere at 1.6× radius and 25%
        opacity gives the body a subtle glow.
      </p>

      <p>
        The interesting prop is <code>inclination</code> — the orbit can be tilted out of the
        XZ plane by rotating the parent group around its X axis. With a few orbits at
        different inclinations around the same planet, you get a ringed look that feels
        plausibly Saturn-y.
      </p>

      <h2>TkxAvatar3D: a humanoid from primitives</h2>

      <p>
        The "crew avatars" are the boldest piece of the procedural pipeline. Each avatar is a
        small group of meshes — a head sphere, two eye spheres, two animated eyelids, a
        flattened jaw mesh, a body capsule, and two arms with capsule sleeves and sphere
        hands. Three animation states:
      </p>

      <ul>
        <li>
          <strong>idle</strong> — gentle 0.4 Hz body bob, periodic 0.16-second eyelid blinks
          (next blink interval randomized in [2, 6] seconds)
        </li>
        <li>
          <strong>talk</strong> — jaw drops at ~3 Hz, slight head bob (looks like a person
          speaking)
        </li>
        <li>
          <strong>cheer</strong> — arms go up, ~1.5 Hz vertical bounce; no blinks during cheer
        </li>
      </ul>

      <p>
        The avatar is roughly 3 KB of TypeScript. The traditional alternative — an
        80-KB FBX with DRACO compression and texture fetches — buys you a more polished look
        but adds an asset pipeline, a CDN dependency, license attribution, and a
        first-paint cost. For "friendly figure on the page," primitives win.
      </p>

      <h2>What ties it together</h2>

      <p>
        The Tour360 component is one switch on a <code>scene</code> string. Each branch
        composes the primitives differently:
      </p>

      <pre><code>{`function SceneContent({ id, onJump }) {
  if (id === 'earth-orbit') return <>
    <TkxStarfield count={3500} radius={120} spinSpeed={0.005} />
    <TkxParticleField count={800} volume={[40, 20, 40]} />
    <TkxPlanet position={[0, -1.5, -3]} radius={1.6} tint="#7ec8e3" glow />
    <TkxOrbitPath center={[0, -1.5, -3]} radius={2.6} bodyColor="#c4a8ff" speed={0.4} />
    <TkxOrbitPath center={[0, -1.5, -3]} radius={3.4} bodyColor="#00f5d4" speed={0.25} inclination={-0.25} />
    <TkxAvatar3D position={[2.4, 0.5, -1]} state="idle" halo />
    <TkxHotspot position={[-1.8, 1.8, -2]} label="Mars surface →" onClick={() => onJump('mars-surface')} />
    <TkxHotspot position={[2.4,  1.8, -1]} label="Deep space →"  onClick={() => onJump('deep-space')} />
  </>;
  // … mars-surface and deep-space scenes …
}`}</code></pre>

      <p>
        Eighty lines of composition for the whole tour. The visitor drags to look, clicks
        hotspots to navigate, and the scene switches in place — no route change, no fade,
        just the React tree updating. Auto-orbit camera at 0.5 rad/sec gives a slow drift so
        even a static visitor sees motion.
      </p>

      <h2>What we'd add</h2>

      <p>
        A <code>TkxNebulae</code> primitive — soft, large-radius particle clouds with
        wavelength-dependent colour gradients — would give the deep-space scene more visual
        depth without affecting performance. We sketched the shader; it's on the roadmap.
      </p>

      <p>
        A <code>TkxStation</code> — a procedural geometric "space station" composed of cubes
        and cylinders — would add a credible "destination" to the Mars surface scene without
        shipping a glTF.
      </p>

      <p>
        Both will land in <code>tekivex-3d</code> v0.8.
      </p>
    </>
  );
}
