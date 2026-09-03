#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
fn project_path() -> String { r"F:\AI\Link".to_string() }

#[tauri::command]
fn run_project_command(command: String) -> Result<String, String> {
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd").args(["/C", &command]).current_dir(r"F:\AI\Link").output()
    } else {
        Command::new("sh").args(["-c", &command]).current_dir(r"F:\AI\Link").output()
    }.map_err(|e| e.to_string())?;
    if output.status.success() { Ok(String::from_utf8_lossy(&output.stdout).to_string()) }
    else { Err(String::from_utf8_lossy(&output.stderr).to_string()) }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![project_path, run_project_command])
        .run(tauri::generate_context!())
        .expect("error while running Link Manager");
}
