import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Mail, Radio, Send, Zap } from 'lucide-react';

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

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 2000);
  };

  return (
    <section id="contact" ref={ref} className="section-shell">
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 80%, rgba(0,212,255,0.05) 0%, transparent 70%)' }}
      />

      <div className="section-inner flex w-full flex-col items-center">
        {/* Header */}
        <motion.div
          className="mb-12 w-full text-center lg:mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-4">COMM.HUB.CONNECT</p>
          <h2 className="section-header gradient-text">Communication Hub</h2>
          <p className="mt-3 font-ui text-sm text-white/60 sm:text-base">Establish contact with the command vessel.</p>
          <div className="section-sep mt-4" />
        </motion.div>

        {/* Nebula transmission banner */}
        <motion.div
          className="mb-10 flex w-full max-w-2xl flex-col items-start gap-4 rounded-xl glass-card-purple p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <div className="relative h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
            <div className="absolute inset-0 rounded-full border border-cyan-400/60 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle, #00D4FF, #5A189A)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-hud text-[9px] font-medium tracking-widest text-cyan-400">NEBULA TRANSMISSION</p>
            <p className="font-ui text-sm italic text-white/85 sm:text-base">
              "Communication channels established. Ready to receive."
            </p>
          </div>
          <Radio size={16} className="flex-shrink-0 text-cyan-400 animate-pulse sm:size-[18px]" />
        </motion.div>

        {/* Main grid */}
        <div className="grid w-full items-start gap-8 lg:grid-cols-2 lg:gap-12">

          {/* Left: Channels */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <p className="section-label mb-5 sm:mb-6">COMM CHANNELS</p>

            <div className="space-y-4">
              {CONTACTS.map((contact, index) => (
                <motion.a
                  key={contact.label}
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl glass-card p-4 transition-all duration-300 sm:gap-5 sm:p-5"
                  style={{ borderColor: 'rgba(0,212,255,0.15)' }}
                  whileHover={{
                    borderColor: `${contact.color}60`,
                    boxShadow: `0 0 30px ${contact.color}20`,
                    x: 4,
                  }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${contact.color}15`, border: `1px solid ${contact.color}30` }}
                  >
                    <contact.icon size={20} style={{ color: contact.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <SignalPing color={contact.color} />
                      <span className="font-hud text-[8px] font-medium tracking-widest sm:text-[9px]" style={{ color: contact.color }}>
                        {contact.label}
                      </span>
                    </div>
                    <p className="truncate font-ui text-sm font-medium text-white transition-colors group-hover:text-cyan-300 sm:text-base sm:truncate-none">
                      {contact.value}
                    </p>
                    <p className="mt-0.5 font-ui text-xs text-white/50 sm:text-sm">{contact.desc}</p>
                  </div>
                  <div className="pt-0 text-white/20 transition-colors group-hover:text-cyan-400 flex-shrink-0">
                    <Zap size={16} />
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div
              className="mt-6 rounded-xl glass-card p-4 sm:p-5"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
            >
              <div className="mb-2 flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-hud text-[9px] sm:text-[10px] font-medium tracking-widest text-green-400">
                  ALL CHANNELS OPEN
                </span>
              </div>
              <p className="font-ui text-xs leading-relaxed text-white/60 sm:text-sm">
                Available for internship opportunities, project collaborations, and networking. Response time: within 24 hours.
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <p className="section-label mb-5 sm:mb-6">DIRECT TRANSMISSION</p>

            <div className="rounded-xl glass-card p-4 hud-border sm:p-6">
              {/* Terminal header */}
              <div className="mb-5 flex items-center gap-2 border-b border-white/5 pb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 font-hud text-[8px] sm:text-[9px] font-medium tracking-widest text-white/40">
                  COMM.TERMINAL v1.0
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div>
                      <label className="mb-2 block font-hud text-[9px] sm:text-[10px] font-medium tracking-widest text-cyan-400/80">
                        SENDER CALLSIGN
                      </label>
                      <input
                        className="input-hud"
                        placeholder="Your Name"
                        value={formState.name}
                        onChange={(e) => setFormState((v) => ({ ...v, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-hud text-[9px] sm:text-[10px] font-medium tracking-widest text-cyan-400/80">
                        RETURN FREQUENCY
                      </label>
                      <input
                        type="email"
                        className="input-hud"
                        placeholder="your@email.com"
                        value={formState.email}
                        onChange={(e) => setFormState((v) => ({ ...v, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-hud text-[9px] sm:text-[10px] font-medium tracking-widest text-cyan-400/80">
                        TRANSMISSION DATA
                      </label>
                      <textarea
                        className="input-hud h-28 resize-none sm:h-32"
                        placeholder="Your message..."
                        value={formState.message}
                        onChange={(e) => setFormState((v) => ({ ...v, message: e.target.value }))}
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      className="btn-primary flex w-full items-center justify-center gap-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <div className="h-3 w-3 rounded-full border border-cyan-400 border-t-transparent animate-spin" />
                          TRANSMITTING...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          TRANSMIT MESSAGE
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    className="py-10 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 120 }}
                  >
                    <div
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
                      style={{
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.4)',
                        boxShadow: '0 0 30px rgba(0,212,255,0.3)',
                      }}
                    >
                      <Send size={22} className="text-cyan-400" />
                    </div>
                    <p className="mb-2 font-hud text-base font-bold text-white sm:text-lg">TRANSMISSION SENT</p>
                    <p className="font-ui text-xs text-white/60 sm:text-sm">
                      Message received by NEBULA. K Inish will respond within 24 hours.
                    </p>
                    <button onClick={() => setSent(false)} className="btn-primary mt-5 text-[9px]">
                      NEW TRANSMISSION
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-16 w-full max-w-3xl border-t border-white/5 pt-8 text-center sm:mt-20"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400/40 sm:w-20" />
            <div className="relative h-7 w-7 sm:h-8 sm:w-8">
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-spin-slow" />
              <div className="absolute inset-1 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-400">
                <span className="font-hud text-[7px] font-bold text-white">IO</span>
              </div>
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400/40 sm:w-20" />
          </div>
          <p className="font-hud text-[7px] tracking-[0.3em] text-white/30 sm:text-[8px] sm:tracking-[0.4em]">
            INISH OS // NEBULA COMMAND VESSEL // K INISH KUMAR 2026
          </p>
          <p className="mt-2 font-ui text-[10px] text-white/20 sm:text-xs">
            Built with React, Three.js, Framer Motion and creativity
          </p>
        </motion.div>
      </div>
    </section>
  );
}