# MongoDB Atlas Setup Guide

This guide covers creating a free Atlas cluster, connecting the app, setting up a least-privilege app user, enabling backups, and running the profiler.

---

## 1. Create a Free Cluster (M0)

1. Sign up at https://cloud.mongodb.com/
2. Create a new **Project** (e.g. `expense-tracker`)
3. Click **Build a Database** → choose **M0 Free** (shared) → select a region close to your users
4. Name the cluster (e.g. `expense-tracker-prod`)
5. Click **Create**

---

## 2. Create a Database User (Least-Privilege)

Never use the Atlas admin user in application code. Create a scoped user:

1. Left panel → **Database Access** → **Add New Database User**
2. Username: `expense_app_user`
3. Password: generate a strong random password (store it in a password manager)
4. Under **Database User Privileges**, choose **Custom Role**:
   - Database: `expense_tracker`
   - Actions: `find`, `insert`, `update`, `delete`, `aggregate`, `createIndex`
   - **Do NOT** grant `dropCollection`, `dropDatabase`, or `clusterAdmin`
5. Click **Add User**

### Minimal Atlas role via CLI (mongocli / atlascli)

```bash
atlas dbusers create readWriteAnyDatabase \
  --username expense_app_user \
  --password "$APP_DB_PASSWORD" \
  --role readWriteAnyDatabase@expense_tracker \
  --projectId <YOUR_PROJECT_ID>
```

---

## 3. Allow Network Access

1. Left panel → **Network Access** → **Add IP Address**
2. Development: add your current IP (`My current IP address`)
3. Production: add only the IP range of your server/container
4. **Never** use `0.0.0.0/0` in production — it exposes the cluster to the entire internet

---

## 4. Get the Connection String

1. Left panel → **Clusters** → click **Connect** on your cluster
2. Choose **Connect your application** → Driver: **Node.js** → Version: **5.x or later**
3. Copy the connection string — it looks like:

```
mongodb+srv://expense_app_user:<password>@cluster0.abc12.mongodb.net/expense_tracker?retryWrites=true&w=majority
```

4. Replace `<password>` with the actual password
5. Add to `backend/.env`:

```env
MONGO_URI=mongodb+srv://expense_app_user:YOURPASSWORD@cluster0.abc12.mongodb.net/expense_tracker?retryWrites=true&w=majority
```

> **Note:** Atlas M0 (free tier) does not support transactions or change streams. Upgrade to M10+ for those features. For local development with transactions, use the Docker Compose replica set.

---

## 5. Replica Set for Transactions

Atlas M10+ clusters are automatically configured as replica sets, so ACID transactions and change streams work out of the box.

For local development:

```bash
# Start a single-node replica set via Docker Compose
docker compose up -d mongodb

# Verify
mongosh "mongodb://localhost:27017" --eval "rs.status()"
```

---

## 6. Enable Atlas Backup

1. Left panel → **Clusters** → click **...** on your cluster → **Edit Configuration**
2. Under **Backup**, enable **Continuous Cloud Backup** (M10+ only) or **Basic Cloud Backup** for daily snapshots
3. Set retention to **7 days** minimum

### Manual backup with `mongodump`

```bash
# Dump the entire database
mongodump \
  --uri "mongodb+srv://expense_app_user:PASSWORD@cluster0.abc12.mongodb.net/expense_tracker" \
  --out ./backups/$(date +%Y-%m-%d)

# Restore from a backup
mongorestore \
  --uri "mongodb+srv://expense_app_user:PASSWORD@cluster0.abc12.mongodb.net/expense_tracker" \
  --drop \
  ./backups/2025-07-01/expense_tracker
```

---

## 7. Enable the Query Profiler

The profiler records slow operations. Use it to find missing indexes.

### On Atlas

1. Left panel → **Clusters** → **...** → **Profiler**
2. Filter by: `Duration > 100ms`, Collection: `transactions`
3. Slow queries appear with their full query shape and execution stats

### In the shell

```javascript
// Enable profiling for queries > 100 ms
db.setProfilingLevel(1, { slowms: 100 });

// Read recent slow operations
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty();

// Disable profiling
db.setProfilingLevel(0);
```

---

## 8. Create Atlas Search Index (Fuzzy Search)

Atlas M10+ supports Lucene-powered fuzzy search — better than the text index for misspelled queries.

Create an index via the Atlas UI:
- Collection: `transactions`
- Name: `transactions_fulltext`
- JSON definition:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "source": {
        "type": "string",
        "analyzer": "lucene.english"
      },
      "description": {
        "type": "string",
        "analyzer": "lucene.english"
      },
      "notes": {
        "type": "string",
        "analyzer": "lucene.english"
      },
      "tags": {
        "type": "string"
      },
      "userId": {
        "type": "objectId"
      }
    }
  }
}
```

Query with fuzzy matching:

```javascript
db.transactions.aggregate([
  {
    $search: {
      index: "transactions_fulltext",
      compound: {
        filter: [{ equals: { path: "userId", value: ObjectId("...") } }],
        should: [{
          text: {
            query: "cofee",  // typo intentional
            path: ["source", "description"],
            fuzzy: { maxEdits: 1 }
          }
        }]
      }
    }
  },
  { $limit: 10 }
])
```

---

## 9. Monitoring and Alerts

1. Left panel → **Monitoring** → view real-time metrics (operations/sec, connections, CPU)
2. Left panel → **Alerts** → configure alerts for:
   - `Connections > 80% of max`
   - `Query targeting ratio > 1000` (missing index indicator)
   - `Replication lag > 10s`

---

## 10. Production Checklist

- [ ] App user has only the minimum required permissions
- [ ] Network access restricted to production server IPs
- [ ] `MONGO_URI` stored as an environment secret (never committed to Git)
- [ ] Automated backups enabled with ≥ 7-day retention
- [ ] Query profiler reviewed for slow operations
- [ ] Index sync script run after deployment (`npm run inspect:indexes`)
- [ ] `retryWrites=true` in connection string (Atlas default)
- [ ] `w=majority` write concern for data durability
