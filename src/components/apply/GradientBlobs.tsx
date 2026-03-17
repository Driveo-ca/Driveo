'use client';

import { motion } from 'framer-motion';

// Step 1: Simple person with clean animation
export function BlobBasicInfo() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Clean gradient blob */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-[#E23232]/20 blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Simple person SVG */}
      <motion.svg
        width="140" height="140" viewBox="0 0 140 140" fill="none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Head */}
        <motion.circle
          cx="70" cy="45" r="22"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
        />

        {/* Body */}
        <motion.path
          d="M 35 100 Q 35 70 70 70 Q 105 70 105 100"
          stroke="#E23232" strokeWidth="2.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );
}

// Step 2: Simple map pin
export function BlobLocation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Clean gradient blob */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-[#E23232]/20 blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Simple map pin */}
      <motion.svg
        width="120" height="150" viewBox="0 0 120 150" fill="none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Pin shape */}
        <motion.path
          d="M 60 15 C 40 15 24 31 24 51 C 24 75 60 110 60 110 C 60 110 96 75 96 51 C 96 31 80 15 60 15 Z"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
        />

        {/* Center dot */}
        <motion.circle
          cx="60" cy="51" r="15"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </motion.svg>
    </div>
  );
}

// Step 3: Star badge for experience
export function BlobExperience() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Clean gradient blob */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-[#E23232]/20 blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Star badge */}
      <motion.svg
        width="160" height="160" viewBox="0 0 160 160" fill="none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer circle */}
        <motion.circle
          cx="80" cy="80" r="55"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
        />

        {/* Star */}
        <motion.path
          d="M 80 35 L 88 63 L 117 63 L 94 80 L 102 108 L 80 91 L 58 108 L 66 80 L 43 63 L 72 63 Z"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.6, ease: 'easeInOut' }}
        />

        {/* Small accent circles */}
        {[0, 1, 2].map((i) => {
          const angle = (i * 120 * Math.PI) / 180;
          const radius = 65;
          const x = 80 + Math.cos(angle - Math.PI / 2) * radius;
          const y = 80 + Math.sin(angle - Math.PI / 2) * radius;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#E23232"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 1.8 + i * 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            />
          );
        })}
      </motion.svg>
    </div>
  );
}

// Step 4: Simple document with checkmark
export function BlobDocuments() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Clean gradient blob */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-[#E23232]/20 blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Simple document */}
      <motion.svg
        width="140" height="160" viewBox="0 0 140 160" fill="none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Document */}
        <motion.rect
          x="30" y="30" width="80" height="100" rx="8"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
        />

        {/* Lines */}
        {[0, 1, 2].map((i) => (
          <motion.line
            key={i}
            x1="45" y1={50 + i * 15} x2="95" y2={50 + i * 15}
            stroke="#E23232" strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.8 + i * 0.2 }}
          />
        ))}

        {/* Checkmark circle */}
        <motion.circle
          cx="70" cy="110" r="18"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* Checkmark */}
        <motion.path
          d="M 62 110 L 68 116 L 78 104"
          stroke="#E23232" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
        />
      </motion.svg>
    </div>
  );
}

// Step 5: Simple checklist
export function BlobReview() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Clean gradient blob */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-[#E23232]/20 blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Simple clipboard */}
      <motion.svg
        width="120" height="140" viewBox="0 0 120 140" fill="none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Clipboard */}
        <motion.rect
          x="20" y="20" width="80" height="100" rx="8"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
        />

        {/* Clip */}
        <motion.rect
          x="45" y="12" width="30" height="15" rx="4"
          stroke="#E23232" strokeWidth="2.5" fill="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* Checkboxes */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <motion.rect
              x="32" y={40 + i * 20} width="14" height="14" rx="3"
              stroke="#E23232" strokeWidth="2" fill="none"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 1 + i * 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            />
            <motion.path
              d={`M ${35} ${47 + i * 20} L ${39} ${51 + i * 20} L ${43} ${44 + i * 20}`}
              stroke="#E23232" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 1.3 + i * 0.3 }}
            />
            <motion.line
              x1="54" y1={47 + i * 20} x2="85" y2={47 + i * 20}
              stroke="#E23232" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.3 }}
            />
          </g>
        ))}
      </motion.svg>
    </div>
  );
}

// Thank You: Simple success checkmark
export function BlobThankYou() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Clean gradient blob */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-[#E23232]/20 blur-[100px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Simple success checkmark */}
      <motion.svg
        width="160" height="160" viewBox="0 0 160 160" fill="none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Circle */}
        <motion.circle
          cx="80" cy="80" r="60"
          stroke="#E23232" strokeWidth="3" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
        />

        {/* Checkmark */}
        <motion.path
          d="M 45 80 L 68 103 L 115 56"
          stroke="#E23232" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );
}
