import Image from 'next/image'
import Header from '@/components/header/header'
import React from 'react'
const features = [
  {
    title: 'PDF & Document Analysis',
    description:
      'Upload textbooks, lecture notes, or PDFs, and AI-TUTOR breaks down content into digestible summaries. Highlight key points, extract definitions, and navigate to relevant sections instantly.',
  },
  {
    title: 'Smart Annotations',
    description:
      'AI-TUTOR can highlight important passages, circle diagrams, and underline critical concepts in your study materials — all automatically based on your questions.',
  },
  {
    title: 'AI-Powered Insights',
    description:
      'Receive actionable learning suggestions and tips to improve comprehension, retention, and overall study efficiency.',
    spanFull: true,
  },
]
export default function Home() {
  return (
    <>
      <Header />
      <section id="ai-tutor-features" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">
            Meet AI-TUTOR: Your Personal Learning Assistant
          </h2>
          <p className="text-center text-lg text-gray-700 mb-12">
            AI-TUTOR is an intelligent learning companion designed to help
            students, professionals, and lifelong learners master any
            subject faster and smarter.
          </p>

          <div className="flex gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`w-4/12 text-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition ${
                  feature.spanFull ? 'md:col-span-2' : ''
                }`}>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
