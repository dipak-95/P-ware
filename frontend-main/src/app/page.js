import Link from 'next/link';

export default function HomePage() {
  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: 'calc(100vh - 70px)',
        color: '#0f172a',
        width: '100%',
        paddingBottom: '80px',
      }}
    >
      <style>{`
        .b2b-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .b2b-section-2col {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 44px;
          align-items: center;
        }
        .b2b-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .b2b-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08) !important;
          border-color: #cbd5e1 !important;
        }
        .b2b-btn-primary {
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .b2b-btn-primary:hover {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35) !important;
        }
        @media (max-width: 960px) {
          .b2b-section-2col {
            grid-template-columns: 1fr;
            gap: 36px;
          }
        }
        @media (max-width: 768px) {
          .b2b-grid-3 {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .b2b-hero-section {
            padding: 52px 16px 64px 16px !important;
          }
          .b2b-section-wrap {
            padding: 32px 20px !important;
          }
          .b2b-badges-row {
            flex-direction: column !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section 1: Hero Section */}
        <section
          className="b2b-hero-section"
          style={{
            textAlign: 'center',
            padding: '80px 20px 88px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            marginTop: '24px',
            marginBottom: '64px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Pill Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '6px 18px',
              borderRadius: '9999px',
              marginBottom: '24px',
            }}
          >
            Exclusive B2B Network Portal
          </span>

          {/* Large Heading (Dark text, no gradient) */}
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: '800',
              lineHeight: '1.18',
              letterSpacing: '-0.03em',
              color: '#0f172a',
              maxWidth: '820px',
              margin: '0 auto 20px auto',
            }}
          >
            Premium Sanitary Ware &amp; Wash Basins Manufacturer
          </h1>

          {/* Subtitle text in gray */}
          <p
            style={{
              color: '#475569',
              fontSize: 'clamp(16px, 2vw, 19px)',
              lineHeight: '1.65',
              maxWidth: '640px',
              margin: '0 auto 36px auto',
            }}
          >
            Morbi&apos;s premier manufacturing hub for precision ceramic wash basins, sanitary ware, and commercial bath systems — cataloged and distributed strictly through verified channels.
          </p>

          {/* Single 'Browse Catalog' Button (No partner login button) */}
          <div>
            <Link
              href="/products"
              className="b2b-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '14px 34px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                letterSpacing: '0.01em',
              }}
            >
              Browse Catalog
            </Link>
          </div>
        </section>

        {/* Section 2: Product Segments Grid */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 36px)',
                fontWeight: '700',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: '10px',
              }}
            >
              Our Product Segments
            </h2>
            <p
              style={{
                color: '#475569',
                fontSize: '16px',
                maxWidth: '560px',
                margin: '0 auto',
                lineHeight: '1.6',
              }}
            >
              Engineered with high-grade ceramic clays, advanced kilns, and anti-bacterial glaze coatings.
            </p>
          </div>

          <div className="b2b-grid-3">
            {/* Card 01: Wash Basins */}
            <div
              className="b2b-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  fontSize: '20px',
                  fontWeight: '800',
                  letterSpacing: '0.02em',
                }}
              >
                01
              </div>
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Wash Basins
              </h3>
              <p
                style={{
                  color: '#475569',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Explore Table Top, Wall Mounted, One Piece Pedestal, and Counter Top ceramic basins with dirt-repellent nano glazes.
              </p>
            </div>

            {/* Card 02: Sanitary Ware */}
            <div
              className="b2b-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  fontSize: '20px',
                  fontWeight: '800',
                  letterSpacing: '0.02em',
                }}
              >
                02
              </div>
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Sanitary Ware
              </h3>
              <p
                style={{
                  color: '#475569',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                High-efficiency Western Toilets, One-Piece &amp; Two-Piece closets with rimless flushing and soft-close UF covers.
              </p>
            </div>

            {/* Card 03: Accessories */}
            <div
              className="b2b-card"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  fontSize: '20px',
                  fontWeight: '800',
                  letterSpacing: '0.02em',
                }}
              >
                03
              </div>
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Accessories
              </h3>
              <p
                style={{
                  color: '#475569',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                Lead-free brass faucets, concealed cisterns, thermostatic mixers, and precision flush valves built for long life.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How B2B Works Section */}
        <section
          className="b2b-section-wrap"
          style={{
            background: 'linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '52px 44px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="b2b-section-2col">
            {/* Left Column: Explanation and Badges */}
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  backgroundColor: '#dbeafe',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  marginBottom: '14px',
                }}
              >
                Distribution Model
              </span>

              <h2
                style={{
                  fontSize: 'clamp(24px, 3.2vw, 34px)',
                  fontWeight: '700',
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  marginBottom: '16px',
                  lineHeight: '1.25',
                }}
              >
                How Our B2B System Works
              </h2>

              <p
                style={{
                  color: '#475569',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  marginBottom: '28px',
                }}
              >
                P-Ware operates exclusively on a Manufacturer &rarr; Trader &rarr; Retailer channel model. Public price lists are kept confidential to protect channel partners. Authorized Traders receive verified referral codes, and mapped Retailers submit quotation inquiries directly. The manufacturer generates official quotation PDFs with tier pricing directly to the associated Trader.
              </p>

              {/* Traders and Retailers Badges */}
              <div
                className="b2b-badges-row"
                style={{
                  display: 'flex',
                  gap: '16px',
                }}
              >
                {/* Traders Badge */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                      }}
                    />
                    <strong
                      style={{
                        color: '#0f172a',
                        fontSize: '16px',
                        fontWeight: '700',
                      }}
                    >
                      Traders
                    </strong>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: '1.5',
                    }}
                  >
                    Exclusive referral codes, wholesale pricing, and instant PDF quote generation.
                  </div>
                </div>

                {/* Retailers Badge */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                      }}
                    />
                    <strong
                      style={{
                        color: '#0f172a',
                        fontSize: '16px',
                        fontWeight: '700',
                      }}
                    >
                      Retailers
                    </strong>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#475569',
                      lineHeight: '1.5',
                    }}
                  >
                    Seamless inquiry cart submissions mapped directly to regional trader fulfillment.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Info Card (NO login/register button) */}
            <div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    color: '#2563eb',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                  }}
                >
                  Partner Onboarding
                </div>

                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Become an Authorized Partner
                </h3>

                <p
                  style={{
                    color: '#475569',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    margin: 0,
                  }}
                >
                  To join our exclusive B2B dealer and retailer network, please contact our distribution desk directly. Accounts are verified and activated manually by our team to protect network integrity.
                </p>

                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>Direct Contact:</span>
                    <span>b2b@pwareceramics.com</span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>Trade Desk:</span>
                    <span>+91 (02822) 240000</span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: '1.5',
                  }}
                >
                  Verification takes up to 24 hours for Trader and Retailer approvals.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FACTORY SHOWCASE SECTION ─── */}
        <section
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 20px 60px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '5px 16px',
                borderRadius: '9999px',
                marginBottom: '14px',
              }}
            >
              Manufacturing Excellence
            </span>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: '0 0 10px',
              }}
            >
              Our World-Class Factory
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#64748b',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6',
              }}
            >
              State-of-the-art manufacturing facility equipped with modern kilns, automated production lines, and rigorous quality control processes.
            </p>
          </div>

          <div className="b2b-grid-3">
            {/* Production Line */}
            <div
              className="b2b-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              }}
            >
              <img
                src="/images/factory-production.png"
                alt="Production Line"
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 6px',
                  }}
                >
                  Production Line
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  Automated ceramic manufacturing with precision molding and high-temperature kiln firing for premium finish quality.
                </p>
              </div>
            </div>

            {/* Warehouse */}
            <div
              className="b2b-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              }}
            >
              <img
                src="/images/factory-warehouse.png"
                alt="Warehouse & Storage"
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 6px',
                  }}
                >
                  Warehouse & Storage
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  Large-scale warehousing with organized inventory management ensuring fast dispatch across India.
                </p>
              </div>
            </div>

            {/* Factory Exterior */}
            <div
              className="b2b-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              }}
            >
              <img
                src="/images/factory-exterior.png"
                alt="Factory Campus"
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 6px',
                  }}
                >
                  Factory Campus
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  Modern 50,000 sq ft facility in Gujarat industrial zone with dedicated R&D and quality testing labs.
                </p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link
              href="/about"
              className="b2b-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                backgroundColor: 'white',
                color: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Learn More About Us →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
