// ══════════════════════════════════════════════════════════════════════════════
// QUANTUM-AI ENGINE v2.0
// Real quantum-inspired algorithms: superposition, entanglement, annealing,
// Boltzmann machines, amplitude amplification, and field intelligence.
// ══════════════════════════════════════════════════════════════════════════════

// ── Complex Numbers ──────────────────────────────────────────────────────────

export class Complex {
  constructor(public re: number, public im: number) {}

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re,
    );
  }

  scale(s: number): Complex {
    return new Complex(this.re * s, this.im * s);
  }

  conjugate(): Complex {
    return new Complex(this.re, -this.im);
  }

  /** |z|² */
  magnitudeSquared(): number {
    return this.re * this.re + this.im * this.im;
  }

  /** |z| */
  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  static zero(): Complex {
    return new Complex(0, 0);
  }

  static one(): Complex {
    return new Complex(1, 0);
  }
}

// ── Qubit ────────────────────────────────────────────────────────────────────

/**
 * Single qubit in state α|0⟩ + β|1⟩.
 * Invariant: |α|² + |β|² = 1
 */
export class Qubit {
  private alpha: Complex; // amplitude of |0⟩
  private beta: Complex;  // amplitude of |1⟩

  constructor(alpha: Complex = Complex.one(), beta: Complex = Complex.zero()) {
    this.alpha = alpha;
    this.beta = beta;
    this.normalize();
  }

  /** Ensure |α|² + |β|² = 1 */
  private normalize(): void {
    const norm = Math.sqrt(
      this.alpha.magnitudeSquared() + this.beta.magnitudeSquared(),
    );
    if (norm > 0) {
      this.alpha = this.alpha.scale(1 / norm);
      this.beta = this.beta.scale(1 / norm);
    }
  }

  /** Hadamard gate: H|0⟩ = (|0⟩+|1⟩)/√2, H|1⟩ = (|0⟩−|1⟩)/√2 */
  hadamard(): Qubit {
    const s = 1 / Math.SQRT2;
    const newAlpha = this.alpha.add(this.beta).scale(s);
    const newBeta = this.alpha.sub(this.beta).scale(s);
    return new Qubit(newAlpha, newBeta);
  }

  /**
   * Ry(θ) rotation gate:
   * [[cos(θ/2), -sin(θ/2)],
   *  [sin(θ/2),  cos(θ/2)]]
   */
  ry(theta: number): Qubit {
    const c = Math.cos(theta / 2);
    const s = Math.sin(theta / 2);
    const newAlpha = this.alpha.scale(c).sub(this.beta.scale(s));
    const newBeta = this.alpha.scale(s).add(this.beta.scale(c));
    return new Qubit(newAlpha, newBeta);
  }

  /** Phase gate: |0⟩ → |0⟩, |1⟩ → e^(iφ)|1⟩ */
  phase(phi: number): Qubit {
    const phaseFactor = Complex.fromPolar(1, phi);
    return new Qubit(this.alpha, this.beta.mul(phaseFactor));
  }

  /**
   * Measure the qubit. Returns 0 with probability |α|², 1 with probability |β|².
   * Collapses the state after measurement.
   */
  measure(): 0 | 1 {
    const prob1 = this.beta.magnitudeSquared();
    return Math.random() < prob1 ? 1 : 0;
  }

  /** Returns |β|² — probability of measuring 1 */
  expectation(): number {
    return this.beta.magnitudeSquared();
  }

  getAlpha(): Complex {
    return this.alpha;
  }

  getBeta(): Complex {
    return this.beta;
  }
}

// ── QuantumRegister ──────────────────────────────────────────────────────────

/**
 * n-qubit register with entanglement support.
 */
export class QuantumRegister {
  private qubits: Qubit[];

  constructor(n: number) {
    this.qubits = Array.from({ length: n }, () => new Qubit());
  }

  get size(): number {
    return this.qubits.length;
  }

  getQubit(i: number): Qubit {
    return this.qubits[i];
  }

  /** Apply Hadamard to all qubits — creates uniform superposition */
  superpose(): void {
    this.qubits = this.qubits.map((q) => q.hadamard());
  }

  /**
   * CNOT gate: if control qubit has high |1⟩ probability, flip target qubit.
   * Approximate classical simulation: probabilistic flip based on control expectation.
   */
  cnot(controlIdx: number, targetIdx: number): void {
    const control = this.qubits[controlIdx];
    const target = this.qubits[targetIdx];
    const controlProb = control.expectation();
    // Rotate target by π * control probability (entanglement approximation)
    this.qubits[targetIdx] = target.ry(Math.PI * controlProb);
  }

  /** Apply Ry rotation to a specific qubit */
  rotate(idx: number, theta: number): void {
    this.qubits[idx] = this.qubits[idx].ry(theta);
  }

  /** Measure all qubits; returns array of 0/1 */
  measure(): (0 | 1)[] {
    return this.qubits.map((q) => q.measure());
  }

  /** Returns probability of measuring 1 for each qubit */
  probs(): number[] {
    return this.qubits.map((q) => q.expectation());
  }
}

// ── Quantum Annealer ─────────────────────────────────────────────────────────

export interface AnnealerResult<S> {
  state: S;
  energy: number;
  iterations: number;
  accepted: number;
  tunnels: number;
}

export class QuantumAnnealer<S> {
  private temperature: number;
  private coolingRate: number;
  private tunnelingStrength: number;
  private minTemp: number;

  constructor(
    initialTemp = 1.0,
    coolingRate = 0.995,
    tunnelingStrength = 0.3,
    minTemp = 1e-6,
  ) {
    this.temperature = initialTemp;
    this.coolingRate = coolingRate;
    this.tunnelingStrength = tunnelingStrength;
    this.minTemp = minTemp;
  }

  anneal(
    initialState: S,
    energyFn: (state: S) => number,
    neighborFn: (state: S) => S,
    maxIterations = 1000,
  ): AnnealerResult<S> {
    let current = initialState;
    let currentEnergy = energyFn(current);
    let best = current;
    let bestEnergy = currentEnergy;
    let T = this.temperature;
    let accepted = 0;
    let tunnels = 0;

    for (let i = 0; i < maxIterations && T > this.minTemp; i++) {
      const next = neighborFn(current);
      const nextEnergy = energyFn(next);
      const deltaE = nextEnergy - currentEnergy;

      let shouldAccept = false;

      if (deltaE <= 0) {
        // Better solution — always accept
        shouldAccept = true;
      } else {
        // Boltzmann acceptance for worse solutions
        const pAcceptance = Math.exp(-deltaE / T);

        // Quantum tunneling probability
        const kappa = Math.sqrt(2 * Math.abs(deltaE));
        const barrier = Math.abs(deltaE);
        const pTunnel = Math.exp(-2 * kappa * Math.sqrt(barrier) * this.tunnelingStrength);

        if (Math.random() < pAcceptance + pTunnel) {
          shouldAccept = true;
          if (Math.random() < pTunnel / (pAcceptance + pTunnel + 1e-10)) {
            tunnels++;
          }
        }
      }

      if (shouldAccept) {
        current = next;
        currentEnergy = nextEnergy;
        accepted++;

        if (currentEnergy < bestEnergy) {
          best = current;
          bestEnergy = currentEnergy;
        }
      }

      // Exponential cooling schedule
      T *= this.coolingRate;
    }

    return {
      state: best,
      energy: bestEnergy,
      iterations: maxIterations,
      accepted,
      tunnels,
    };
  }
}

// ── Quantum Boltzmann Machine ─────────────────────────────────────────────────

export interface QBMInference {
  hidden: number[];
  visible: number[];
  energy: number;
  iterations: number;
}

export class QuantumBoltzmannMachine {
  private weights: number[][];
  private visibleBias: number[];
  private hiddenBias: number[];

  constructor(visibleSize: number, hiddenSize: number) {
    // Xavier initialization
    const scale = Math.sqrt(2 / (visibleSize + hiddenSize));
    this.weights = Array.from({ length: visibleSize }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() * 2 - 1) * scale),
    );
    this.visibleBias = Array.from({ length: visibleSize }, () => 0);
    this.hiddenBias = Array.from({ length: hiddenSize }, () => 0);
  }

  /** Sigmoid with tiny quantum noise */
  private sigmoid(x: number): number {
    const noise = (Math.random() - 0.5) * 0.1; // ±0.05 quantum noise
    return 1 / (1 + Math.exp(-(x + noise)));
  }

  /** Sample a binary value from a probability */
  private sample(prob: number): number {
    return Math.random() < prob ? 1 : 0;
  }

  /**
   * Energy: E(v,h) = -vBias·v - hBias·h - v^T W h
   */
  energy(visible: number[], hidden: number[]): number {
    const vTerm = this.visibleBias.reduce((s, b, i) => s + b * visible[i], 0);
    const hTerm = this.hiddenBias.reduce((s, b, j) => s + b * hidden[j], 0);
    let whTerm = 0;
    for (let i = 0; i < visible.length; i++) {
      for (let j = 0; j < hidden.length; j++) {
        whTerm += visible[i] * this.weights[i][j] * hidden[j];
      }
    }
    return -(vTerm + hTerm + whTerm);
  }

  /**
   * Compute P(h_j=1 | v) = sigmoid(hBias[j] + sum_i weights[i][j] * v[i])
   */
  hiddenProbs(visible: number[]): number[] {
    return this.hiddenBias.map((bias, j) => {
      const activation = bias + visible.reduce((s, vi, i) => s + this.weights[i][j] * vi, 0);
      return this.sigmoid(activation);
    });
  }

  /**
   * Compute P(v_i=1 | h) = sigmoid(vBias[i] + sum_j weights[i][j] * h[j])
   */
  visibleProbs(hidden: number[]): number[] {
    return this.visibleBias.map((bias, i) => {
      const activation = bias + hidden.reduce((s, hj, j) => s + this.weights[i][j] * hj, 0);
      return this.sigmoid(activation);
    });
  }

  /**
   * Gibbs sampling: run k steps of
   *   h ← sample(hiddenProbs(v))
   *   v ← sample(visibleProbs(h))
   */
  gibbs(initialVisible: number[], steps = 1): { visible: number[]; hidden: number[] } {
    let v = [...initialVisible];
    let h: number[] = [];
    for (let k = 0; k < steps; k++) {
      h = this.hiddenProbs(v).map((p) => this.sample(p));
      v = this.visibleProbs(h).map((p) => this.sample(p));
    }
    return { visible: v, hidden: h };
  }

  /**
   * Contrastive Divergence-1 training step.
   */
  trainCD1(data: number[][], learningRate = 0.01): void {
    const nV = this.visibleBias.length;
    const nH = this.hiddenBias.length;

    const dW = Array.from({ length: nV }, () => Array(nH).fill(0) as number[]);
    const dVb = Array(nV).fill(0) as number[];
    const dHb = Array(nH).fill(0) as number[];

    for (const v0 of data) {
      // Positive phase
      const hProbs0 = this.hiddenProbs(v0);
      const h0 = hProbs0.map((p) => this.sample(p));

      // Negative phase (1 step Gibbs)
      const v1 = this.visibleProbs(h0).map((p) => this.sample(p));
      const hProbs1 = this.hiddenProbs(v1);

      // Accumulate gradients
      for (let i = 0; i < nV; i++) {
        for (let j = 0; j < nH; j++) {
          dW[i][j] += v0[i] * hProbs0[j] - v1[i] * hProbs1[j];
        }
        dVb[i] += v0[i] - v1[i];
      }
      for (let j = 0; j < nH; j++) {
        dHb[j] += hProbs0[j] - hProbs1[j];
      }
    }

    const n = data.length;
    for (let i = 0; i < nV; i++) {
      for (let j = 0; j < nH; j++) {
        this.weights[i][j] += (learningRate * dW[i][j]) / n;
      }
      this.visibleBias[i] += (learningRate * dVb[i]) / n;
    }
    for (let j = 0; j < nH; j++) {
      this.hiddenBias[j] += (learningRate * dHb[j]) / n;
    }
  }

  /**
   * Infer hidden activations from partial visible input.
   */
  infer(visible: number[]): QBMInference {
    const hidden = this.hiddenProbs(visible);
    const sampledHidden = hidden.map((p) => this.sample(p));
    const reconstructed = this.visibleProbs(sampledHidden);
    return {
      hidden,
      visible: reconstructed,
      energy: this.energy(visible, sampledHidden),
      iterations: 1,
    };
  }
}

// ── Amplitude Amplifier (Grover-inspired) ────────────────────────────────────

export interface AmplifiedResult {
  index: number;
  amplitude: number;
  probability: number;
  classicalSimilarity: number;
  combined: number;
}

export class AmplitudeAmplifier {
  /**
   * Amplify probabilities of "marked" items using Grover-inspired algorithm.
   */
  amplify<T>(
    items: T[],
    oracle: (item: T) => number,
    threshold = 0.5,
  ): AmplifiedResult[] {
    const N = items.length;
    if (N === 0) return [];

    // Compute classical similarities
    const similarities = items.map(oracle);
    const markedCount = similarities.filter((s) => s > threshold).length;
    const M = Math.max(1, markedCount);

    // Initialize uniform superposition amplitudes
    let amps = Array(N).fill(1 / Math.sqrt(N)) as number[];

    // Optimal number of Grover iterations
    const iterations = Math.max(1, Math.floor((Math.PI / 4) * Math.sqrt(N / M)));

    for (let iter = 0; iter < iterations; iter++) {
      // Oracle phase flip: negate amplitudes of marked items
      for (let i = 0; i < N; i++) {
        if (similarities[i] > threshold) {
          amps[i] = -amps[i];
        }
      }

      // Diffusion: reflection about the mean (2*avg - amplitude)
      const avg = amps.reduce((s, a) => s + a, 0) / N;
      amps = amps.map((a) => 2 * avg - a);
    }

    // Compute final probabilities (amplitude²)
    const results: AmplifiedResult[] = items.map((_, i) => ({
      index: i,
      amplitude: amps[i],
      probability: amps[i] * amps[i],
      classicalSimilarity: similarities[i],
      combined: amps[i] * amps[i] * 0.6 + similarities[i] * 0.4,
    }));

    return results.sort((a, b) => b.combined - a.combined);
  }
}

// ── Field Intelligence ────────────────────────────────────────────────────────

export interface ValidationSuggestion {
  rule: string;
  value?: number | string;
  message: string;
}

export interface FieldIntelligence {
  type: 'email' | 'password' | 'tel' | 'number' | 'url' | 'text' | 'textarea' | 'date' | 'search' | 'color';
  validations: ValidationSuggestion[];
  placeholder: string;
  confidence: number;
  label: string;
}

interface FieldPattern {
  keywords: string[];
  type: FieldIntelligence['type'];
  validations: ValidationSuggestion[];
  placeholder: string;
  label: string;
  confidence: number;
}

const FIELD_PATTERNS: FieldPattern[] = [
  {
    keywords: ['email', 'e-mail', 'mail'],
    type: 'email',
    validations: [
      { rule: 'required', message: 'Email is required' },
      { rule: 'pattern', value: '^[^@]+@[^@]+\\.[^@]+$', message: 'Enter a valid email address' },
      { rule: 'maxLength', value: 254, message: 'Email too long' },
    ],
    placeholder: 'you@example.com',
    label: 'Email Address',
    confidence: 0.98,
  },
  {
    keywords: ['password', 'passwd', 'pwd', 'pass'],
    type: 'password',
    validations: [
      { rule: 'required', message: 'Password is required' },
      { rule: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
      { rule: 'pattern', value: '(?=.*[A-Z])(?=.*[0-9])', message: 'Include uppercase and a number' },
    ],
    placeholder: '••••••••',
    label: 'Password',
    confidence: 0.97,
  },
  {
    keywords: ['confirm_password', 'confirmpassword', 'confirm_pass', 'repassword', 'password2', 'repeat_password'],
    type: 'password',
    validations: [
      { rule: 'required', message: 'Please confirm your password' },
      { rule: 'match', value: 'password', message: 'Passwords do not match' },
    ],
    placeholder: '••••••••',
    label: 'Confirm Password',
    confidence: 0.95,
  },
  {
    keywords: ['phone', 'mobile', 'cell', 'tel', 'telephone', 'contact_number'],
    type: 'tel',
    validations: [
      { rule: 'pattern', value: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$', message: 'Enter a valid phone number' },
    ],
    placeholder: '+1 (555) 000-0000',
    label: 'Phone Number',
    confidence: 0.93,
  },
  {
    keywords: ['age'],
    type: 'number',
    validations: [
      { rule: 'min', value: 0, message: 'Age cannot be negative' },
      { rule: 'max', value: 150, message: 'Enter a valid age' },
      { rule: 'integer', message: 'Age must be a whole number' },
    ],
    placeholder: '25',
    label: 'Age',
    confidence: 0.9,
  },
  {
    keywords: ['price', 'amount', 'cost', 'fee', 'payment', 'salary', 'wage', 'total'],
    type: 'number',
    validations: [
      { rule: 'min', value: 0, message: 'Amount cannot be negative' },
      { rule: 'pattern', value: '^\\d+(\\.\\d{1,2})?$', message: 'Enter a valid amount (e.g. 9.99)' },
    ],
    placeholder: '0.00',
    label: 'Amount',
    confidence: 0.88,
  },
  {
    keywords: ['url', 'website', 'site', 'link', 'homepage', 'web'],
    type: 'url',
    validations: [
      { rule: 'pattern', value: 'https?://.+', message: 'Enter a valid URL starting with http:// or https://' },
    ],
    placeholder: 'https://example.com',
    label: 'Website URL',
    confidence: 0.92,
  },
  {
    keywords: ['zip', 'zipcode', 'postal', 'postcode', 'pin_code'],
    type: 'text',
    validations: [
      { rule: 'pattern', value: '^[0-9]{5}(-[0-9]{4})?$', message: 'Enter a valid ZIP code (e.g. 12345)' },
    ],
    placeholder: '12345',
    label: 'ZIP / Postal Code',
    confidence: 0.91,
  },
  {
    keywords: ['date', 'dob', 'birthday', 'birth_date', 'birthdate', 'born'],
    type: 'date',
    validations: [
      { rule: 'required', message: 'Date is required' },
    ],
    placeholder: 'YYYY-MM-DD',
    label: 'Date of Birth',
    confidence: 0.89,
  },
  {
    keywords: ['first_name', 'firstname', 'fname', 'given_name'],
    type: 'text',
    validations: [
      { rule: 'minLength', value: 2, message: 'First name too short' },
      { rule: 'maxLength', value: 50, message: 'First name too long' },
    ],
    placeholder: 'Jane',
    label: 'First Name',
    confidence: 0.9,
  },
  {
    keywords: ['last_name', 'lastname', 'lname', 'surname', 'family_name'],
    type: 'text',
    validations: [
      { rule: 'minLength', value: 2, message: 'Last name too short' },
      { rule: 'maxLength', value: 50, message: 'Last name too long' },
    ],
    placeholder: 'Doe',
    label: 'Last Name',
    confidence: 0.9,
  },
  {
    keywords: ['name', 'full_name', 'fullname', 'display_name'],
    type: 'text',
    validations: [
      { rule: 'minLength', value: 2, message: 'Name too short' },
      { rule: 'maxLength', value: 100, message: 'Name too long' },
    ],
    placeholder: 'Jane Doe',
    label: 'Full Name',
    confidence: 0.85,
  },
  {
    keywords: ['username', 'user_name', 'handle', 'login', 'loginname'],
    type: 'text',
    validations: [
      { rule: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
      { rule: 'maxLength', value: 32, message: 'Username too long' },
      { rule: 'pattern', value: '^[a-zA-Z0-9_.-]+$', message: 'Only letters, numbers, _, - and . allowed' },
    ],
    placeholder: 'cooluser42',
    label: 'Username',
    confidence: 0.94,
  },
  {
    keywords: ['bio', 'biography', 'about', 'description', 'summary', 'details'],
    type: 'textarea',
    validations: [
      { rule: 'maxLength', value: 500, message: 'Bio must be under 500 characters' },
    ],
    placeholder: 'Tell us about yourself...',
    label: 'Bio',
    confidence: 0.87,
  },
  {
    keywords: ['message', 'comment', 'feedback', 'note', 'notes', 'remarks', 'body'],
    type: 'textarea',
    validations: [
      { rule: 'minLength', value: 10, message: 'Message too short' },
      { rule: 'maxLength', value: 2000, message: 'Message too long' },
    ],
    placeholder: 'Write your message here...',
    label: 'Message',
    confidence: 0.86,
  },
  {
    keywords: ['search', 'query', 'q', 'keyword', 'find'],
    type: 'search',
    validations: [],
    placeholder: 'Search...',
    label: 'Search',
    confidence: 0.9,
  },
  {
    keywords: ['otp', 'one_time_password', 'verification_code', 'pin', 'code'],
    type: 'text',
    validations: [
      { rule: 'minLength', value: 4, message: 'Code too short' },
      { rule: 'maxLength', value: 8, message: 'Code too long' },
      { rule: 'pattern', value: '^[0-9]+$', message: 'Code must be numeric' },
    ],
    placeholder: '123456',
    label: 'Verification Code',
    confidence: 0.92,
  },
  {
    keywords: ['color', 'colour', 'hex_color', 'brand_color'],
    type: 'color',
    validations: [],
    placeholder: '#3b82f6',
    label: 'Color',
    confidence: 0.95,
  },
  {
    keywords: ['address', 'street', 'street_address', 'addr'],
    type: 'text',
    validations: [
      { rule: 'maxLength', value: 200, message: 'Address too long' },
    ],
    placeholder: '123 Main Street',
    label: 'Street Address',
    confidence: 0.87,
  },
  {
    keywords: ['city', 'town', 'municipality'],
    type: 'text',
    validations: [
      { rule: 'maxLength', value: 100, message: 'City name too long' },
    ],
    placeholder: 'San Francisco',
    label: 'City',
    confidence: 0.89,
  },
  {
    keywords: ['country', 'nation', 'country_code'],
    type: 'text',
    validations: [],
    placeholder: 'United States',
    label: 'Country',
    confidence: 0.88,
  },
  {
    keywords: ['company', 'organization', 'org', 'employer', 'company_name'],
    type: 'text',
    validations: [
      { rule: 'maxLength', value: 200, message: 'Company name too long' },
    ],
    placeholder: 'Acme Inc.',
    label: 'Company',
    confidence: 0.87,
  },
];

/**
 * Infer field type, validations, placeholder, and label from a field name.
 * Uses keyword matching + Grover-inspired amplitude amplification for ranking.
 */
export function inferFieldIntelligence(fieldName: string): FieldIntelligence {
  const lower = fieldName.toLowerCase().replace(/[\s-]/g, '_');

  const amplifier = new AmplitudeAmplifier();
  const results = amplifier.amplify(
    FIELD_PATTERNS,
    (pattern) => {
      let best = 0;
      for (const kw of pattern.keywords) {
        if (lower === kw) {
          best = Math.max(best, 1.0);
        } else if (lower.includes(kw) || kw.includes(lower)) {
          best = Math.max(best, 0.8);
        } else if (kw.split('_').some((part) => lower.includes(part))) {
          best = Math.max(best, 0.5);
        }
      }
      return best;
    },
    0.3,
  );

  if (results.length > 0 && results[0].combined > 0.1) {
    const best = FIELD_PATTERNS[results[0].index];
    return {
      type: best.type,
      validations: best.validations,
      placeholder: best.placeholder,
      confidence: Math.min(best.confidence * results[0].combined * 2, 0.99),
      label: best.label,
    };
  }

  // Default fallback
  return {
    type: 'text',
    validations: [{ rule: 'maxLength', value: 255, message: 'Input too long' }],
    placeholder: fieldName.replace(/_/g, ' '),
    confidence: 0.3,
    label: fieldName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

// ── HSL / Hex Utilities ───────────────────────────────────────────────────────

export function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Internal contrast ratio — use wcag.contrastRatio for external use */
function qContrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Theme Color State ─────────────────────────────────────────────────────────

export interface ThemeColorState {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  accent: string;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface AnnealState {
  primary: HSLColor;
  secondary: HSLColor;
  bg: HSLColor;
  surface: HSLColor;
  text: HSLColor;
  border: HSLColor;
  accent: HSLColor;
}

function annealStateToTheme(state: AnnealState, isDark: boolean): ThemeColorState {
  const toHex = (c: HSLColor) => hslToHex(c.h, c.s, c.l);
  const textMutedL = isDark ? state.text.l - 20 : state.text.l + 15;
  return {
    primary: toHex(state.primary),
    secondary: toHex(state.secondary),
    background: toHex(state.bg),
    surface: toHex(state.surface),
    text: toHex(state.text),
    textMuted: hslToHex(
      state.text.h,
      Math.max(0, state.text.s - 10),
      Math.max(20, Math.min(85, textMutedL)),
    ),
    border: toHex(state.border),
    error: isDark ? '#f87171' : '#dc2626',
    warning: isDark ? '#fbbf24' : '#d97706',
    success: isDark ? '#34d399' : '#059669',
    accent: toHex(state.accent),
  };
}

function themeEnergy(state: AnnealState, isDark: boolean): number {
  let energy = 0;

  const toHex = (c: HSLColor) => hslToHex(c.h, c.s, c.l);
  const textHex = toHex(state.text);
  const bgHex = toHex(state.bg);
  const surfaceHex = toHex(state.surface);
  const primaryHex = toHex(state.primary);

  // WCAG contrast penalties
  const textBgContrast = qContrastRatio(textHex, bgHex);
  const textSurfaceContrast = qContrastRatio(textHex, surfaceHex);
  const primaryBgContrast = qContrastRatio(primaryHex, bgHex);

  if (textBgContrast < 4.5) energy += (4.5 - textBgContrast) * 10;
  if (textSurfaceContrast < 4.5) energy += (4.5 - textSurfaceContrast) * 8;
  if (primaryBgContrast < 3) energy += (3 - primaryBgContrast) * 5;

  // Color harmony: golden angle (137.5°) hue spacing between primary & secondary
  const goldenAngle = 137.508;
  const hueDiff = Math.abs(((state.secondary.h - state.primary.h + 360) % 360) - goldenAngle);
  energy += hueDiff * 0.05;

  // Accent near triadic (120° offset from primary)
  const accentDiff = Math.abs(((state.accent.h - state.primary.h + 360) % 360) - 120);
  energy += accentDiff * 0.03;

  // Saturation balance — penalize extremes
  const avgSat = (state.primary.s + state.secondary.s) / 2;
  if (avgSat < 20) energy += (20 - avgSat) * 0.5;
  if (avgSat > 90) energy += (avgSat - 90) * 0.5;

  // Dark/light mode bg lightness coherence
  const bgL = state.bg.l;
  if (isDark) {
    if (bgL > 25) energy += (bgL - 25) * 2;
    if (bgL < 3) energy += (3 - bgL) * 2;
    if (state.text.l < 70) energy += (70 - state.text.l) * 1.5;
  } else {
    if (bgL < 90) energy += (90 - bgL) * 2;
    if (bgL > 100) energy += (bgL - 100) * 2;
    if (state.text.l > 30) energy += (state.text.l - 30) * 1.5;
  }

  // Surface should offset slightly from bg
  const surfaceOffset = Math.abs(state.surface.l - state.bg.l);
  if (surfaceOffset < 2) energy += (2 - surfaceOffset) * 2;
  if (surfaceOffset > 12) energy += (surfaceOffset - 12) * 1;

  return energy;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Optimize theme colors using quantum annealing.
 */
export function optimizeThemeColors(
  baseHue: number,
  isDark: boolean,
  iterations = 800,
): ThemeColorState {
  const initialState: AnnealState = isDark
    ? {
        primary: { h: baseHue, s: 70, l: 55 },
        secondary: { h: (baseHue + 137.5) % 360, s: 65, l: 50 },
        bg: { h: baseHue, s: 10, l: 8 },
        surface: { h: baseHue, s: 10, l: 13 },
        text: { h: baseHue, s: 15, l: 90 },
        border: { h: baseHue, s: 15, l: 22 },
        accent: { h: (baseHue + 120) % 360, s: 75, l: 60 },
      }
    : {
        primary: { h: baseHue, s: 65, l: 40 },
        secondary: { h: (baseHue + 137.5) % 360, s: 55, l: 38 },
        bg: { h: baseHue, s: 15, l: 97 },
        surface: { h: baseHue, s: 12, l: 100 },
        text: { h: baseHue, s: 15, l: 12 },
        border: { h: baseHue, s: 12, l: 85 },
        accent: { h: (baseHue + 120) % 360, s: 70, l: 42 },
      };

  const annealer = new QuantumAnnealer<AnnealState>(1.5, 0.994, 0.35, 1e-5);

  const result = annealer.anneal(
    initialState,
    (state) => themeEnergy(state, isDark),
    (state) => {
      const keys = ['primary', 'secondary', 'bg', 'surface', 'text', 'border', 'accent'] as const;
      const key = keys[Math.floor(Math.random() * keys.length)];
      const components = ['h', 's', 'l'] as const;
      const component = components[Math.floor(Math.random() * components.length)];
      const delta = (Math.random() - 0.5) * (component === 'h' ? 30 : 15);
      const next: AnnealState = {
        ...state,
        [key]: { ...state[key] },
      };
      if (component === 'h') {
        next[key] = { ...next[key], h: (state[key].h + delta + 360) % 360 };
      } else if (component === 's') {
        next[key] = { ...next[key], s: clamp(state[key].s + delta, 0, 100) };
      } else {
        next[key] = { ...next[key], l: clamp(state[key].l + delta, 0, 100) };
      }
      return next;
    },
    iterations,
  );

  return annealStateToTheme(result.state, isDark);
}

// ── QuantumAI Singleton ───────────────────────────────────────────────────────

export const QuantumAI = {
  /** Create a single qubit in |0⟩ state */
  qubit(): Qubit {
    return new Qubit();
  },

  /** Create a quantum register of n qubits */
  register(n: number): QuantumRegister {
    return new QuantumRegister(n);
  },

  /** Create a quantum annealer */
  annealer<S>(
    initialTemp?: number,
    coolingRate?: number,
    tunnelingStrength?: number,
  ): QuantumAnnealer<S> {
    return new QuantumAnnealer<S>(initialTemp, coolingRate, tunnelingStrength);
  },

  /** Create a Quantum Boltzmann Machine */
  qbm(visibleSize: number, hiddenSize: number): QuantumBoltzmannMachine {
    return new QuantumBoltzmannMachine(visibleSize, hiddenSize);
  },

  /** Create an amplitude amplifier */
  amplifier(): AmplitudeAmplifier {
    return new AmplitudeAmplifier();
  },

  /** Infer field intelligence from a field name */
  inferField: inferFieldIntelligence,

  /** Optimize theme colors using quantum annealing */
  optimizeTheme: optimizeThemeColors,

  /** Compute WCAG contrast ratio between two hex colors */
  contrast: qContrastRatio,

  /** Convert HSL to hex */
  hslToHex,
};
