import { readFileSync } from 'fs';

// Load .env manually
const envContent = readFileSync('.env', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
}

const WP_URL = env.WORDPRESS_URL;
const USERNAME = env.WORDPRESS_USERNAME;
const APP_PASSWORD = env.WORDPRESS_APP_PASSWORD;

const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64');

// Correct series navigation HTML
const koSeriesNav = `
<hr>
<h2>시리즈 네비게이션</h2>
<ul>
<li><a href="/ko/claude-agent-sdk-day1-introduction">Day 1: Agent 개념과 아키텍처</a></li>
<li><a href="/ko/claude-agent-sdk-day2-tool-use-mcp">Day 2: 도구 사용과 MCP 연동</a></li>
<li><a href="/ko/claude-agent-sdk-day3-memory-context">Day 3: 메모리와 컨텍스트 관리</a></li>
<li><a href="/ko/claude-agent-sdk-day4-multi-agent">Day 4: 멀티 에이전트 오케스트레이션</a></li>
<li><strong>Day 5: 프로덕션 배포와 최적화</strong> (현재 글)</li>
</ul>
`;

const enSeriesNav = `
<hr>
<h2>Series Navigation</h2>
<ul>
<li><a href="/en/claude-agent-sdk-day1-introduction-en">Day 1: Agent Concepts and Architecture</a></li>
<li><a href="/en/claude-agent-sdk-day2-tool-use-mcp-en">Day 2: Tool Use and MCP Integration</a></li>
<li><a href="/en/claude-agent-sdk-day3-memory-context-en">Day 3: Memory and Context Management</a></li>
<li><a href="/en/claude-agent-sdk-day4-multi-agent-en">Day 4: Multi-Agent Orchestration</a></li>
<li><strong>Day 5: Production Deployment and Optimization</strong> (Current)</li>
</ul>
`;

async function addSeriesNav(postId, lang) {
  console.log(`\n=== Adding series navigation to post ${postId} (${lang}) ===`);

  // Get current content
  const getRes = await fetch(`${WP_URL}/wp-json/wp/v2/posts/${postId}`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });

  if (!getRes.ok) {
    console.log(`❌ Failed to get post ${postId}: ${getRes.status}`);
    return;
  }

  const post = await getRes.json();
  let content = post.content.rendered;

  console.log(`Current content length: ${content.length}`);

  // Check if series navigation already exists
  const hasNav = lang === 'ko'
    ? content.includes('시리즈 네비게이션')
    : content.includes('Series Navigation');

  if (hasNav) {
    console.log('Series navigation already exists, skipping...');
    return;
  }

  // Add series navigation at the end
  const seriesNav = lang === 'ko' ? koSeriesNav : enSeriesNav;
  content = content.trimEnd() + '\n' + seriesNav;

  console.log(`New content length: ${content.length}`);

  // Update post
  const updateRes = await fetch(`${WP_URL}/wp-json/wp/v2/posts/${postId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });

  if (updateRes.ok) {
    console.log(`✅ Series navigation added to post ${postId} (${lang})!`);
  } else {
    const errText = await updateRes.text();
    console.log(`❌ Failed to update post ${postId}: ${updateRes.status}`);
    console.log(errText);
  }
}

await addSeriesNav(311, 'ko');
await addSeriesNav(312, 'en');
console.log('\nDone!');
