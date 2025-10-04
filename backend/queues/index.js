require("dotenv").config();
const amqp = require("amqplib");

let channel;

async function connect() {
  const connection = await amqp.connect(process.env.RABBIT_URL);
  channel = await connection.createChannel();

  await channel.assertQueue("course_creation", { durable: true });
  await channel.assertQueue("low_priority_resources", { durable: true });
  await channel.assertQueue("high_priority_resources", { durable: true });

  console.log("RabbitMQ connected and queues asserted");
  return channel;
}
function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized. Call connect() first.");
  }
  return channel;
}

module.exports = { connect, getChannel };
