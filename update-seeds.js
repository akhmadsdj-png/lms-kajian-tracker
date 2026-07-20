const fs = require("fs");
const yts = require("yt-search");

async function main() {
  const seedFile = "prisma/seed.ts";
  let content = fs.readFileSync(seedFile, "utf8");

  // Regex to match { title: "...", youtubeVideoId: "dQw4w9WgXcQ" }
  const regex = /\{ title: "(.*?)", youtubeVideoId: "(.*?)" \}/g;
  
  let match;
  let newContent = content;
  
  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0];
    const title = match[1];
    
    console.log(`Searching for: ${title}`);
    try {
      const result = await yts(`${title} Firanda`);
      if (result && result.videos.length > 0) {
        const vidId = result.videos[0].videoId;
        console.log(`Found: ${vidId}`);
        newContent = newContent.replace(
          fullMatch,
          `{ title: "${title}", youtubeVideoId: "${vidId}" }`
        );
      }
    } catch (e) {
      console.error(`Failed to find ${title}`, e);
    }
    
    // Slight delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync(seedFile, newContent);
  console.log("seed.ts updated successfully!");
}

main();
