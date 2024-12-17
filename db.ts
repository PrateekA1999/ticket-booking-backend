import { createPool } from "promise-mysql";

//For Mysql Database Connection
const pool = createPool({
  host: "database-2.cyqcgr13hnyn.ap-south-1.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "6134RN5PyMd13po8AukR",
  database: "test",
});

const db = { pool };

export default db;
