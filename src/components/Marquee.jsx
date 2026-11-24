import { Fragment } from 'react'
import { marqueeWords } from '../data'
import { VelocityMarquee } from './motion'

export default function Marquee() {
  const row = (
    <>
      {marqueeWords.map((w) => (
        <Fragment key={w}>
          <span>{w}</span>
          <span className="star">✦</span>
        </Fragment>
      ))}
    </>
  )
  return (
    <div className="marquee-band">
      <VelocityMarquee className="marquee-track" baseVelocity={-2.5}>
        <span style={{ display: 'flex', gap: 40, paddingRight: 40 }}>{row}</span>
      </VelocityMarquee>
    </div>
  )
}
