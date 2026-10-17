import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)', color: '#0f172a', paddingBottom: '80px' }}>
      <style>{`
        .about-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
        .about-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .about-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .about-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .about-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.08) !important; }
        @media (max-width: 768px) {
          .about-grid-2, .about-grid-3 { grid-template-columns: 1fr; }
          .about-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* Hero Banner */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 20px 60px', textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0fdf4 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: '9999px', marginBottom: '16px' }}>
            About P-Ware
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: '1.2' }}>
            Premium Sanitary Ware<br />Manufacturing Since 2010
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.7', maxWidth: '620px', margin: '0 auto' }}>
            P-Ware Ceramics is a leading manufacturer of high-quality wash basins, sanitary ware, and bathroom accessories based in Gujarat, India. We serve an exclusive B2B network of authorized traders and retailers across the country.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Factory Images Section */}
        <section style={{ padding: '60px 0' }}>
          <div className="about-grid-2" style={{ marginBottom: '32px' }}>
            <div>
              <img src="/images/factory-exterior.png" alt="P-Ware Factory" style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Our Manufacturing Facility</h2>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
                Our state-of-the-art manufacturing unit is spread across <strong>50,000+ sq ft</strong> in the heart of Gujarat&apos;s ceramic industrial belt. Equipped with modern tunnel kilns, automated glazing lines, and computerized quality testing labs, we produce over <strong>10,000 units per month</strong> across all product categories.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ padding: '12px 20px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb' }}>50K+</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Sq Ft Facility</div>
                </div>
                <div style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>10K+</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Units/Month</div>
                </div>
                <div style={{ padding: '12px 20px', backgroundColor: '#fefce8', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#ca8a04' }}>14+</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Years Experience</div>
                </div>
              </div>
            </div>
          </div>

          <div className="about-grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', order: 1 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Production & Quality Control</h2>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.8' }}>
                Every product goes through a <strong>7-stage quality assurance process</strong> — from raw material inspection to final packaging. Our production line features:
              </p>
              <ul style={{ fontSize: '14px', color: '#475569', lineHeight: '2', paddingLeft: '20px', margin: 0 }}>
                <li>Automated slip casting and pressure casting machines</li>
                <li>High-temperature tunnel kilns (1200°C firing)</li>
                <li>Robotic glazing application system</li>
                <li>Computerized dimensional inspection</li>
                <li>Water absorption and load testing lab</li>
                <li>IS:2556 & IS:771 certified testing procedures</li>
              </ul>
            </div>
            <div style={{ order: 2 }}>
              <img src="/images/factory-production.png" alt="Production Line" style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            </div>
          </div>
        </section>

        {/* Warehouse Section */}
        <section style={{ padding: '0 0 60px' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
            <img src="/images/factory-warehouse.png" alt="Warehouse" style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '40px 32px 28px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>Warehousing & Logistics</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                Our dedicated warehouse stores finished goods across categories with organized rack systems. We provide nationwide delivery through a network of trusted logistics partners, ensuring safe transit of fragile ceramic products.
              </p>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section style={{ padding: '0 0 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px' }}>Why Choose P-Ware?</h2>
            <p style={{ fontSize: '15px', color: '#64748b' }}>Built on quality, trust, and exclusive B2B partnerships</p>
          </div>
          <div className="about-grid-4">
            {[
              { icon: '🏭', title: 'In-House Manufacturing', desc: 'Complete control over production — from raw clay to finished product' },
              { icon: '✅', title: 'ISI Certified', desc: 'Products certified under Bureau of Indian Standards for safety & quality' },
              { icon: '🤝', title: 'B2B Exclusive', desc: 'Protected dealer margins with no direct-to-consumer retail sales' },
              { icon: '🚚', title: 'Pan-India Delivery', desc: 'Reliable logistics network with damage-proof packaging systems' },
              { icon: '📋', title: 'Custom OEM', desc: 'Private label manufacturing for established bathroom brands' },
              { icon: '💰', title: 'Competitive Pricing', desc: 'Factory-direct pricing with transparent tiered quotation system' },
              { icon: '🔬', title: 'R&D Innovation', desc: 'Dedicated design team for new product development every quarter' },
              { icon: '📞', title: 'Dealer Support', desc: 'Dedicated account managers for every authorized trader in the network' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="about-card"
                style={{
                  backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
                  padding: '24px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}
              >
                <span style={{ fontSize: '28px' }}>{item.icon}</span>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact / CTA */}
        <section style={{ padding: '0 0 20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            borderRadius: '20px', padding: '48px 40px', textAlign: 'center', color: 'white',
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 12px' }}>Interested in Becoming a Partner?</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto 28px', lineHeight: '1.6' }}>
              Join our exclusive B2B network. We onboard verified Traders and Retailers across India.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-flex', padding: '12px 28px', backgroundColor: '#2563eb',
                color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                Register Now
              </Link>
              <Link href="/products" style={{
                display: 'inline-flex', padding: '12px 28px', backgroundColor: 'transparent',
                color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s',
              }}>
                Browse Catalog
              </Link>
            </div>
            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Email:</strong> b2b@pwareceramics.com
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Phone:</strong> +91 (02822) 240000
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Location:</strong> Morbi, Gujarat, India
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
