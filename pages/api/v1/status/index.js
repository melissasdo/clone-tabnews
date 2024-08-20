import database from "infra/database.js";

async function status(req, res) {
  const updateAt = new Date().toISOString();
  const databaseVersionResult = await database.query("SHOW server_version;"); // query sem parâmetros
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;
  const databaseMaxConnectionsResult = await database.query(
    "SHOW MAX_CONNECTIONS",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count (*)::int FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName],
  });

  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  res.status(200).json({
    updated_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      },
    },
  });
}

export default status;
