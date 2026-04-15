import { ImageResponse } from 'next/og';

export const alt = 'Ruby Want Ads — Northeastern Nevada classifieds';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 90px',
          background:
            'linear-gradient(135deg, #fdf7f5 0%, #f7e8e3 45%, #ebd7cf 100%)',
          color: '#231a24',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #c83a30 0%, #8d1f19 100%)',
              color: 'white',
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: '-0.05em',
            }}
          >
            R
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#8d1f19',
            }}
          >
            Ruby Want Ads
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              maxWidth: 1000,
              flexWrap: 'wrap',
              gap: 18,
            }}
          >
            <span>Buy, sell &amp; discover</span>
            <span style={{ color: '#b32f27' }}>locally.</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#5b4c4e',
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Northeastern Nevada&apos;s classifieds marketplace — vehicles,
            property, jobs, events, and more from the Elko community.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#8a7a7a',
            letterSpacing: '0.06em',
          }}
        >
          <div>rubywantads.com</div>
          <div>Elko · Nevada</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
