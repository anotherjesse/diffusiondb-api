const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

const port = process.env.PORT || 3000;

fastify.register(require("./db"));

fastify.register(cors, {
  origin: "*",
  methods: ["GET"],
});

fastify.get("/", async (request, reply) => {
  const max_limit = 200;
  const default_limit = 50;
  const q = (request.query.q || "").trim();
  const l = Math.min(parseInt(request.query.l) || default_limit, max_limit);
  if (q.length === 0) {
    return { error: "query is empty" };
  }

  const rows = await fastify.sqlite.query(q, l);
  return { results: rows, l, q };
});

fastify.get("/stats", async (request, reply) => {
  const count = await fastify.sqlite.count();
  const mtime = await fastify.sqlite.mtime();
  return { count, mtime };
});

const start = async () => {
  try {
    await fastify.listen(port, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
