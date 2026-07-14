"use client";

const team = [
  {
    name: "Jordan Vale",
    role: "Co-Founder & CEO",
    initials: "JV",
    bio: "Previously led product at two YC-backed startups. Passionate about tools that let teams focus on building instead of managing.",
    color: "var(--accent)",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: "56px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          About Threadline
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: "680px",
          }}
        >
          We started Threadline because we were tired of flat to-do lists that hide relationships
          between tasks. Every real project has dependencies, bottlenecks, and parallel tracks - your
          tools should make those visible, not force them into a single column.
        </p>
      </div>

      {/* Mission */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          marginBottom: "48px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Our Mission
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Make project complexity visible and manageable for every team. We believe that when you
          can see the whole picture - dependencies, blockers, progress, and people - you make
          better decisions and ship faster with less stress.
        </p>
      </div>

      {/* Team */}
      <div style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "24px",
          }}
        >
          The Team
        </h2>
        <div
          className="team-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {team.map((member) => (
            <div
              key={member.name}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "28px 24px",
                textAlign: "center",
                transition: "transform .18s ease, box-shadow .18s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: member.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: 700,
                  margin: "0 auto 16px",
                }}
              >
                {member.initials}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                {member.name}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, marginBottom: "12px" }}>
                {member.role}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "20px",
          }}
        >
          What We Believe
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { title: "Visibility over complexity", desc: "Show the full picture. Hiding information doesn't reduce complexity - it just makes surprises worse." },
            { title: "Speed of thought", desc: "The tool should never be the bottleneck. Keyboard shortcuts, instant sync, and minimal clicks." },
            { title: "Privacy by design", desc: "Your data is yours. We don't sell it, advertise against it, or use it to train models." },
          ].map((value) => (
            <div
              key={value.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "16px 20px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  flexShrink: 0,
                  marginTop: "7px",
                }}
              />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {value.title}
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {value.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .team-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
