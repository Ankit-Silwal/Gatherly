import {Pool} from "pg";

export const pool=new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.DATABASE_NAME,
})

export const connectDB=async ():Promise<void>=>{
  try{
    await pool.query("Select 1");
    console.log("Postgres connected");
  }catch(error:any){
    console.log("There was as error",error);
    process.exit();
  }
}

export default pool;