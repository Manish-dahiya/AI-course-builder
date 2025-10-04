require('dotenv').config(); 
const autocannon = require("autocannon");

const endpoints = [
  `http://localhost:${process.env.PORT}/api/courses/generate-course`,
  
];

async function runTest(url) {
  console.log(`🚀 Testing ${url}`);
  const result = await autocannon({
    url,
  connections: 5,   // small number of concurrent requests
  duration: 10,      // 5 seconds
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "Build an AI course", userId: "guestId" })

  });

  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency (ms): ${result.latency.average}`);
  console.log("-------------------------------");
}

async function main() {
  for (const url of endpoints) {
    await runTest(url);
  }
  console.log(" Performance testing completed!");
}

main();
