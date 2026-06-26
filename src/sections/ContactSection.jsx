import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Mail, Radio, Send, Zap } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useApp } from '../contexts/useApp';

const EMAILJS_SERVICE_ID = 'service_vw9ui3s';
const EMAILJS_TEMPLATE_ID = 'template_p3ajcmj';
const EMAILJS_PUBLIC_KEY = 'INfWhLrofE5R-fLTy';

const Github = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const CONTACTS = [
  {
    icon: Github,
    label: 'GITHUB ARRAY',
    value: 'inish2007',
    link: 'https://github.com/inish2007',
    color: '#00D4FF',
    desc: 'Source code repositories',
  },
  {
    icon: Linkedin,
    label: 'LINKEDIN NODE',
    value: 'k-inish-kumar',
    link: 'https://www.linkedin.com/in/k-inish-kumar/',
    color: '#5A189A',
    desc: 'Professional network connection',
  },
  {
    icon: Mail,
    label: 'COMM RELAY',
    value: 'inishk3@gmail.com',
    link: 'mailto:inishk3@gmail.com',
    color: '#FF4FD8',
    desc: 'Direct communication channel',
  },
];

function SignalPing({ color }) {
  return (
    <div className="relative h-4 w-4 flex-shrink-0">
      <div className="absolute inset-0 rounded-full opacity-30 animate-ping" style={{ background: color }} />
      <div className="absolute inset-1 rounded-full" style={{ background: color }} />
    </div>
  );
}

function CharCounter({ value, max }) {
  const pct = value / max;
  const color = pct > 0.9 ? '#FF4FD8' : pct > 0.7 ? '#fbbf24' : '#4ade80';
  return (
    <span className="font-hud text-[9px] tabular-nums" style={{ color }}>
      {value}/{max}
    </span>
  );
}

export default function ContactSection() {
  const { triggerNebula } = useApp();
  const ref = useRef(null);
  const formRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [txStatus, setTxStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_MESSAGE = 1000;
  const isLocked = txStatus === 'sending';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MAX_MESSAGE) return;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    // Validation checks
    const nameTrimmed = formState.name.trim();
    const emailTrimmed = formState.email.trim();
    const messageTrimmed = formState.message.trim();

    if (!nameTrimmed) {
      triggerNebula('Transmission corrupt: Captain name is required.');
      return;
    }
    if (!emailTrimmed) {
      triggerNebula('Transmission corrupt: Return relay address (email) is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      triggerNebula('Transmission corrupt: Invalid relay frequency format (invalid email).');
      return;
    }
    if (!messageTrimmed) {
      triggerNebula('Transmission corrupt: Communication data stream is empty.');
      return;
    }
    if (messageTrimmed.length < 10) {
      triggerNebula('Transmission corrupt: Stream payload too small (minimum 10 characters).');
      return;
    }

    setTxStatus('sending');
    setErrorMsg('');

    // Build template params manually so variable names are guaranteed correct
    const templateParams = {
      name: formState.name,
      email: formState.email,
      message: formState.message,
      title: 'Portfolio Contact from INISH OS',
      time: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setTxStatus('success');
    } catch (err) {
      console.error('EmailJS error:', err);
      setErrorMsg(err?.text || 'Transmission failed. Please try again or email directly.');
      setTxStatus('error');
    }
  };

  const handleReset = () => {
    setFormState({ name: '', email: '', message: '' });
    setTxStatus('idle');
    setErrorMsg('');
  };

  return (
    <section id="contact" ref={ref} className="section-shell">
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 80%, rgba(0,212,255,0.05) 0%, transparent 70%)' }}
      />

      <div className="section-inner flex w-full flex-col items-center">

        {/* ── Heading ── */}
        <motion.div
          className="mb-16 w-full text-center lg:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-4">COMM.HUB.CONNECT</p>
          <h2 className="section-header gradient-text">Communication Hub</h2>
          <p className="mt-3 font-ui text-base text-white/60">Establish contact with the command vessel.</p>
          <div className="section-sep mt-4" />
        </motion.div>

        {/* ── Nebula banner ── */}
        <motion.div
          className="mb-14 flex w-full max-w-2xl flex-col items-start gap-4 rounded-xl glass-card-purple p-5 sm:flex-row sm:items-center sm:gap-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="relative h-12 w-12 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border border-cyan-400/60 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle, #00D4FF, #5A189A)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-hud text-[9px] font-medium tracking-widest text-cyan-400">NEBULA TRANSMISSION</p>
            <p className="font-ui text-base italic text-white/85">
              "Communication channels established. Ready to receive."
            </p>
          </div>
          <Radio size={18} className="flex-shrink-0 text-cyan-400 animate-pulse" />
        </motion.div>

        {/* ── Two-column grid ── */}
        <div className="grid w-full items-start gap-10 lg:grid-cols-2 lg:gap-14">

          {/* ── Left: channels ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <p className="section-label mb-6 sm:mb-8">COMM CHANNELS</p>

            <div className="space-y-5">
              {CONTACTS.map((contact, index) => (
                <motion.a
                  key={contact.label}
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl glass-card p-5 transition-all duration-300 sm:items-center sm:gap-5 sm:p-6"
                  style={{ borderColor: 'rgba(0,212,255,0.15)' }}
                  whileHover={{ borderColor: `${contact.color}60`, boxShadow: `0 0 30px ${contact.color}20`, x: 6 }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${contact.color}15`, border: `1px solid ${contact.color}30` }}
                  >
                    <contact.icon size={22} style={{ color: contact.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <SignalPing color={contact.color} />
                      <span className="font-hud text-[9px] font-medium tracking-widest" style={{ color: contact.color }}>
                        {contact.label}
                      </span>
                    </div>
                    <p className="break-all font-ui text-base font-medium text-white transition-colors group-hover:text-cyan-300 sm:break-normal">
                      {contact.value}
                    </p>
                    <p className="mt-1 font-ui text-sm text-white/50">{contact.desc}</p>
                  </div>
                  <div className="pt-1 text-white/20 transition-colors group-hover:text-cyan-400 sm:pt-0">
                    <Zap size={18} />
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Status pill */}
            <motion.div
              className="mt-8 rounded-xl glass-card p-5"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-hud text-[10px] font-medium tracking-widest text-green-400">
                  ALL CHANNELS OPEN
                </span>
              </div>
              <p className="font-ui text-sm leading-relaxed text-white/60">
                Available for internship opportunities, project collaborations, and networking. Response time: within 24 hours.
              </p>
            </motion.div>
          </motion.div>

          {/* ── Right: form ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <p className="section-label mb-6 sm:mb-8">DIRECT TRANSMISSION</p>

            <div className="rounded-xl glass-card p-5 hud-border sm:p-7">

              {/* Terminal chrome bar */}
              <div className="mb-7 flex items-center gap-2 border-b border-white/5 pb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-3 font-hud text-[9px] font-medium tracking-widest text-white/40">
                  COMM.TERMINAL v2.0
                </span>
                {/* Live status badge */}
                <div className="ml-auto flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${txStatus === 'sending' ? 'bg-yellow-400 animate-pulse' :
                    txStatus === 'success' ? 'bg-green-400' :
                      txStatus === 'error' ? 'bg-red-400' :
                        'bg-cyan-400/50'
                    }`} />
                  <span className="font-hud text-[8px] tracking-widest text-white/30">
                    {txStatus === 'sending' ? 'TRANSMITTING' :
                      txStatus === 'success' ? 'SENT' :
                        txStatus === 'error' ? 'FAULT' :
                          'STANDBY'}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">

                {/* ── FORM STATE (idle + error) ── */}
                {(txStatus === 'idle' || txStatus === 'error') && (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Error banner */}
                    {txStatus === 'error' && (
                      <motion.div
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="font-hud text-[9px] tracking-widest text-red-400">
                          ⚠ TRANSMISSION FAULT
                        </p>
                        <p className="mt-1 font-ui text-xs text-white/60">{errorMsg}</p>
                      </motion.div>
                    )}

                    {/* Name */}
                    <div>
                      <label className="mb-2 flex items-center justify-between font-hud text-[10px] font-medium tracking-widest text-cyan-400/80">
                        SENDER CALLSIGN
                        <span className="normal-case tracking-normal text-white/30">required</span>
                      </label>
                      <input
                        className="input-hud"
                        placeholder="Your Name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        disabled={isLocked}
                        required
                        minLength={2}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-2 flex items-center justify-between font-hud text-[10px] font-medium tracking-widest text-cyan-400/80">
                        RETURN FREQUENCY
                        <span className="normal-case tracking-normal text-white/30">required</span>
                      </label>
                      <input
                        type="email"
                        className="input-hud"
                        placeholder="your@email.com"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        disabled={isLocked}
                        required
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="mb-2 flex items-center justify-between font-hud text-[10px] font-medium tracking-widest text-cyan-400/80">
                        TRANSMISSION DATA
                        <CharCounter value={formState.message.length} max={MAX_MESSAGE} />
                      </label>
                      <textarea
                        className="input-hud h-32 resize-none"
                        placeholder="Your message..."
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        disabled={isLocked}
                        required
                        minLength={10}
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      className="btn-primary flex w-full items-center justify-center gap-2 text-base disabled:cursor-not-allowed disabled:opacity-60"
                      whileHover={!isLocked ? { scale: 1.02 } : {}}
                      whileTap={!isLocked ? { scale: 0.98 } : {}}
                      disabled={isLocked}
                    >
                      <Send size={16} />
                      {txStatus === 'error' ? 'RETRY TRANSMISSION' : 'TRANSMIT MESSAGE'}
                    </motion.button>
                  </motion.form>
                )}

                {/* ── SENDING STATE ── */}
                {txStatus === 'sending' && (
                  <motion.div
                    key="sending"
                    className="flex flex-col items-center gap-5 py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative h-20 w-20">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border border-cyan-400/60"
                          animate={{ scale: [1, 1.8 + i * 0.4], opacity: [0.6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                        />
                      ))}
                      <div
                        className="absolute inset-3 rounded-full"
                        style={{ background: 'radial-gradient(circle, #00D4FF, #5A189A)' }}
                      />
                    </div>
                    <p className="font-hud text-sm tracking-widest text-cyan-400 animate-pulse">
                      TRANSMITTING...
                    </p>
                    <p className="font-ui text-xs text-white/40">Routing signal through NEBULA relay</p>
                  </motion.div>
                )}

                {/* ── SUCCESS STATE ── */}
                {txStatus === 'success' && (
                  <motion.div
                    key="success"
                    className="py-10 text-center"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 120 }}
                  >
                    <motion.div
                      className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
                      style={{
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.4)',
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(0,212,255,0.3)',
                          '0 0 50px rgba(0,212,255,0.6)',
                          '0 0 20px rgba(0,212,255,0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Send size={28} className="text-cyan-400" />
                    </motion.div>

                    <p className="mb-2 font-hud text-lg font-bold text-white">TRANSMISSION SENT</p>
                    <p className="mb-1 font-ui text-sm text-white/60">
                      Signal confirmed. K Inish will respond within 24 hours.
                    </p>
                    <p className="font-hud text-[9px] tracking-widest text-cyan-400/50">
                      NEBULA RELAY CONFIRMED ◆ SIGNAL LOGGED
                    </p>

                    <motion.button
                      onClick={handleReset}
                      className="btn-primary mt-7 text-[10px]"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      ◉ NEW TRANSMISSION
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── Footer ── */}
        <motion.div
          className="mt-20 w-full max-w-3xl border-t border-white/5 pt-8 text-center sm:mt-24"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-400/40" />
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-spin-slow" />
              <div className="absolute inset-1 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-400">
                <span className="font-hud text-[8px] font-bold text-white">IO</span>
              </div>
            </div>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-400/40" />
          </div>
          <p className="font-hud text-[8px] tracking-[0.4em] text-white/30">
            INISH OS // NEBULA COMMAND VESSEL // K INISH KUMAR 2026
          </p>
          <p className="mt-2 font-ui text-xs text-white/20">
            Built with React, Three.js, Framer Motion and creativity
          </p>
        </motion.div>

      </div>
    </section>
  );
}