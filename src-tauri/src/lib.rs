#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec![
    tauri_plugin_sql::Migration {
      version: 1,
      description: "core_workspace_and_configs",
      sql: include_str!("../../db/migrations/001_core_workspace_and_configs.sql"),
      kind: tauri_plugin_sql::MigrationKind::Up,
    },
    tauri_plugin_sql::Migration {
      version: 2,
      description: "projects_sections_tasks",
      sql: include_str!("../../db/migrations/002_projects_sections_tasks.sql"),
      kind: tauri_plugin_sql::MigrationKind::Up,
    },
    tauri_plugin_sql::Migration {
      version: 3,
      description: "notes_attachments_tags",
      sql: include_str!("../../db/migrations/003_notes_attachments_tags.sql"),
      kind: tauri_plugin_sql::MigrationKind::Up,
    },
    tauri_plugin_sql::Migration {
      version: 4,
      description: "settings_and_factory_options",
      sql: include_str!("../../db/migrations/004_settings_and_factory_options.sql"),
      kind: tauri_plugin_sql::MigrationKind::Up,
    },
    tauri_plugin_sql::Migration {
      version: 5,
      description: "seed_default_workspace",
      sql: include_str!("../../db/migrations/005_seed_default_workspace.sql"),
      kind: tauri_plugin_sql::MigrationKind::Up,
    },
  ];

  tauri::Builder::default()
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:product-dev-desk.db", migrations)
        .build(),
    )
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
