const { Client } = require("pg");

const url =
  "postgresql://postgres.fbjlsakfepstzwhmwxwm:Fa23-bcs-063%40cuiatk.edu.pk@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=no-verify";

const client = new Client({ connectionString: url });

async function main() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS "RepoAnalysis" (
      id TEXT PRIMARY KEY,
      "repoUrl" TEXT UNIQUE NOT NULL,
      owner TEXT NOT NULL,
      "repoName" TEXT NOT NULL,
      summary TEXT NOT NULL,
      "techStack" JSONB NOT NULL,
      "folderTree" JSONB NOT NULL,
      architecture JSONB NOT NULL,
      "setupSteps" JSONB NOT NULL,
      "rawFileTree" JSONB NOT NULL,
      "lastCommitSha" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Table created successfully!");
  await client.end();
}

main().catch((e) => {
  console.log("Error:", e.message);
  process.exit(1);
});
