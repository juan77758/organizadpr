// Base de datos en memoria para desarrollo sin PostgreSQL
const inMemoryDB = {
  users: [],
  activities: [],
  notifications: []
};

let currentId = 1;

const pool = {
  query: async (sql, params = []) => {
    console.log('Query:', sql.substring(0, 100), 'Params:', params);

    // Simular queries comunes
    if (sql.includes('SELECT') && sql.includes('users') && sql.includes('email')) {
      const email = params[0];
      const user = inMemoryDB.users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }

    if (sql.includes('INSERT INTO users')) {
      const user = {
        id: currentId++,
        name: params[0],
        email: params[1],
        password: params[2],
        created_at: new Date()
      };
      inMemoryDB.users.push(user);
      return { rows: [user] };
    }

    if (sql.includes('SELECT') && sql.includes('activities') && sql.includes('user_id')) {
      const userId = params[0];
      const activities = inMemoryDB.activities.filter(a => a.user_id === userId);
      return { rows: activities };
    }

    if (sql.includes('INSERT INTO activities')) {
      const activity = {
        id: currentId++,
        user_id: params[0],
        title: params[1],
        description: params[2],
        due_date: params[3],
        priority: params[4],
        category: params[5],
        status: params[6] || 'Pendiente',
        created_at: new Date(),
        updated_at: new Date()
      };
      inMemoryDB.activities.push(activity);
      return { rows: [activity] };
    }

    if (sql.includes('UPDATE activities') && sql.includes('status')) {
      const activityId = params[1];
      const newStatus = params[0];
      const activity = inMemoryDB.activities.find(a => a.id === parseInt(activityId));
      if (activity) {
        activity.status = newStatus;
        activity.updated_at = new Date();
        return { rows: [activity] };
      }
      return { rows: [] };
    }

    if (sql.includes('DELETE FROM activities')) {
      const activityId = params[0];
      const index = inMemoryDB.activities.findIndex(a => a.id === parseInt(activityId));
      if (index > -1) {
        inMemoryDB.activities.splice(index, 1);
        return { rowCount: 1 };
      }
      return { rowCount: 0 };
    }

    if (sql.includes('notifications')) {
      if (sql.includes('INSERT')) {
        const notification = {
          id: currentId++,
          user_id: params[0],
          activity_id: params[1],
          message: params[2],
          type: params[3],
          is_read: false,
          created_at: new Date()
        };
        inMemoryDB.notifications.push(notification);
        return { rows: [notification] };
      }
      if (sql.includes('SELECT')) {
        const userId = params[0];
        const notifications = inMemoryDB.notifications.filter(n => n.user_id === userId);
        return { rows: notifications };
      }
    }

    return { rows: [], rowCount: 0 };
  }
};

console.log('✓ Base de datos en memoria inicializada (mock para desarrollo)');

module.exports = pool;
