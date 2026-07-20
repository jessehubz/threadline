import { getUserById } from "@/actions/user-actions";
import { notFound } from "next/navigation";
import { Globe, CodeXml, AtSign, Link2, Lock } from "lucide-react";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getUserById(userId);
  if (!user) notFound();

  const publicProjects = user.memberships
    .filter((m) => m.project.visibility === "PUBLIC")
    .map((m) => m.project);
  const privateProjectCount = user.memberships.filter(
    (m) => m.project.visibility === "PRIVATE"
  ).length;

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {/* Header */}
        <div className="flex items-start gap-5 mb-8">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold shrink-0"
            style={{
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              (user.name?.[0] || user.email[0]).toUpperCase()
            )}
          </div>
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {user.name || "Anonymous"}
            </h1>
            {user.username && (
              <p
                className="text-sm"
                style={{ color: "var(--accent)" }}
              >
                @{user.username}
              </p>
            )}
            {user.bio && (
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {user.bio}
              </p>
            )}
            <p
              className="mt-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Social Links */}
        {(user.githubUrl ||
          user.twitterUrl ||
          user.linkedinUrl ||
          user.websiteUrl) && (
          <div className="flex flex-wrap gap-3 mb-8">
            {user.websiteUrl && (
              <a
                href={user.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105"
                style={{
                  backgroundColor: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <Globe className="h-3.5 w-3.5" /> Website
              </a>
            )}
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105"
                style={{
                  backgroundColor: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <CodeXml className="h-3.5 w-3.5" /> GitHub
              </a>
            )}
            {user.twitterUrl && (
              <a
                href={user.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105"
                style={{
                  backgroundColor: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <AtSign className="h-3.5 w-3.5" /> Twitter
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105"
                style={{
                  backgroundColor: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <Link2 className="h-3.5 w-3.5" /> LinkedIn
              </a>
            )}
          </div>
        )}

        {/* Public Projects */}
        {publicProjects.length > 0 && (
          <section className="mb-8">
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Public Projects
            </h2>
            <div className="space-y-2">
              {publicProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl p-4 transition-all duration-150 hover:scale-[1.01]"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <h3
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {project.name}
                  </h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Private Projects (count only) */}
        {privateProjectCount > 0 && (
          <section>
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Private Projects
            </h2>
            <div
              className="rounded-xl p-4 flex items-center gap-3 opacity-60"
              style={{
                backgroundColor: "var(--bg-muted)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Lock
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
              <div>
                <h3
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {privateProjectCount} private project{privateProjectCount !== 1 ? "s" : ""}
                </h3>
                <p
                  className="text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Only visible to members
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
