const { getClient } = require('./get-client');

(async () => {
  const client = await getClient();

  const user_id = process.argv[2] ?? '873556674';
  const entries = await client.query('SELECT telegram_id FROM users;' );
  const users= entries.rows.map((r) => Object.values(r))
  console.log(`Database entries for ${user_id}: ${entries.rowCount} row(s)`);
  console.log(Object.keys(entries.rows?.[0]).join('\t'));
  console.log(`${entries.rows.map((r) => Object.values(r).join('\t')).join('\n')}`);
  for (let i = 0 ; i<users.length; i++){
    console.log("users are" + users[i])}
  await client.end();
})();