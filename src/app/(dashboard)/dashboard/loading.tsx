export default function DashboardLoading() {
  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Hero skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "36px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl, 16px)",
          padding: "42px 46px",
          marginBottom: "20px",
        }}
      >
        {/* Left side */}
        <div>
          {/* Badge skeletons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <div
              style={{
                width: "100px",
                height: "24px",
                borderRadius: "999px",
                background: "var(--bg-primary)",
              }}
            />
            <div
              style={{
                width: "160px",
                height: "24px",
                borderRadius: "999px",
                background: "var(--bg-primary)",
              }}
            />
          </div>
          {/* Title skeleton */}
          <div
            style={{
              width: "70%",
              height: "52px",
              borderRadius: "8px",
              background: "var(--bg-primary)",
              marginBottom: "12px",
            }}
          />
          {/* Subtitle skeleton */}
          <div
            style={{
              width: "90%",
              height: "20px",
              borderRadius: "6px",
              background: "var(--bg-primary)",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              width: "60%",
              height: "20px",
              borderRadius: "6px",
              background: "var(--bg-primary)",
              marginBottom: "24px",
            }}
          />
          {/* Button skeleton */}
          <div
            style={{
              width: "140px",
              height: "40px",
              borderRadius: "8px",
              background: "var(--bg-primary)",
            }}
          />
        </div>

        {/* Right side - snapshot card */}
        <div
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg, 12px)",
            padding: "28px",
          }}
        >
          {/* Health ring skeleton */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--bg-elevated)",
              }}
            />
            <div>
              <div style={{ width: "50px", height: "44px", borderRadius: "6px", background: "var(--bg-elevated)", marginBottom: "6px" }} />
              <div style={{ width: "70px", height: "20px", borderRadius: "999px", background: "var(--bg-elevated)" }} />
            </div>
          </div>
          {/* Tasks remaining */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "28px", borderRadius: "6px", background: "var(--bg-elevated)", marginBottom: "4px" }} />
            <div style={{ width: "180px", height: "14px", borderRadius: "4px", background: "var(--bg-elevated)" }} />
          </div>
          {/* Breakdown grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ textAlign: "center", padding: "10px 0", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm, 6px)" }}>
                <div style={{ width: "24px", height: "18px", borderRadius: "4px", background: "var(--bg-primary)", margin: "0 auto 4px" }} />
                <div style={{ width: "40px", height: "10px", borderRadius: "3px", background: "var(--bg-primary)", margin: "0 auto" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI banner skeleton */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg, 12px)",
          padding: "16px 22px",
          marginBottom: "24px",
        }}
      >
        <div style={{ width: "90px", height: "24px", borderRadius: "999px", background: "var(--bg-primary)" }} />
        <div style={{ flex: 1, height: "16px", borderRadius: "4px", background: "var(--bg-primary)" }} />
        <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "var(--bg-primary)" }} />
      </div>

      {/* Separator */}
      <div style={{ height: "1px", margin: "36px 0 40px", background: "var(--border-default)" }} />

      {/* Projects section skeleton */}
      <div style={{ marginBottom: "24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ width: "130px", height: "22px", borderRadius: "6px", background: "var(--bg-elevated)", marginBottom: "6px" }} />
            <div style={{ width: "100px", height: "14px", borderRadius: "4px", background: "var(--bg-elevated)" }} />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ width: "200px", height: "36px", borderRadius: "var(--radius-sm, 6px)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }} />
            <div style={{ width: "120px", height: "36px", borderRadius: "8px", background: "var(--bg-elevated)" }} />
          </div>
        </div>

        {/* Filter tabs skeleton */}
        <div
          style={{
            display: "inline-flex",
            gap: "2px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md, 10px)",
            padding: "4px",
            marginBottom: "24px",
          }}
        >
          {[80, 85, 65, 50].map((w, i) => (
            <div key={i} style={{ width: `${w}px`, height: "32px", borderRadius: "999px", background: i === 0 ? "var(--bg-primary)" : "transparent" }} />
          ))}
        </div>

        {/* Project grid skeleton */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg, 12px)",
                padding: "26px",
              }}
            >
              {/* Status badge */}
              <div style={{ width: "60px", height: "18px", borderRadius: "999px", background: "var(--bg-primary)", marginBottom: "14px" }} />
              {/* Title */}
              <div style={{ width: "70%", height: "18px", borderRadius: "5px", background: "var(--bg-primary)", marginBottom: "6px" }} />
              {/* Meta */}
              <div style={{ width: "50%", height: "12px", borderRadius: "4px", background: "var(--bg-primary)", marginBottom: "16px" }} />
              {/* Progress bar */}
              <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-primary)", marginBottom: "16px" }} />
              {/* Tags */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                <div style={{ width: "50px", height: "20px", borderRadius: "999px", background: "var(--bg-primary)" }} />
                <div style={{ width: "60px", height: "20px", borderRadius: "999px", background: "var(--bg-primary)" }} />
              </div>
              {/* Divider */}
              <div style={{ height: "1px", background: "var(--border-default)", marginBottom: "14px" }} />
              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "100px", height: "12px", borderRadius: "4px", background: "var(--bg-primary)" }} />
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-primary)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: "1px", margin: "36px 0 40px", background: "var(--border-default)" }} />

      {/* Second row skeleton (Needs Attention + Friends) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {[0, 1].map((panelIdx) => (
          <div
            key={panelIdx}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl, 16px)",
              padding: "26px",
            }}
          >
            <div style={{ width: "140px", height: "18px", borderRadius: "5px", background: "var(--bg-primary)", marginBottom: "6px" }} />
            <div style={{ width: "100px", height: "12px", borderRadius: "4px", background: "var(--bg-primary)", marginBottom: "20px" }} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-primary)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: "60%", height: "13px", borderRadius: "4px", background: "var(--bg-primary)", marginBottom: "4px" }} />
                  <div style={{ width: "40%", height: "11px", borderRadius: "3px", background: "var(--bg-primary)" }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
