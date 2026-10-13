// Adaptador en memoria: implementa las consultas usadas por los controladores.
// Los datos se pierden al reiniciar el proceso.
const tables = { users: [], activities: [], notifications: [] };
let currentId = 1;
const result = (rows) => ({ rows, rowCount: rows.length });
const matches = (row, sql, params, fields) => fields.every(field => {
  const match = sql.match(new RegExp(`\\b(?:\\w+\\.)?${field} = \\$(\\d+)`, 'i'));
  return !match || String(row[field]) === String(params[Number(match[1]) - 1]);
});

const pool = {
  query: async (rawSql, params = []) => {
    const sql = rawSql.replace(/\s+/g, ' ').trim();
    // JOIN de recordatorios: filtrar fechas, estado y notificaciones previas.
    if (/^SELECT a\.\*/i.test(sql) && /JOIN users/i.test(sql)) {
      let rows = tables.activities.filter(a => a.status !== 'completado');
      if (/due_date BETWEEN/i.test(sql)) {
        rows = rows.filter(a => new Date(a.due_date) >= params[0] && new Date(a.due_date) <= params[1]);
      } else if (/due_date </i.test(sql)) {
        rows = rows.filter(a => new Date(a.due_date) < params[0]);
      }
      const type = sql.match(/n\.type = '([^']+)'/i)?.[1];
      const interval = sql.match(/INTERVAL '(\d+) (minutes|hours|day)'/i);
      if (type && interval) {
        const unit = { minutes: 60000, hours: 3600000, day: 86400000 }[interval[2]];
        const cutoff = Date.now() - Number(interval[1]) * unit;
        rows = rows.filter(a => !tables.notifications.some(n => n.activity_id === a.id && n.type === type && new Date(n.sent_at).getTime() > cutoff));
      }
      return result(rows.flatMap(a => {
        const user = tables.users.find(u => u.id === a.user_id);
        return user ? [{ ...a, email: user.email, user_name: user.name }] : [];
      }));
    }
    const table = sql.match(/^(?:INSERT INTO|UPDATE|DELETE FROM) (users|activities|notifications)\b/i)?.[1]
      || sql.match(/\bFROM (users|activities|notifications)\b/i)?.[1];
    if (!table) throw new Error('Consulta no soportada por la base de datos en memoria');
    if (/^INSERT/i.test(sql)) {
      const columns = sql.match(/INSERT INTO \w+ \(([^)]+)\)/i)[1].split(',').map(c => c.trim());
      const values = sql.match(/VALUES \(([^)]+)\)/i)[1].split(',').map(v => v.trim());
      const row = { id: currentId++, created_at: new Date(), updated_at: new Date() };
      columns.forEach((column, index) => {
        const value = values[index];
        row[column] = value.startsWith('$') ? params[Number(value.slice(1)) - 1]
          : value === 'CURRENT_TIMESTAMP' ? new Date() : value.replace(/^'|'$/g, '');
      });
      if (table === 'notifications') row.is_read = false;
      tables[table].push(row);
      return result([row]);
    }
    // Comparaciones de identidad pertenecen al WHERE, no al SET.
    const where = sql.split(/\bWHERE\b/i)[1] || '';
    let rows = tables[table].filter(row => matches(row, where, params,
      table === 'users' ? ['id', 'email'] : ['id', 'user_id', 'status', 'priority', 'category']));
    if (/is_read = false/i.test(where)) rows = rows.filter(r => !r.is_read);
    if (/status != 'completado'/i.test(where)) rows = rows.filter(r => r.status !== 'completado');
    const between = where.match(/due_date BETWEEN \$(\d+) AND \$(\d+)/i);
    if (between) rows = rows.filter(r => new Date(r.due_date) >= params[Number(between[1]) - 1] && new Date(r.due_date) <= params[Number(between[2]) - 1]);
    if (/^UPDATE/i.test(sql)) {
      const set = sql.split(/\bSET\b/i)[1].split(/\bWHERE\b/i)[0];
      for (const row of rows) {
        for (const match of set.matchAll(/(\w+) = (?:COALESCE\(\$(\d+), \w+\)|\$(\d+)|true|CURRENT_TIMESTAMP)/gi)) {
          const [, field, coalesce, direct] = match;
          if (coalesce || direct) {
            const value = params[Number(coalesce || direct) - 1];
            if (!coalesce || value != null) row[field] = value;
          } else row[field] = /true$/i.test(match[0]) ? true : new Date();
        }
      }
      return result(rows);
    }
    if (/^DELETE/i.test(sql)) {
      tables[table] = tables[table].filter(row => !rows.includes(row));
      if (table === 'activities') tables.notifications = tables.notifications.filter(n => !rows.some(a => a.id === n.activity_id));
      return result(rows);
    }
    if (/COUNT\(\*\)/i.test(sql)) return result([{ count: String(rows.length) }]);
    if (table === 'notifications') rows = rows.map(n => ({ ...n, activity_title: tables.activities.find(a => a.id === n.activity_id)?.title || null }));
    if (/ORDER BY .*created_at DESC/i.test(sql)) rows = [...rows].sort((a,b) => b.created_at - a.created_at);
    if (/ORDER BY due_date ASC/i.test(sql)) rows = [...rows].sort((a,b) => new Date(a.due_date) - new Date(b.due_date));
    const limit = sql.match(/LIMIT \$(\d+)/i);
    if (limit) rows = rows.slice(0, Number(params[Number(limit[1]) - 1]));
    return result(rows);
  }
};
console.log('✓ Base de datos en memoria inicializada (mock para desarrollo)');
module.exports = pool;
