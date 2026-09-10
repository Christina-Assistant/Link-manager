use mysql::{params, prelude::Queryable, Pool};
use serde::Serialize;
use std::env;

#[derive(Serialize)]
pub struct Dashboard {
    pub users: u64,
    pub posts: u64,
    pub events: u64,
    pub listings: u64,
    pub reports: u64,
}

#[derive(Serialize)]
pub struct UserRow {
    pub id: u64,
    pub phone: String,
    pub nickname: String,
    pub city: String,
    pub is_verified: bool,
    pub created_at: String,
}

fn pool() -> Result<Pool, String> {
    let url = env::var("LINK_MANAGER_DATABASE_URL").map_err(|_| {
        "未配置 LINK_MANAGER_DATABASE_URL，请设置 MySQL 连接地址".to_string()
    })?;
    Pool::new(url.as_str()).map_err(|e| format!("连接 MySQL 失败: {e}"))
}

fn connection() -> Result<mysql::PooledConn, String> {
    pool()?.get_conn().map_err(|e| format!("获取 MySQL 连接失败: {e}"))
}

#[tauri::command]
pub fn database_health() -> Result<String, String> {
    let mut conn = connection()?;
    conn.query_first::<u8, _>("SELECT 1")
        .map_err(|e| format!("数据库检查失败: {e}"))?
        .ok_or_else(|| "数据库未返回结果".to_string())?;
    Ok("ok".to_string())
}

#[tauri::command]
pub fn admin_dashboard() -> Result<Dashboard, String> {
    let mut conn = connection()?;
    let count = |conn: &mut mysql::PooledConn, table: &str| -> Result<u64, String> {
        let sql = format!("SELECT COUNT(*) FROM `{table}`");
        conn.query_first::<u64, _>(sql)
            .map_err(|e| format!("统计 {table} 失败: {e}"))?
            .ok_or_else(|| format!("统计 {table} 未返回结果"))
    };
    Ok(Dashboard {
        users: count(&mut conn, "users")?,
        posts: count(&mut conn, "posts")?,
        events: count(&mut conn, "events")?,
        listings: count(&mut conn, "listings")?,
        reports: count(&mut conn, "reports")?,
    })
}

#[tauri::command]
pub fn admin_users(keyword: Option<String>, page: Option<u64>, page_size: Option<u64>) -> Result<serde_json::Value, String> {
    let mut conn = connection()?;
    let page = page.unwrap_or(1).max(1);
    let size = page_size.unwrap_or(20).clamp(1, 100);
    let keyword = keyword.unwrap_or_default();
    let like = format!("%{keyword}%");
    let total: u64 = conn
        .exec_first(
            "SELECT COUNT(*) FROM users WHERE nickname LIKE :q OR phone LIKE :q OR city LIKE :q",
            params! {"q" => &like},
        )
        .map_err(|e| format!("统计用户失败: {e}"))?
        .unwrap_or(0);
    let offset = (page - 1) * size;
    let rows: Vec<UserRow> = conn
        .exec_map(
            "SELECT id, phone, nickname, city, is_verified, CAST(created_at AS CHAR) \
             FROM users WHERE nickname LIKE :q OR phone LIKE :q OR city LIKE :q \
             ORDER BY created_at DESC LIMIT :size OFFSET :offset",
            params! {"q" => &like, "size" => size, "offset" => offset},
            |(id, phone, nickname, city, is_verified, created_at)| UserRow {
                id, phone, nickname, city, is_verified, created_at,
            },
        )
        .map_err(|e| format!("查询用户失败: {e}"))?;
    Ok(serde_json::json!({
        "items": rows,
        "pagination": {"page": page, "page_size": size, "total": total}
    }))
}
