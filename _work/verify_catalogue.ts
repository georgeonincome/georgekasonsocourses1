import { createClient } from "@libsql/client";
import catalogue from "../seed/catalogue.json";
const c = createClient({ url: "file:./local.db" });
async function main() {
  const r = await c.execute("select slug, title, price, currency, is_published, is_featured, lesson_count from courses order by slug");
  const dbRows = r.rows as any[];
  const bySlug = new Map(dbRows.map((x) => [x.slug, x]));
  let bad = 0;
  for (const entry of catalogue as any[]) {
    const row: any = bySlug.get(entry.slug);
    if (!row) { console.log("MISSING", entry.slug); bad++; continue; }
    if (row.price !== entry.price) { console.log("PRICE MISMATCH", entry.slug, "db=", row.price, "seed=", entry.price); bad++; }
    if (row.title !== entry.title) { console.log("TITLE MISMATCH", entry.slug); bad++; }
  }
  const extra = dbRows.filter((x) => !(catalogue as any[]).some((e) => e.slug === x.slug));
  if (extra.length) { console.log("EXTRA ROWS:", extra.map((x) => x.slug)); bad++; }
  const lc = await c.execute("select c.slug, count(l.id) n from courses c left join topics t on t.course_id=c.id left join lessons l on l.topic_id=t.id group by c.slug");
  for (const row of lc.rows as any[]) {
    const entry = (catalogue as any[]).find((e) => e.slug === row.slug);
    const expected = entry.curriculum.reduce((n: number, t: any) => n + t.lessons.length, 0);
    if (row.n !== expected) { console.log("LESSON COUNT", row.slug, "db=", row.n, "expected=", expected); bad++; }
  }
  console.log(bad === 0 ? "CATALOGUE INTACT — all 16 courses match the seed" : `${bad} problems found`);
}
main();
