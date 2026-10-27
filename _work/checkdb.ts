import { createClient } from "@libsql/client";
const c = createClient({ url: "file:./local.db" });
async function main() {
  for (const t of ["courses","topics","lessons","categories","reviews","quizzes","quiz_questions","assignments","announcements","users","enrollments","orders"]) {
    try {
      const r = await c.execute(`select count(*) as n from ${t}`);
      console.log(t.padEnd(14), r.rows[0].n);
    } catch (e) { console.log(t.padEnd(14), "ERR", (e as Error).message.slice(0,60)); }
  }
  const u = await c.execute("select email, role from users");
  console.log(u.rows);
}
main();
